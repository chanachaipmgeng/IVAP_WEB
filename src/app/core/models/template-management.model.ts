/**
 * Template Management Models
 * Models สำหรับ Template Management (Themes, Templates, Color Palettes)
 */

export type TemplateType = 'page' | 'component' | 'layout' | 'email' | 'report';
export type ThemeType = 'light' | 'dark' | 'auto' | 'custom';
export type ColorPaletteType = 'primary' | 'secondary' | 'accent' | 'neutral' | 'semantic' | 'custom';
export type ColorVariantType = 'light' | 'dark' | 'hover' | 'active' | 'disabled' | 'focus';
export type TemplateVariableType = 'text' | 'number' | 'boolean' | 'color' | 'image' | 'url' | 'select';

/**
 * Template Model
 */
export interface Template {
  id: string;
  companyId?: string;
  name: string;
  displayName: string;
  description: string;
  type: TemplateType;
  category: string;
  isActive: boolean;
  isPublic: boolean;
  isSystemTemplate?: boolean;
  theme: string; // Theme ID
  content: TemplateContent;
  variables: TemplateVariable[];
  defaultValues?: Record<string, any>;
  preview: {
    image: string;
    thumbnail: string;
    description: string;
  };
  usage: {
    instances: number;
    lastUsed: Date | string;
    usageCount: number;
  };
  metadata: {
    createdBy: string;
    tags: string[];
    version: string;
    compatibility: string[];
    dependencies: string[];
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Template Content Model
 */
export interface TemplateContent {
  html: string;
  css: string;
  assets: TemplateAsset[];
}

/**
 * Template Asset Model
 */
export interface TemplateAsset {
  id: string;
  type: 'image' | 'video' | 'audio' | 'font' | 'icon' | 'other';
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

/**
 * Template Variable Model
 */
export interface TemplateVariable {
  id: string;
  name: string;
  type: TemplateVariableType;
  defaultValue: any;
  required: boolean;
  description: string;
  options?: any[]; // For select type
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

/**
 * Template Metrics Model
 */
export interface TemplateMetrics {
  totalThemes: number;
  totalTemplates: number;
  totalColorPalettes: number;
  activeThemes: number;
  activeTemplates: number;
  activeColorPalettes?: number;
  themeUsage?: { [key: string]: number };
  templateUsage?: { [key: string]: number };
  colorPaletteUsage?: { [key: string]: number };
  mostUsedTemplates?: { [key: string]: number };
  averageTemplateSize?: number;
  totalAssets?: number;
  usageStats: {
    mostUsedTemplate: string;
    mostUsedTheme: string;
    totalUsage: number;
  };
}

/**
 * Theme Model
 */
export interface Theme {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: ThemeType;
  isActive: boolean;
  isDefault: boolean;
  colorPalette: string; // Color palette ID
  typography: TypographySettings;
  spacing: SpacingSettings;
  components: ComponentSettings;
  layout: LayoutSettings;
  animations: AnimationSettings;
  usage: {
    users: string[];
    pages: string[];
    lastUsed: Date | string;
    usageCount: number;
  };
  metadata: {
    createdBy: string;
    tags: string[];
    version: string;
    compatibility: string[];
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Typography Settings Model
 */
export interface TypographySettings {
  fontFamily: {
    primary: string;
    secondary: string;
    monospace: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
  };
}

/**
 * Spacing Settings Model
 */
export interface SpacingSettings {
  base: number; // Base spacing unit in pixels
  scale: number; // Scale factor for spacing
  breakpoints: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
  };
  padding: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  margin: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

/**
 * Component Settings Model
 */
export interface ComponentSettings {
  button: {
    borderRadius: string;
    padding: string;
    fontSize: string;
    fontWeight?: number;
    minHeight?: string;
    transition?: string;
  };
  buttons?: {
    borderRadius: string;
    padding: string;
    fontSize: string;
  };
  cards: {
    borderRadius: string;
    shadow: string;
    padding: string;
    borderWidth?: string;
  };
  input: {
    borderRadius: string;
    borderWidth: string;
    padding: string;
    fontSize?: string;
    focusRingWidth?: string;
    transition?: string;
  };
  inputs?: {
    borderRadius: string;
    borderWidth: string;
    padding: string;
  };
  modals: {
    borderRadius: string;
    backdrop: string;
    padding: string;
    maxWidth?: string;
    backdropBlur?: string;
  };
}

/**
 * Layout Settings Model
 */
export interface LayoutSettings {
  container: {
    maxWidth: string;
    padding: string;
    margin?: string;
  };
  grid: {
    columns: number;
    gap: string;
    breakpoints?: { [key: string]: number };
  };
  sidebar: {
    width: string;
    collapsedWidth: string;
    transition?: string;
  };
  header: {
    height: string;
    sticky?: boolean;
    padding?: string;
    shadow?: string;
  };
}

/**
 * Animation Settings Model
 */
export interface AnimationSettings {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    linear?: string;
    ease?: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
  transitions: {
    fade: string;
    slide: string;
    scale: string;
    transform: string;
    opacity: string;
    color?: string;
    background?: string;
  };
}

/**
 * Color Palette Model
 */
export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  type: ColorPaletteType;
  colors: Color[];
  isDefault: boolean;
  isActive: boolean;
  usage: {
    components: string[];
    pages: string[];
    lastUsed: Date | string;
    usageCount: number;
  };
  metadata: {
    createdBy: string;
    tags: string[];
    version: string;
    compatibility: string[];
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Color Model
 */
export interface Color {
  id: string;
  name: string;
  value: string; // Hex color value
  rgb: {
    r: number;
    g: number;
    b: number;
  };
  hsl: {
    h: number;
    s: number;
    l: number;
  };
  alpha: number; // 0-1
  usage: string; // e.g., 'primary', 'background', 'text'
  description: string;
  isCustom: boolean;
  variants: ColorVariant[];
}

/**
 * Color Variant Model
 */
export interface ColorVariant {
  id: string;
  name: string;
  value: string;
  type: ColorVariantType;
  opacity: number;
  description: string;
}

