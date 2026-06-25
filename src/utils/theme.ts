export const colors = {
  // Primary brand
  primary: '#6C63FF',
  primaryDark: '#4F46E5',
  primaryLight: '#8B85FF',
  primaryMuted: 'rgba(108, 99, 255, 0.12)',

  // Accent
  accent: '#00D4AA',
  accentDark: '#00B893',

  // Background
  bg: '#0F0E17',
  bgCard: '#1A1929',
  bgElevated: '#22213A',
  bgInput: '#1E1D2E',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A09EB8',
  textMuted: '#6B6884',
  textInverse: '#0F0E17',

  // Semantic
  success: '#00D4AA',
  warning: '#FFB547',
  error: '#FF5C72',
  info: '#6C63FF',

  // Sections
  yesterday: '#00D4AA',
  today: '#6C63FF',
  blockers: '#FF5C72',

  // UI
  border: 'rgba(255,255,255,0.08)',
  borderFocus: '#6C63FF',
  divider: 'rgba(255,255,255,0.06)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, lineHeight: 19 },
  caption: { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.5 },
  label: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.8 },
};
