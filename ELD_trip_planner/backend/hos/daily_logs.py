"""
Convert a flat event timeline into per-day RODS logs.
Each daily log contains:
  - log_date (YYYY-MM-DD, UTC)
  - segments: list of {status, start_hour, end_hour, label} where hours are floats 0..24
  - totals: hours per duty status (should sum to 24)
  - remarks: list of {time, text}
  - total_miles: miles driven that calendar day
"""
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any

from .rules import DRIVING, OFF_DUTY, ON_DUTY_NOT_DRIVING, SLEEPER_BERTH


def _parse(iso: str) -> datetime:
    # Stored as 'YYYY-MM-DDTHH:MM:SSZ'
    return datetime.strptime(iso, '%Y-%m-%dT%H:%M:%SZ').replace(tzinfo=timezone.utc)


def _hour_of_day(dt: datetime) -> float:
    return dt.hour + dt.minute / 60.0 + dt.second / 3600.0


def _date_str(dt: datetime) -> str:
    return dt.strftime('%Y-%m-%d')


def build_daily_logs(events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    if not events:
        return []

    # 1. Split events that cross midnight (UTC)
    split_events = []
    for ev in events:
        start = _parse(ev['start'])
        end = _parse(ev['end'])
        cur_start = start
        while cur_start.date() < end.date():
            # break at the next UTC midnight
            next_midnight = datetime(cur_start.year, cur_start.month, cur_start.day,
                                     tzinfo=timezone.utc) + timedelta(days=1)
            split_events.append({
                **ev,
                'start': cur_start.strftime('%Y-%m-%dT%H:%M:%SZ'),
                'end': next_midnight.strftime('%Y-%m-%dT%H:%M:%SZ'),
                'duration_hours': (next_midnight - cur_start).total_seconds() / 3600.0,
                # Miles are roughly proportioned to time within the original event
                'miles': ev['miles'] * ((next_midnight - cur_start).total_seconds()
                                        / max((end - start).total_seconds(), 1)),
            })
            cur_start = next_midnight
        # Last piece up to original end
        split_events.append({
            **ev,
            'start': cur_start.strftime('%Y-%m-%dT%H:%M:%SZ'),
            'end': end.strftime('%Y-%m-%dT%H:%M:%SZ'),
            'duration_hours': (end - cur_start).total_seconds() / 3600.0,
            'miles': ev['miles'] * ((end - cur_start).total_seconds()
                                    / max((end - start).total_seconds(), 1)),
        })

    # 2. Group by date
    days: Dict[str, List[Dict[str, Any]]] = {}
    for ev in split_events:
        d = _date_str(_parse(ev['start']))
        days.setdefault(d, []).append(ev)

    # 3. Build daily log objects
    daily_logs = []
    for log_date in sorted(days.keys()):
        day_events = sorted(days[log_date], key=lambda e: e['start'])
        segments = []
        remarks = []
        totals = {DRIVING: 0.0, OFF_DUTY: 0.0, ON_DUTY_NOT_DRIVING: 0.0, SLEEPER_BERTH: 0.0}
        miles = 0.0

        # Fill gaps with OFF_DUTY so day totals to 24h
        cursor = 0.0  # hours from 00:00
        for ev in day_events:
            ev_start = _hour_of_day(_parse(ev['start']))
            ev_end = _hour_of_day(_parse(ev['end']))
            # Handle end exactly at next midnight (24.0)
            if ev_end == 0 and ev['end'].endswith('00:00:00Z') and ev_start > 0:
                ev_end = 24.0

            if ev_start > cursor + 1e-6:
                # gap
                segments.append({
                    'status': OFF_DUTY,
                    'start_hour': round(cursor, 4),
                    'end_hour': round(ev_start, 4),
                    'label': 'Off duty',
                })
                totals[OFF_DUTY] += ev_start - cursor

            segments.append({
                'status': ev['status'],
                'start_hour': round(ev_start, 4),
                'end_hour': round(ev_end, 4),
                'label': _label_for(ev),
            })
            totals[ev['status']] = totals.get(ev['status'], 0) + (ev_end - ev_start)
            miles += ev.get('miles', 0) or 0
            cursor = ev_end

            # Remarks at status changes
            remarks.append({
                'time_hour': round(ev_start, 4),
                'text': _remark_for(ev),
            })

        if cursor < 24.0 - 1e-6:
            segments.append({
                'status': OFF_DUTY,
                'start_hour': round(cursor, 4),
                'end_hour': 24.0,
                'label': 'Off duty',
            })
            totals[OFF_DUTY] += 24.0 - cursor

        daily_logs.append({
            'log_date': log_date,
            'segments': segments,
            'totals': {k: round(v, 2) for k, v in totals.items()},
            'remarks': remarks,
            'total_miles': round(miles, 2),
        })

    return daily_logs


def _label_for(ev: Dict[str, Any]) -> str:
    mapping = {
        'PICKUP': 'Pickup (on duty)',
        'DROPOFF': 'Dropoff (on duty)',
        'FUEL': 'Fuel stop',
        'DRIVING': 'Driving',
        'BREAK_30': '30-min break',
        'REST_10': '10-hour rest',
        'OFF_DUTY': 'Off duty',
    }
    return mapping.get(ev.get('type', ''), ev.get('type', ''))


def _remark_for(ev: Dict[str, Any]) -> str:
    loc = ev.get('location') or ''
    label = _label_for(ev)
    return f'{label} — {loc}' if loc else label
