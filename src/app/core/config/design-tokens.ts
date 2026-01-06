/**
 * Design Tokens
 *
 * Centralized design tokens for the entire application.
 * These tokens are used in Tailwind config and components.
 *
 * Based on the Design System Configuration and Gemini 2.0 Flash Style.
 */

import {
  COLOR_SCHEMES,
  DARK_MODE_OVERRIDES,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  TRANSITIONS,
  ANIMATIONS,
  BREAKPOINTS,
  Z_INDEX
} from './design-system.config';

/**
 * Design Tokens Object
 *
 * This object contains all design tokens that can be used in:
 * - Tailwind CSS configuration
 * - Component styles
 * - TypeScript code
 */
export const DESIGN_TOKENS = {
  /**
   * Color Tokens
   * Based on color schemes and dark mode overrides
   */
  colors: {
    // Primary colors (from default scheme)
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#3b82f6', // Main primary color
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49',
    },
    // Secondary colors
    secondary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#8b5cf6', // Main secondary color
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
    },
    // Accent colors
    accent: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899', // Main accent color
      600: '#db2777',
      700: '#be185d',
      800: '#9f1239',
      900: '#831843',
    },
    // Success colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#10b981', // Main success color
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
    // Warning colors
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // Main warning color
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    // Error/Danger colors
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // Main error color
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    // Info colors
    info: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4', // Main info color
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
    },
    // Neutral/Gray colors
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },
    // Dark mode specific colors
    dark: {
      background: DARK_MODE_OVERRIDES.background,
      surface: DARK_MODE_OVERRIDES.surface,
      textPrimary: DARK_MODE_OVERRIDES.textPrimary,
      textSecondary: DARK_MODE_OVERRIDES.textSecondary,
      border: DARK_MODE_OVERRIDES.border,
    },
    // Light mode specific colors
    light: {
      background: '#f9fafb',
      surface: '#ffffff',
      textPrimary: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
    },
  },

  /**
   * Spacing Tokens
   * Used for padding, margin, gap, etc.
   */
  spacing: SPACING,

  /**
   * Typography Tokens
   * Font families, sizes, weights, line heights
   */
  typography: TYPOGRAPHY,

  /**
   * Border Radius Tokens
   * Used for rounded corners
   */
  borderRadius: BORDER_RADIUS,

  /**
   * Shadow Tokens
   * Used for box shadows and elevation
   */
  shadows: SHADOWS,

  /**
   * Transition Tokens
   * Used for animations and transitions
   */
  transitions: TRANSITIONS,

  /**
   * Animation Tokens
   * Predefined animation names
   */
  animations: ANIMATIONS,

  /**
   * Breakpoint Tokens
   * Used for responsive design
   */
  breakpoints: BREAKPOINTS,

  /**
   * Z-Index Tokens
   * Used for layering elements
   */
  zIndex: Z_INDEX,
};

/**
 * Color Scheme Tokens
 * Export color schemes for dynamic theme switching
 */
export { COLOR_SCHEMES, DARK_MODE_OVERRIDES };

/**
 * Helper function to get color from token
 *
 * @example
 * getColorToken('primary', 500) // Returns '#3b82f6'
 * getColorToken('success', 600) // Returns '#059669'
 */
export function getColorToken(
  colorName: keyof typeof DESIGN_TOKENS.colors,
  shade?: number | string
): string {
  const color = DESIGN_TOKENS.colors[colorName];

  if (typeof color === 'object' && shade !== undefined) {
    return (color as any)[shade] || '';
  }

  if (typeof color === 'string') {
    return color;
  }

  // Default to 500 shade if available
  if (typeof color === 'object' && '500' in color) {
    return (color as any)['500'];
  }

  return '';
}

/**
 * Helper function to get spacing token
 *
 * @example
 * getSpacingToken('md') // Returns '1rem'
 * getSpacingToken('lg') // Returns '1.5rem'
 */
export function getSpacingToken(size: keyof typeof SPACING): string {
  return SPACING[size] || '';
}

/**
 * Helper function to get typography token
 *
 * @example
 * getTypographyToken('fontSize', 'lg') // Returns '1.125rem'
 * getTypographyToken('fontFamily', 'sans') // Returns font family string
 */
export function getTypographyToken(
  category: keyof typeof TYPOGRAPHY,
  key: string
): string {
  const categoryValue = TYPOGRAPHY[category];
  if (typeof categoryValue === 'object' && key in categoryValue) {
    return (categoryValue as any)[key];
  }
  return '';
}
