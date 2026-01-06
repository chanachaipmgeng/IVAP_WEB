/**
 * Design System Configuration
 * ระบบออกแบบที่ครอบคลุมสำหรับ UI ทั้งหมด
 */

export interface ColorScheme {
  id: string;
  name: string;
  nameTh: string;
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
}

export const COLOR_SCHEMES: ColorScheme[] = [
  {
    id: 'default',
    name: 'Default Blue',
    nameTh: 'สีน้ำเงินมาตรฐาน',
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#EC4899',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB'
  },
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    nameTh: 'ท้องทะเลสดใส',
    primary: '#0EA5E9',
    secondary: '#06B6D4',
    accent: '#14B8A6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    background: '#F0F9FF',
    surface: '#FFFFFF',
    textPrimary: '#0C4A6E',
    textSecondary: '#64748B',
    border: '#BAE6FD'
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    nameTh: 'ส้มพระอาทิตย์ตก',
    primary: '#F97316',
    secondary: '#FB923C',
    accent: '#FBBF24',
    success: '#10B981',
    warning: '#EAB308',
    error: '#DC2626',
    info: '#3B82F6',
    background: '#FFF7ED',
    surface: '#FFFFFF',
    textPrimary: '#7C2D12',
    textSecondary: '#78716C',
    border: '#FDBA74'
  },
  {
    id: 'forest',
    name: 'Forest Green',
    nameTh: 'เขียวป่าไม้',
    primary: '#059669',
    secondary: '#10B981',
    accent: '#34D399',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    background: '#F0FDF4',
    surface: '#FFFFFF',
    textPrimary: '#064E3B',
    textSecondary: '#6B7280',
    border: '#BBF7D0'
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    nameTh: 'ม่วงราชวงศ์',
    primary: '#9333EA',
    secondary: '#A855F7',
    accent: '#C084FC',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    background: '#FAF5FF',
    surface: '#FFFFFF',
    textPrimary: '#581C87',
    textSecondary: '#6B7280',
    border: '#E9D5FF'
  },
  {
    id: 'rose',
    name: 'Rose Pink',
    nameTh: 'ชมพูกุหลาบ',
    primary: '#E11D48',
    secondary: '#F43F5E',
    accent: '#FB7185',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#DC2626',
    info: '#3B82F6',
    background: '#FFF1F2',
    surface: '#FFFFFF',
    textPrimary: '#881337',
    textSecondary: '#6B7280',
    border: '#FECDD3'
  }
];

export const DARK_MODE_OVERRIDES = {
  background: '#111827',
  surface: '#1F2937',
  textPrimary: '#F9FAFB',
  textSecondary: '#D1D5DB',
  border: '#374151'
};

export const TYPOGRAPHY = {
  fontFamily: {
    sans: "'Noto Sans', 'Noto Sans Thai', 'Poppins', 'Kanit', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    english: "'Poppins', 'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    thai: "'Kanit', 'Noto Sans Thai', 'Noto Sans', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace"
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800'
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
    loose: '2'
  }
};

export const SPACING = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
};

export const BORDER_RADIUS = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px'
};

export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none'
};

export const TRANSITIONS = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
};

export const ANIMATIONS = {
  fadeIn: 'fadeIn 300ms ease-in-out',
  fadeOut: 'fadeOut 300ms ease-in-out',
  slideInLeft: 'slideInLeft 300ms ease-out',
  slideInRight: 'slideInRight 300ms ease-out',
  slideInUp: 'slideInUp 300ms ease-out',
  slideInDown: 'slideInDown 300ms ease-out',
  scaleIn: 'scaleIn 200ms ease-out',
  scaleOut: 'scaleOut 200ms ease-in',
  spin: 'spin 1s linear infinite',
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  bounce: 'bounce 1s infinite',
};

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070
};

