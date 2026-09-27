/**
 * Spotter.ai brand palette
 * @see https://careers.spotter.ai/ | https://spotter.ai/
 */
export const spotter = {
  /** Deep header / primary surface */
  teal900: '#002A33',
  teal800: '#00333E',
  teal700: '#003D4C',
  teal600: '#004A58',
  /** Logo mint dot — primary accent */
  mint: '#4DC9B1',
  mintLight: '#6DD4C0',
  /** Logo coral dot — secondary accent / alerts */
  coral: '#E85D56',
  coralLight: '#F07A74',
  white: '#FFFFFF',
  textMuted: '#8FAFB8',
  textSecondary: '#94B8C0',
} as const;

/** Chart / map colors — use these instead of hardcoded hex */
export const chartColors = {
  driving: spotter.mint,
  onDuty: '#F59E0B',
  offDuty: spotter.textMuted,
  sleeper: '#5B9BD5',
  pickup: spotter.mint,
  dropoff: spotter.coral,
  fuel: '#F59E0B',
  break: '#5B9BD5',
  rest: spotter.textMuted,
  cycle: spotter.mint,
  fuelBar: '#F59E0B',
} as const;
