"""
HOS simulation engine.

Approach:
  - Model the trip as a sequence of timed events on a single timeline.
  - At each step, advance driving in small slices so we can interleave required
    breaks (30-min after 8 cumulative driving hours) and 10-hour resets (after
    11 driving hours or end of 14-hour duty window) and fueling (every 1,000 miles).
  - Pickup and dropoff are 1 hour on-duty (not driving) blocks at the right legs.
  - The 70-hour / 8-day cycle is tracked: if remaining cycle is exhausted,
    a 34-hour restart is inserted (the assessment does not deeply require this,
    but the engine handles it for safety).

This is intentionally deterministic and easy to reason about — perfect for a
take-home assessment. Tweak as needed.
"""
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from typing import List, Dict, Any

from .rules import (
    MAX_DRIVING_HOURS_PER_WINDOW,
    MAX_DUTY_WINDOW_HOURS,
    REQUIRED_OFF_DUTY_RESET_HOURS,
    DRIVING_HOURS_BEFORE_BREAK,
    BREAK_DURATION_HOURS,
    MAX_CYCLE_HOURS,
    CYCLE_RESTART_HOURS,
    PICKUP_DURATION_HOURS,
    DROPOFF_DURATION_HOURS,
    FUELING_INTERVAL_MILES,
    FUELING_DURATION_HOURS,
    DRIVING,
    OFF_DUTY,
    ON_DUTY_NOT_DRIVING,
    EVENT_LABELS,
)


@dataclass
class Event:
    type: str            # one of EVENT_LABELS keys: PICKUP, DROPOFF, FUEL, DRIVING, BREAK_30, REST_10, OFF_DUTY
    status: str          # duty status: OFF_DUTY, SLEEPER_BERTH, DRIVING, ON_DUTY_NOT_DRIVING
    start: str           # ISO 8601 UTC
    end: str             # ISO 8601 UTC
    duration_hours: float
    miles: float = 0.0
    location: str = ''
    notes: str = ''


def _iso(dt: datetime) -> str:
    return dt.strftime('%Y-%m-%dT%H:%M:%SZ')


def _add_event(events: List[Event], etype: str, start: datetime, hours: float,
               miles: float = 0.0, location: str = '', notes: str = '') -> datetime:
    status = EVENT_LABELS[etype]
    end = start + timedelta(hours=hours)
    events.append(Event(
        type=etype,
        status=status,
        start=_iso(start),
        end=_iso(end),
        duration_hours=round(hours, 4),
        miles=round(miles, 2),
        location=location,
        notes=notes,
    ))
    return end


