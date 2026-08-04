import { colors } from './colors';

export const typography = {
  logo: {
    fontSize: 24,
    fontWeight: '800' as const,
    letterSpacing: 2,
    color: colors.textPrimary,
  },
  h1: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  h3: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: colors.textPrimary,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
  small: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
} as const;
