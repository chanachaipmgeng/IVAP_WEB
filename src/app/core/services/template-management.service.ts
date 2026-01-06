import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Template,
  TemplateContent,
  TemplateAsset,
  TemplateVariable,
  TemplateMetrics,
  Theme,
  TypographySettings,
  SpacingSettings,
  ComponentSettings,
  LayoutSettings,
  AnimationSettings,
  ColorPalette,
  Color,
  ColorVariant
} from '../models/template-management.model';

// Re-export for backward compatibility
export type {
  Template,
  TemplateContent,
  TemplateAsset,
  TemplateVariable,
  TemplateMetrics,
  Theme,
  TypographySettings,
  SpacingSettings,
  ComponentSettings,
  LayoutSettings,
  AnimationSettings,
  ColorPalette,
  Color,
  ColorVariant
};

@Injectable({
  providedIn: 'root'
})
export class TemplateManagementService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/templates`;

  // ✅ Signals for reactive state
  private _themes = signal<Theme[]>([]);
  private _colorPalettes = signal<ColorPalette[]>([]);
  private _templates = signal<Template[]>([]);
  private _metrics = signal<TemplateMetrics>(this.getDefaultMetrics());

  // ✅ Readonly signals for public access
  public readonly themes = this._themes.asReadonly();
  public readonly colorPalettes = this._colorPalettes.asReadonly();
  public readonly templates = this._templates.asReadonly();
  public readonly metrics = this._metrics.asReadonly();

  // ✅ Computed signals for derived state
  public readonly themesCount = computed(() => this._themes().length);
  public readonly activeTheme = computed(() => this._themes().find(t => t.isActive));
  public readonly templatesCount = computed(() => this._templates().length);
  public readonly activeTemplatesCount = computed(() => this._templates().filter(t => t.isActive).length);

  // ✅ Observable compatibility layer (for backward compatibility)
  public themes$ = new Observable<Theme[]>(observer => {
    observer.next(this._themes());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public colorPalettes$ = new Observable<ColorPalette[]>(observer => {
    observer.next(this._colorPalettes());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public templates$ = new Observable<Template[]>(observer => {
    observer.next(this._templates());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public metrics$ = new Observable<TemplateMetrics>(observer => {
    observer.next(this._metrics());
    // Note: This is a compatibility layer - prefer using signals directly
  });

  constructor() {
    // Initialize with empty data, load from API when needed
  }

  /**
   * Get all themes
   */
  getThemes(): Theme[] {
    return this._themes();
  }

  /**
   * Get active theme
   */
  getActiveTheme(): Theme | undefined {
    return this.activeTheme();
  }

  /**
   * Create theme
   */
  createTheme(theme: Omit<Theme, 'id' | 'createdAt' | 'updatedAt' | 'usage'>): Theme {
    const newTheme: Theme = {
      ...theme,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      usage: {
        users: [],
        pages: [],
        lastUsed: new Date(),
        usageCount: 0
      }
    };

    this._themes.update(themes => [...themes, newTheme]);

    this.updateMetrics();
    return newTheme;
  }

  /**
   * Update theme
   */
  updateTheme(themeId: string, updates: Partial<Theme>): boolean {
    let updated = false;
    this._themes.update(themes => {
      const theme = themes.find(t => t.id === themeId);
      if (!theme) return themes;

      Object.assign(theme, updates);
      theme.updatedAt = new Date();
      updated = true;
      return [...themes];
    });

    if (updated) {
      this.updateMetrics();
    }
    return updated;
  }

  /**
   * Activate theme
   */
  activateTheme(themeId: string): boolean {
    let activated = false;
    this._themes.update(themes => {
      // Deactivate all themes
      themes.forEach(t => t.isActive = false);

      // Activate selected theme
      const theme = themes.find(t => t.id === themeId);
      if (!theme) return themes;

      theme.isActive = true;
      theme.usage.lastUsed = new Date();
      theme.usage.usageCount++;
      activated = true;
      return [...themes];
    });

    if (activated) {
      this.updateMetrics();
    }
    return activated;
  }

  /**
   * Get color palettes
   */
  getColorPalettes(): ColorPalette[] {
    return this._colorPalettes();
  }

  /**
   * Create color palette
   */
  createColorPalette(palette: Omit<ColorPalette, 'id' | 'createdAt' | 'updatedAt' | 'usage'>): ColorPalette {
    const newPalette: ColorPalette = {
      ...palette,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      usage: {
        components: [],
        pages: [],
        lastUsed: new Date(),
        usageCount: 0
      }
    };

    const palettes = this._colorPalettes();
    this._colorPalettes.update(palettes => [...palettes, newPalette]);

    this.updateMetrics();
    return newPalette;
  }

  /**
   * Update color palette
   */
  updateColorPalette(paletteId: string, updates: Partial<ColorPalette>): boolean {
    const palettes = this._colorPalettes();
    const palette = palettes.find(p => p.id === paletteId);

    if (!palette) return false;

    Object.assign(palette, updates);
    palette.updatedAt = new Date();

    this._colorPalettes.set([...palettes]);
    this.updateMetrics();
    return true;
  }

  /**
   * Generate color variants
   */
  generateColorVariants(color: Color): ColorVariant[] {
    const variants: ColorVariant[] = [];

    // Light variant
    variants.push({
      id: this.generateId(),
      name: `${color.name}-light`,
      value: this.lightenColor(color.value, 0.2),
      type: 'light',
      opacity: 0.8,
      description: `Light variant of ${color.name}`
    });

    // Dark variant
    variants.push({
      id: this.generateId(),
      name: `${color.name}-dark`,
      value: this.darkenColor(color.value, 0.2),
      type: 'dark',
      opacity: 1,
      description: `Dark variant of ${color.name}`
    });

    // Hover variant
    variants.push({
      id: this.generateId(),
      name: `${color.name}-hover`,
      value: this.lightenColor(color.value, 0.1),
      type: 'hover',
      opacity: 1,
      description: `Hover variant of ${color.name}`
    });

    return variants;
  }

  /**
   * Load templates from API
   */
  loadTemplates(companyId: string, filter?: { template_type?: string; category?: string; is_active?: boolean }): Observable<Template[]> {
    let params = new HttpParams().set('company_id', companyId);

    if (filter) {
      if (filter.template_type) params = params.set('template_type', filter.template_type);
      if (filter.category) params = params.set('category', filter.category);
      if (filter.is_active !== undefined) params = params.set('is_active', filter.is_active.toString());
    }

    return this.http.get<{ items: any[], total: number }>(`${this.apiUrl}/templates`, { params }).pipe(
      map((response) => {
        const templates = response.items.map(t => ({
          id: t.id,
          name: t.name,
          displayName: t.name,
          description: t.description,
          type: t.channel || 'email',
          category: 'notification',
          isActive: t.is_active,
          isPublic: !t.is_system_template,
          theme: '',
          content: {
            html: t.html_body || t.body,
            css: '',
            assets: []
          },
          variables: t.variables || [],
          preview: {
            image: '',
            thumbnail: '',
            description: t.description
          },
          usage: {
            instances: 0,
            lastUsed: t.last_used ? new Date(t.last_used) : new Date(),
            usageCount: t.usage_count || 0
          },
          metadata: {
            createdBy: '',
            tags: [],
            version: '1.0.0',
            compatibility: [],
            dependencies: []
          },
          createdAt: new Date(t.created_at),
          updatedAt: new Date(t.updated_at)
        }));
        this._templates.set(templates);
        return templates;
      }),
      catchError((error) => {
        console.error('Error loading templates:', error);
        return of(this._templates());
      })
    );
  }

  /**
   * Get templates (from local cache)
   */
  getTemplates(): Template[] {
    return this._templates();
  }

  /**
   * Get templates by type
   */
  getTemplatesByType(type: string): Template[] {
    return this._templates().filter(t => t.type === type);
  }

  /**
   * Create template
   */
  createTemplate(companyId: string, template: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'usage'>): Observable<Template> {
    const params = new HttpParams().set('company_id', companyId);

    return this.http.post<any>(`${this.apiUrl}/templates`, {
      name: template.name,
      description: template.description,
      subject: template.preview?.description,
      content: {
        html: template.content.html,
        text: template.content.html
      },
      variables: template.variables || [],
      defaultValues: {},
      isActive: template.isActive
    }, { params }).pipe(
      map((response) => {
        const newTemplate: Template = {
          id: response.id,
          name: response.name,
          displayName: response.name,
          description: response.description,
          type: response.channel || 'email',
          category: 'notification',
          isActive: response.is_active,
          isPublic: !response.is_system_template,
          theme: '',
          content: {
            html: response.html_body || response.body,
            css: '',
            assets: []
          },
          variables: response.variables || [],
          preview: {
            image: '',
            thumbnail: '',
            description: response.description
          },
          usage: {
            instances: 0,
            lastUsed: new Date(),
            usageCount: 0
          },
          metadata: {
            createdBy: '',
            tags: [],
            version: '1.0.0',
            compatibility: [],
            dependencies: []
          },
          createdAt: new Date(response.created_at),
          updatedAt: new Date(response.updated_at)
        };
        this._templates.update(templates => [...templates, newTemplate]);
        this.updateMetrics();
        return newTemplate;
      }),
      catchError((error) => {
        console.error('Error creating template:', error);
        // Fallback to local creation
        const fallbackTemplate: Template = {
          ...template,
          id: this.generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          usage: {
            instances: 0,
            lastUsed: new Date(),
            usageCount: 0
          }
        };
        this._templates.update(templates => [...templates, fallbackTemplate]);
        this.updateMetrics();
        return of(fallbackTemplate);
      })
    );
  }

  /**
   * Update template
   */
  updateTemplate(templateId: string, companyId: string, updates: Partial<Template>): Observable<Template> {
    const params = new HttpParams().set('company_id', companyId);

    return this.http.put<any>(`${this.apiUrl}/templates/${templateId}`, {
      name: updates.name,
      description: updates.description,
      subject: updates.preview?.description,
      content: updates.content ? {
        html: updates.content.html,
        text: updates.content.html
      } : undefined,
      variables: updates.variables,
      isActive: updates.isActive
    }, { params }).pipe(
      map((response) => {
        const updatedTemplate: Template = {
          id: response.id,
          name: response.name,
          displayName: response.name,
          description: response.description,
          type: response.channel || 'email',
          category: 'notification',
          isActive: response.is_active,
          isPublic: !response.is_system_template,
          theme: '',
          content: {
            html: response.html_body || response.body,
            css: '',
            assets: []
          },
          variables: response.variables || [],
          preview: {
            image: '',
            thumbnail: '',
            description: response.description
          },
          usage: {
            instances: 0,
            lastUsed: response.last_used ? new Date(response.last_used) : new Date(),
            usageCount: response.usage_count || 0
          },
          metadata: {
            createdBy: '',
            tags: [],
            version: '1.0.0',
            compatibility: [],
            dependencies: []
          },
          createdAt: new Date(response.created_at),
          updatedAt: new Date(response.updated_at)
        };
        this._templates.update(templates => {
          const index = templates.findIndex(t => t.id === templateId);
          if (index !== -1) {
            templates[index] = updatedTemplate;
            return [...templates];
          }
          return templates;
        });
        this.updateMetrics();
        return updatedTemplate;
      }),
      catchError((error) => {
        console.error('Error updating template:', error);
        // Fallback to local update
        this._templates.update(templates => {
          const template = templates.find(t => t.id === templateId);
          if (template) {
            Object.assign(template, updates);
            template.updatedAt = new Date();
            return [...templates];
          }
          return templates;
        });
        const template = this._templates().find(t => t.id === templateId);
        if (template) {
          this.updateMetrics();
          return of(template);
        }
        throw error;
      })
    );
  }

  /**
   * Delete template
   */
  deleteTemplate(templateId: string, companyId: string): Observable<void> {
    const params = new HttpParams().set('company_id', companyId);

    return this.http.delete<void>(`${this.apiUrl}/templates/${templateId}`, { params }).pipe(
      tap(() => {
        this._templates.update(templates => templates.filter(t => t.id !== templateId));
        this.updateMetrics();
      }),
      catchError((error) => {
        console.error('Error deleting template:', error);
        // Fallback to local delete
        this._templates.update(templates => templates.filter(t => t.id !== templateId));
        this.updateMetrics();
        return of(undefined);
      })
    );
  }

  /**
   * Use template
   */
  useTemplate(templateId: string, userId: string): boolean {
    let used = false;
    this._templates.update(templates => {
      const template = templates.find(t => t.id === templateId);
      if (!template || !template.isActive) return templates;

      template.usage.instances++;
      template.usage.lastUsed = new Date();
      template.usage.usageCount++;
      used = true;
      return [...templates];
    });

    if (used) {
      this.updateMetrics();
    }
    return used;
  }

  /**
   * Export theme
   */
  exportTheme(themeId: string, format: 'json' | 'css' | 'scss' = 'json'): string {
    const theme = this._themes().find((t: Theme) => t.id === themeId);
    if (!theme) return '';

    switch (format) {
      case 'json':
        return JSON.stringify(theme, null, 2);
      case 'css':
        return this.generateCSS(theme);
      case 'scss':
        return this.generateSCSS(theme);
      default:
        return JSON.stringify(theme, null, 2);
    }
  }

  /**
   * Import theme
   */
  importTheme(themeData: string, format: 'json' | 'css' | 'scss' = 'json'): Theme | null {
    try {
      let theme: any;

      switch (format) {
        case 'json':
          theme = JSON.parse(themeData);
          break;
        case 'css':
          theme = this.parseCSS(themeData);
          break;
        case 'scss':
          theme = this.parseSCSS(themeData);
          break;
        default:
          return null;
      }

      return this.createTheme(theme);
    } catch (error) {
      console.error('Theme import failed:', error);
      return null;
    }
  }

  /**
   * Get metrics
   */
  getMetrics(): TemplateMetrics {
    return this._metrics();
  }

  /**
   * Generate CSS from theme
   */
  private generateCSS(theme: Theme): string {
    const css = `