def simulate_trip(
    leg1_miles: float,
    leg1_duration_min: float,
    leg2_miles: float,
    leg2_duration_min: float,
    start_time: datetime,
    current_cycle_used_hours: float,
    current_location: str,
    pickup_location: str,
    dropoff_location: str,
) -> Dict[str, Any]:
    """
    Returns:
      {
        'events': [Event dicts...],
        'summary': {
          'total_driving_hours': ...,
          'total_on_duty_hours': ...,
          'total_off_duty_hours': ...,
          'total_miles': ...,
          'total_trip_hours': ...,
        }
      }
    """
    events: List[Event] = []

    # Trackers — reset by a 10-hour off-duty period
    driving_in_window = 0.0     # 11-hour driving cap
    on_clock_in_window = 0.0    # 14-hour duty window
    driving_since_break = 0.0   # 8-hour cumulative driving before 30-min break

    # Cycle tracker — only reset by 34-hour off-duty
    cycle_used = float(current_cycle_used_hours)

    miles_since_fuel = 0.0
    now = start_time

    # ---- Helpers --------------------------------------------------------

    def take_rest_10(t: datetime, reason: str) -> datetime:
        nonlocal driving_in_window, on_clock_in_window, driving_since_break
        new_t = _add_event(events, 'REST_10', t, REQUIRED_OFF_DUTY_RESET_HOURS,
                           notes=reason)
        driving_in_window = 0.0
        on_clock_in_window = 0.0
        driving_since_break = 0.0
        return new_t

    def take_break_30(t: datetime) -> datetime:
        nonlocal driving_since_break, on_clock_in_window
        new_t = _add_event(events, 'BREAK_30', t, BREAK_DURATION_HOURS,
                           notes='Required 30-minute break after 8h driving')
        driving_since_break = 0.0
        # 14-hour duty window CONTINUES through a 30-min break (break is not 10h off)
        on_clock_in_window += BREAK_DURATION_HOURS
        return new_t

    def take_cycle_restart(t: datetime) -> datetime:
        nonlocal driving_in_window, on_clock_in_window, driving_since_break, cycle_used
        new_t = _add_event(events, 'REST_10', t, CYCLE_RESTART_HOURS,
                           notes='34-hour cycle restart (70hr/8day limit reached)')
        # We log the type as REST_10 (off-duty) but duration is 34h.
        # We update its event in-place to make the duration accurate:
        events[-1].type = 'OFF_DUTY'
        events[-1].duration_hours = CYCLE_RESTART_HOURS
        driving_in_window = 0.0
        on_clock_in_window = 0.0
        driving_since_break = 0.0
        cycle_used = 0.0
        return new_t

    def on_duty_block(t: datetime, etype: str, hours: float, location: str, notes: str = '') -> datetime:
        nonlocal on_clock_in_window, cycle_used
        # Ensure we have cycle hours; if not, restart
        if cycle_used + hours > MAX_CYCLE_HOURS:
            t = take_cycle_restart(t)
        # Ensure duty window has room
        if on_clock_in_window + hours > MAX_DUTY_WINDOW_HOURS:
            t = take_rest_10(t, '10-hour reset to start new duty window')
        new_t = _add_event(events, etype, t, hours, location=location, notes=notes)
        on_clock_in_window += hours
        cycle_used += hours
        return new_t

    def drive_segment(t: datetime, total_miles: float, total_duration_hours: float,
                      leg_from: str, leg_to: str) -> datetime:
        """Drive a leg, slicing as needed for breaks/resets/fuel stops."""
        nonlocal driving_in_window, on_clock_in_window, driving_since_break
        nonlocal cycle_used, miles_since_fuel

        if total_duration_hours <= 0 or total_miles <= 0:
            return t

        # average MPH for this leg (used to convert hours <-> miles)
        avg_mph = total_miles / total_duration_hours if total_duration_hours > 0 else 50.0

        remaining_hours = total_duration_hours
        remaining_miles = total_miles

        while remaining_hours > 1e-6:
            # If cycle is exhausted, do a 34-hour restart
            if cycle_used >= MAX_CYCLE_HOURS - 1e-6:
                t = take_cycle_restart(t)

            # If we hit the 11-hour or 14-hour window, take 10-hour reset
            if (driving_in_window >= MAX_DRIVING_HOURS_PER_WINDOW - 1e-6
                    or on_clock_in_window >= MAX_DUTY_WINDOW_HOURS - 1e-6):
                t = take_rest_10(t, '10-hour off-duty reset')

            # If we hit 8 cumulative driving hours, take 30-min break first
            if driving_since_break >= DRIVING_HOURS_BEFORE_BREAK - 1e-6:
                t = take_break_30(t)

            # Compute hours we can drive in this slice
            hours_until_drive_cap = MAX_DRIVING_HOURS_PER_WINDOW - driving_in_window
            hours_until_window_cap = MAX_DUTY_WINDOW_HOURS - on_clock_in_window
            hours_until_break = DRIVING_HOURS_BEFORE_BREAK - driving_since_break
            hours_until_cycle = MAX_CYCLE_HOURS - cycle_used
            miles_until_fuel = FUELING_INTERVAL_MILES - miles_since_fuel
            hours_until_fuel = miles_until_fuel / avg_mph if avg_mph > 0 else remaining_hours

            slice_hours = min(
                remaining_hours,
                hours_until_drive_cap,
                hours_until_window_cap,
                hours_until_break,
                hours_until_cycle,
                hours_until_fuel,
            )
            slice_hours = max(slice_hours, 1e-6)

            slice_miles = slice_hours * avg_mph
            slice_miles = min(slice_miles, remaining_miles)

            t = _add_event(
                events, 'DRIVING', t, slice_hours, miles=slice_miles,
                location=f'En route {leg_from} → {leg_to}',
                notes='',
            )
            driving_in_window += slice_hours
            on_clock_in_window += slice_hours
            driving_since_break += slice_hours
            cycle_used += slice_hours
            miles_since_fuel += slice_miles
            remaining_hours -= slice_hours
            remaining_miles -= slice_miles

            # Fuel stop if interval reached
            if miles_since_fuel >= FUELING_INTERVAL_MILES - 1e-6 and remaining_hours > 1e-6:
                t = on_duty_block(t, 'FUEL', FUELING_DURATION_HOURS,
                                  location=f'Fuel stop between {leg_from} and {leg_to}',
                                  notes='Fueling (every 1,000 miles)')
                miles_since_fuel = 0.0

        return t

    # ---- Build the trip -------------------------------------------------

    # 1. Drive from current location to pickup
    now = drive_segment(now, leg1_miles, leg1_duration_min / 60.0,
                        current_location, pickup_location)

    # 2. Pickup — 1 hour on-duty not driving
    now = on_duty_block(now, 'PICKUP', PICKUP_DURATION_HOURS,
                        location=pickup_location, notes='Pickup loading')

    # 3. Drive from pickup to dropoff
    now = drive_segment(now, leg2_miles, leg2_duration_min / 60.0,
                        pickup_location, dropoff_location)

    # 4. Dropoff — 1 hour on-duty not driving
    now = on_duty_block(now, 'DROPOFF', DROPOFF_DURATION_HOURS,
                        location=dropoff_location, notes='Dropoff unloading')

    # ---- Summary --------------------------------------------------------

    summary = {
        'total_driving_hours': round(sum(e.duration_hours for e in events if e.status == DRIVING), 2),
        'total_on_duty_hours': round(sum(e.duration_hours for e in events if e.status == ON_DUTY_NOT_DRIVING), 2),
        'total_off_duty_hours': round(sum(e.duration_hours for e in events if e.status == OFF_DUTY), 2),
        'total_miles': round(sum(e.miles for e in events), 2),
        'total_trip_hours': round(sum(e.duration_hours for e in events), 2),
        'cycle_used_after_trip': round(cycle_used, 2),
    }

    return {
        'events': [asdict(e) for e in events],
        'summary': summary,
    }
