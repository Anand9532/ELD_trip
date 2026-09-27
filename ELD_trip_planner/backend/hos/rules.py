"""
FMCSA Hours of Service constants for the property-carrying driver, 70hr/8day cycle.
Assumptions per the assessment:
  - No adverse driving conditions
  - 1 hour for pickup, 1 hour for dropoff
  - Fueling at least once every 1,000 miles
"""

# Driving / duty
MAX_DRIVING_HOURS_PER_WINDOW = 11.0       # 11-hour driving limit
MAX_DUTY_WINDOW_HOURS = 14.0              # 14-hour driving window
REQUIRED_OFF_DUTY_RESET_HOURS = 10.0      # 10 consecutive off-duty hours to reset

# 30-minute break after 8 cumulative driving hours
DRIVING_HOURS_BEFORE_BREAK = 8.0
BREAK_DURATION_HOURS = 0.5

# Cycle
MAX_CYCLE_HOURS = 70.0                    # 70 hours / 8 days
CYCLE_RESTART_HOURS = 34.0                # 34-hour restart (informational)

# Trip-specific assumptions
PICKUP_DURATION_HOURS = 1.0
DROPOFF_DURATION_HOURS = 1.0
FUELING_INTERVAL_MILES = 1000.0
FUELING_DURATION_HOURS = 0.25             # 15 minutes per fuel stop (on-duty not driving)

# Duty status enum
OFF_DUTY = 'OFF_DUTY'
SLEEPER_BERTH = 'SLEEPER_BERTH'
DRIVING = 'DRIVING'
ON_DUTY_NOT_DRIVING = 'ON_DUTY_NOT_DRIVING'

# Event subtypes (for richer UI labels) — all map to one of the four duty statuses above
EVENT_LABELS = {
    'PICKUP': ON_DUTY_NOT_DRIVING,
    'DROPOFF': ON_DUTY_NOT_DRIVING,
    'FUEL': ON_DUTY_NOT_DRIVING,
    'DRIVING': DRIVING,
    'BREAK_30': OFF_DUTY,        # 30-min break taken off duty
    'REST_10': OFF_DUTY,         # 10-hour reset taken off duty (could be sleeper berth)
    'OFF_DUTY': OFF_DUTY,
}