:root {
  /* Primary Colors */
  --primary-50: #f0f9ff;
  --primary-500: #3b82f6;
  --primary-900: #1e3a8a;

  /* Typography */
  --font-family-primary: ${theme.typography.fontFamily.primary};
  --font-size-base: ${theme.typography.fontSize.base};

  /* Spacing */
  --spacing-base: ${theme.spacing.base}px;
  --spacing-sm: ${theme.spacing.base * theme.spacing.scale}px;
  --spacing-md: ${theme.spacing.base * theme.spacing.scale * 2}px;

  /* Components */
  --button-border-radius: ${theme.components.button.borderRadius};
  --input-border-radius: ${theme.components.input.borderRadius};
}
    `.trim();

    return css;
  }

  /**
   * Generate SCSS from theme
   */
  private generateSCSS(theme: Theme): string {
    const scss = `
// Theme: ${theme.name}
// Generated: ${new Date().toISOString()}

$primary-50: #f0f9ff;
$primary-500: #3b82f6;
$primary-900: #1e3a8a;

$font-family-primary: ${theme.typography.fontFamily.primary};
$font-size-base: ${theme.typography.fontSize.base};

$spacing-base: ${theme.spacing.base}px;
$spacing-sm: #{$spacing-base * ${theme.spacing.scale}};
$spacing-md: #{$spacing-base * ${theme.spacing.scale * 2}};

