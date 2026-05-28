export const Colors = {
  background: '#0A0E1A',
  surface: '#141828',
  surfaceElevated: '#1E2438',
  border: '#2A3050',
  borderBright: '#3A4470',

  primary: '#00D4FF',
  primaryDim: '#0088AA',
  primaryGlow: 'rgba(0, 212, 255, 0.15)',
  secondary: '#7B2FBE',
  accent: '#FF6B35',
  accentGlow: 'rgba(255, 107, 53, 0.15)',
  success: '#00E676',
  warning: '#FFB300',
  error: '#FF3D71',

  text: '#E8EEFF',
  textMuted: '#8892B0',
  textDim: '#4A5568',

  gradientPrimary: ['#0A0E1A', '#0D1429'],
  gradientCard: ['rgba(20, 24, 40, 0.9)', 'rgba(10, 14, 26, 0.9)'],
  gradientAccent: ['#00D4FF', '#0088AA'],
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
