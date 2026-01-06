/**
 * Image Utility Functions
 *
 * Provides helper functions for image optimization:
 * - Generate placeholders
 * - Convert to WebP
 * - Generate responsive srcset
 */

/**
 * Generate a placeholder SVG image
 * @param width Image width
 * @param height Image height
 * @param text Optional text to display
 * @returns Base64 encoded SVG placeholder
 */
export function generatePlaceholder(
  width: number,
  height: number,
  text: string = 'Loading...'
): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text
        x="50%"
        y="50%"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="14"
        fill="#9ca3af">
        ${text}
      </text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Generate responsive srcset for images
 * @param baseUrl Base image URL
 * @param widths Array of widths to generate
 * @returns srcset string
 */
export function generateSrcset(baseUrl: string, widths: number[]): string {
  return widths
    .map(width => {
      // Assuming you have image resizing service or CDN
      // Adjust this based on your image service
      const url = `${baseUrl}?w=${width}`;
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Check if browser supports WebP format
 * @returns Promise that resolves to true if WebP is supported
 */
export function checkWebPSupport(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src =
      'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

/**
 * Get WebP version of image URL if supported
 * @param originalUrl Original image URL
 * @param webPUrl WebP version URL
 * @returns Promise that resolves to WebP URL if supported, otherwise original URL
 */
export async function getOptimalImageUrl(
  originalUrl: string,
  webPUrl: string
): Promise<string> {
  const supportsWebP = await checkWebPSupport();
  return supportsWebP ? webPUrl : originalUrl;
}

/**
 * Generate image sizes attribute for responsive images
 * @param breakpoints Array of breakpoint objects
 * @returns sizes attribute string
 */
export function generateSizes(breakpoints: Array<{ maxWidth: number; size: string }>): string {
  return breakpoints
    .sort((a, b) => b.maxWidth - a.maxWidth)
    .map(bp => `(max-width: ${bp.maxWidth}px) ${bp.size}`)
    .join(', ') + ', 100vw';
}

/**
 * Preload image
 * @param url Image URL
 * @returns Promise that resolves when image is loaded
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
}