.button {
  border-radius: ${theme.components.button.borderRadius};
  padding: ${theme.components.button.padding};
}
    `.trim();

    return scss;
  }

  /**
   * Parse CSS to theme
   */
  private parseCSS(css: string): any {
    // Simple CSS parsing - in a real app, use a proper CSS parser
    const theme: any = {
      name: 'Imported Theme',
      displayName: 'Imported Theme',
      description: 'Theme imported from CSS',
      type: 'custom',
      isActive: false,
      isDefault: false,
      colorPalette: '',
      typography: {
        fontFamily: { primary: 'Inter', secondary: 'Inter', monospace: 'Fira Code' },
        fontSize: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem' },
        fontWeight: { light: 300, normal: 400, medium: 500, semibold: 600, bold: 700 },
        lineHeight: { tight: 1.25, normal: 1.5, relaxed: 1.75 },
        letterSpacing: { tight: '-0.025em', normal: '0', wide: '0.025em' }
      },
      spacing: {
        base: 4,
        scale: 1.5,
        breakpoints: { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 },
        padding: { xs: '0.5rem', sm: '0.75rem', md: '1rem', lg: '1.5rem', xl: '2rem' },
        margin: { xs: '0.5rem', sm: '0.75rem', md: '1rem', lg: '1.5rem', xl: '2rem' }
      },
      components: {
        button: { borderRadius: '0.375rem', padding: '0.5rem 1rem', fontSize: '1rem', fontWeight: 500, minHeight: '2.5rem', transition: 'all 0.2s' },
        input: { borderRadius: '0.375rem', padding: '0.5rem 0.75rem', fontSize: '1rem', borderWidth: '1px', focusRingWidth: '2px', transition: 'all 0.2s' },
        card: { borderRadius: '0.5rem', padding: '1.5rem', shadow: '0 1px 3px rgba(0, 0, 0, 0.1)', borderWidth: '1px' },
        modal: { borderRadius: '0.5rem', padding: '1.5rem', maxWidth: '32rem', backdropBlur: '4px' }
      },
      layout: {
        container: { maxWidth: '1200px', padding: '0 1rem', margin: '0 auto' },
        grid: { columns: 12, gap: '1rem', breakpoints: {} },
        sidebar: { width: '16rem', collapsedWidth: '4rem', transition: 'width 0.3s' },
        header: { height: '4rem', padding: '0 1rem', shadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }
      },
      animations: {
        duration: { fast: '0.15s', normal: '0.3s', slow: '0.5s' },
        easing: { linear: 'linear', ease: 'ease', easeIn: 'ease-in', easeOut: 'ease-out', easeInOut: 'ease-in-out' },
        transitions: { color: 'color 0.2s', background: 'background-color 0.2s', transform: 'transform 0.2s', opacity: 'opacity 0.2s' }
      }
    };

    return theme;
  }

  /**
   * Parse SCSS to theme
   */
  private parseSCSS(scss: string): any {
    // Simple SCSS parsing - in a real app, use a proper SCSS parser
    return this.parseCSS(scss);
  }

  /**
   * Lighten color
   */
  private lightenColor(color: string, amount: number): string {
    // Simple color lightening - in a real app, use a proper color library
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const newR = Math.min(255, Math.floor(r + (255 - r) * amount));
    const newG = Math.min(255, Math.floor(g + (255 - g) * amount));
    const newB = Math.min(255, Math.floor(b + (255 - b) * amount));

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  /**
   * Darken color
   */
  private darkenColor(color: string, amount: number): string {
    // Simple color darkening - in a real app, use a proper color library
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const newR = Math.max(0, Math.floor(r * (1 - amount)));
    const newG = Math.max(0, Math.floor(g * (1 - amount)));
    const newB = Math.max(0, Math.floor(b * (1 - amount)));

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    const themes = this._themes();
    const colorPalettes = this._colorPalettes();
    const templates = this._templates();
    const metrics = this.calculateMetrics(themes, colorPalettes, templates);
    this._metrics.set(metrics);
  }

  /**
   * Calculate metrics
   */
  private calculateMetrics(themes: Theme[], colorPalettes: ColorPalette[], templates: Template[]): TemplateMetrics {
    const totalThemes = themes.length;
    const activeThemes = themes.filter(t => t.isActive).length;
    const totalTemplates = templates.length;
    const activeTemplates = templates.filter(t => t.isActive).length;
    const totalColorPalettes = colorPalettes.length;
    const activeColorPalettes = colorPalettes.filter(p => p.isActive).length;

    const themeUsage = this.groupBy(themes, 'name');
    const templateUsage = this.groupBy(templates, 'type');
    const colorPaletteUsage = this.groupBy(colorPalettes, 'type');
    const mostUsedTemplates = this.groupBy(templates, 'name');

    const averageTemplateSize = templates.length > 0 ?
      templates.reduce((sum, t) => sum + (t.content.html.length + t.content.css.length), 0) / templates.length : 0;

    const totalAssets = templates.reduce((sum, t) => sum + t.content.assets.length, 0);

    return {
      totalThemes,
      activeThemes,
      totalTemplates,
      activeTemplates,
      totalColorPalettes,
      activeColorPalettes,
      themeUsage,
      templateUsage,
      colorPaletteUsage,
      mostUsedTemplates,
      averageTemplateSize,
      totalAssets,
      usageStats: {
        mostUsedTemplate: mostUsedTemplates ? Object.keys(mostUsedTemplates)[0] || '' : '',
        mostUsedTheme: themeUsage ? Object.keys(themeUsage)[0] || '' : '',
        totalUsage: Object.values(templateUsage || {}).reduce((sum, count) => sum + count, 0)
      }
    };
  }

  /**
   * Group array by property
   */
  private groupBy<T>(array: T[], property: keyof T): { [key: string]: number } {
    return array.reduce((groups, item) => {
      const key = String(item[property]);
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {} as { [key: string]: number });
  }

  /**
   * Get default metrics
   */
  private getDefaultMetrics(): TemplateMetrics {
    return {
      totalThemes: 0,
      activeThemes: 0,
      totalTemplates: 0,
      activeTemplates: 0,
      totalColorPalettes: 0,
      activeColorPalettes: 0,
      themeUsage: {},
      templateUsage: {},
      colorPaletteUsage: {},
      mostUsedTemplates: {},
      averageTemplateSize: 0,
      totalAssets: 0,
      usageStats: {
        mostUsedTemplate: '',
        mostUsedTheme: '',
        totalUsage: 0
      }
    };
  }

  /**
   * Initialize demo data
   */
  private initializeDemoData(): void {
    // Create demo color palettes
    const demoColorPalettes: ColorPalette[] = [
      {
        id: 'palette-1',
        name: 'Default Blue',
        description: 'Default blue color palette',
        type: 'primary',
        colors: [
          {
            id: 'color-1',
            name: 'Primary Blue',
            value: '#3b82f6',
            rgb: { r: 59, g: 130, b: 246 },
            hsl: { h: 217, s: 91, l: 60 },
            alpha: 1,
            usage: 'primary',
            description: 'Primary brand color',
            isCustom: false,
            variants: []
          }
        ],
        isDefault: true,
        isActive: true,
        usage: {
          components: ['button', 'link'],
          pages: ['dashboard', 'login'],
          lastUsed: new Date(),
          usageCount: 150
        },
        metadata: {
          createdBy: 'system',
          tags: ['default', 'blue', 'primary'],
          version: '1.0.0',
          compatibility: ['all']
        },
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];

    this._colorPalettes.set(demoColorPalettes);

    // Create demo themes
    const demoThemes: Theme[] = [
      {
        id: 'theme-1',
        name: 'default',
        displayName: 'Default Theme',
        description: 'Default application theme',
        type: 'light',
        isActive: true,
        isDefault: true,
        colorPalette: 'palette-1',
        typography: {
          fontFamily: { primary: 'Inter', secondary: 'Inter', monospace: 'Fira Code' },
          fontSize: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem' },
          fontWeight: { light: 300, normal: 400, medium: 500, semibold: 600, bold: 700 },
          lineHeight: { tight: 1.25, normal: 1.5, relaxed: 1.75 },
          letterSpacing: { tight: '-0.025em', normal: '0', wide: '0.025em' }
        },
        spacing: {
          base: 4,
          scale: 1.5,
          breakpoints: { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 },
          padding: { xs: '0.5rem', sm: '0.75rem', md: '1rem', lg: '1.5rem', xl: '2rem' },
          margin: { xs: '0.5rem', sm: '0.75rem', md: '1rem', lg: '1.5rem', xl: '2rem' }
        },
        components: {
          button: { borderRadius: '0.375rem', padding: '0.5rem 1rem', fontSize: '1rem', fontWeight: 500, minHeight: '2.5rem', transition: 'all 0.2s' },
          input: { borderRadius: '0.375rem', padding: '0.5rem 0.75rem', fontSize: '1rem', borderWidth: '1px', focusRingWidth: '2px', transition: 'all 0.2s' },
          cards: { borderRadius: '0.5rem', padding: '1.5rem', shadow: '0 1px 3px rgba(0, 0, 0, 0.1)' },
          modals: { borderRadius: '0.5rem', padding: '1.5rem', backdrop: 'rgba(0, 0, 0, 0.5)' }
        },
        layout: {
          container: { maxWidth: '1200px', padding: '0 1rem', margin: '0 auto' },
          grid: { columns: 12, gap: '1rem', breakpoints: {} },
          sidebar: { width: '16rem', collapsedWidth: '4rem', transition: 'width 0.3s' },
          header: { height: '4rem', padding: '0 1rem', shadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }
        },
        animations: {
          duration: { fast: '0.15s', normal: '0.3s', slow: '0.5s' },
          easing: { linear: 'linear', ease: 'ease', easeIn: 'ease-in', easeOut: 'ease-out', easeInOut: 'ease-in-out' },
          transitions: {
            fade: 'opacity 0.2s',
            slide: 'transform 0.2s',
            scale: 'transform 0.2s',
            transform: 'transform 0.2s',
            opacity: 'opacity 0.2s',
            color: 'color 0.2s',
            background: 'background-color 0.2s'
          }
        },
        usage: {
          users: ['admin', 'user-1'],
          pages: ['dashboard', 'login'],
          lastUsed: new Date(),
          usageCount: 500
        },
        metadata: {
          createdBy: 'system',
          tags: ['default', 'light', 'modern'],
          version: '1.0.0',
          compatibility: ['all']
        },
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];

    this._themes.set(demoThemes);

    // Create demo templates
    const demoTemplates: Template[] = [
      {
        id: 'template-1',
        name: 'dashboard-layout',
        displayName: 'Dashboard Layout',
        description: 'Standard dashboard layout template',
        type: 'layout',
        category: 'dashboard',
        isActive: true,
        isPublic: true,
        theme: 'theme-1',
        content: {
          html: '<div class="dashboard-layout"><header class="header"></header><aside class="sidebar"></aside><main class="main-content"></main></div>',
          css: '.dashboard-layout { display: grid; grid-template-areas: "header header" "sidebar main"; }',
          assets: []
        },
        variables: [
          {
            id: 'var-1',
            name: 'title',
            type: 'text',
            defaultValue: 'Dashboard',
            required: true,
            description: 'Page title'
          }
        ],
        preview: {
          image: '/assets/templates/dashboard-layout.png',
          thumbnail: '/assets/templates/dashboard-layout-thumb.png',
          description: 'Clean dashboard layout with header, sidebar, and main content area'
        },
        usage: {
          instances: 5,
          lastUsed: new Date(),
          usageCount: 25
        },
        metadata: {
          createdBy: 'admin',
          tags: ['dashboard', 'layout', 'responsive'],
          version: '1.0.0',
          compatibility: ['all'],
          dependencies: []
        },
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];

    this._templates.set(demoTemplates);
    this.updateMetrics();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'template-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}

