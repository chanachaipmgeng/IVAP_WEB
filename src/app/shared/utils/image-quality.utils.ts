/**
 * Image Quality Utilities
 * Functions for analyzing image quality for face recognition
 */

export interface ImageQualityMetrics {
  brightness: number;
  blurriness: number;
  contrast: number;
  sharpness: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  recommendations: string[];
}

/**
 * Calculate image brightness using luminance formula
 * @param imageData ImageData object from canvas
 * @returns Brightness value (0-255)
 */
export function calculateBrightness(imageData: ImageData): number {
  const data = imageData.data;
  let brightness = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Calculate luminance using standard formula
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    brightness += luminance;
  }

  return brightness / (data.length / 4);
}

/**
 * Calculate image blurriness using Laplacian variance
 * @param imageData ImageData object from canvas
 * @returns Blurriness value (higher = more blurry)
 */
export function calculateLaplacian(imageData: ImageData): number {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  let laplacian = 0;

  // Convert to grayscale first
  const gray = new Uint8Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    gray[i / 4] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }

  // Apply Laplacian kernel
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const center = gray[idx];
      const top = gray[idx - width];
      const bottom = gray[idx + width];
      const left = gray[idx - 1];
      const right = gray[idx + 1];

      const laplacianValue = Math.abs(4 * center - top - bottom - left - right);
      laplacian += laplacianValue;
    }
  }

  return laplacian / ((width - 2) * (height - 2));
}

/**
 * Calculate image contrast using standard deviation
 * @param imageData ImageData object from canvas
 * @returns Contrast value (0-255)
 */
export function calculateContrast(imageData: ImageData): number {
  const data = imageData.data;
  const gray = new Uint8Array(data.length / 4);

  // Convert to grayscale
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    gray[i / 4] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }

  // Calculate mean
  const mean = gray.reduce((sum, val) => sum + val, 0) / gray.length;

  // Calculate standard deviation
  const variance = gray.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / gray.length;
  return Math.sqrt(variance);
}

/**
 * Calculate image sharpness using gradient magnitude
 * @param imageData ImageData object from canvas
 * @returns Sharpness value (higher = sharper)
 */
export function calculateSharpness(imageData: ImageData): number {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  let sharpness = 0;

  // Convert to grayscale
  const gray = new Uint8Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    gray[i / 4] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }

  // Calculate gradient magnitude
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const center = gray[idx];
      const right = gray[idx + 1];
      const bottom = gray[idx + width];

      const gx = Math.abs(right - center);
      const gy = Math.abs(bottom - center);
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      sharpness += magnitude;
    }
  }

  return sharpness / ((width - 2) * (height - 2));
}

/**
 * Get comprehensive image quality analysis
 * @param imageData ImageData object from canvas
 * @returns Complete quality metrics and recommendations
 */
export function analyzeImageQuality(imageData: ImageData): ImageQualityMetrics {
  const brightness = calculateBrightness(imageData);
  const blurriness = calculateLaplacian(imageData);
  const contrast = calculateContrast(imageData);
  const sharpness = calculateSharpness(imageData);

  const recommendations: string[] = [];
  let quality: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';

  // Analyze brightness
  if (brightness < 50) {
    recommendations.push('Image is too dark - move to a brighter area');
    quality = 'poor';
  } else if (brightness < 80) {
    recommendations.push('Image is slightly dark - consider better lighting');
    if (quality === 'excellent') quality = 'good';
  } else if (brightness > 200) {
    recommendations.push('Image is too bright - avoid direct sunlight');
    quality = 'poor';
  } else if (brightness > 180) {
    recommendations.push('Image is slightly bright - consider softer lighting');
    if (quality === 'excellent') quality = 'good';
  }

  // Analyze blurriness
  if (blurriness < 50) {
    recommendations.push('Image is very blurry - hold still and focus');
    quality = 'poor';
  } else if (blurriness < 100) {
    recommendations.push('Image is slightly blurry - hold still');
    if (quality === 'excellent') quality = 'good';
  }

  // Analyze contrast
  if (contrast < 30) {
    recommendations.push('Image has low contrast - improve lighting conditions');
    if (quality === 'excellent') quality = 'good';
  }

  // Analyze sharpness
  if (sharpness < 20) {
    recommendations.push('Image lacks sharpness - ensure proper focus');
    if (quality === 'excellent') quality = 'good';
  }

  // Overall quality assessment
  if (recommendations.length === 0) {
    quality = 'excellent';
  } else if (recommendations.length <= 1) {
    quality = 'good';
  } else if (recommendations.length <= 2) {
    quality = 'fair';
  } else {
    quality = 'poor';
  }

  return {
    brightness,
    blurriness,
    contrast,
    sharpness,
    quality,
    recommendations
  };
}

/**
 * Check if image quality is suitable for face recognition
 * @param imageData ImageData object from canvas
 * @returns true if quality is acceptable for face recognition
 */
export function isImageQualityAcceptable(imageData: ImageData): boolean {
  const metrics = analyzeImageQuality(imageData);
  return metrics.quality === 'excellent' || metrics.quality === 'good';
}

/**
 * Get quality feedback message for user
 * @param imageData ImageData object from canvas
 * @returns User-friendly feedback message
 */
export function getQualityFeedback(imageData: ImageData): string {
  const metrics = analyzeImageQuality(imageData);

  if (metrics.quality === 'excellent') {
    return 'Perfect! Image quality is excellent for face recognition.';
  } else if (metrics.quality === 'good') {
    return 'Good! Image quality is acceptable for face recognition.';
  } else if (metrics.quality === 'fair') {
    return 'Fair. Consider improving lighting or focus for better results.';
  } else {
    return 'Poor quality. Please improve lighting, focus, and hold still.';
  }
}

/**
 * Get specific recommendations for improving image quality
 * @param imageData ImageData object from canvas
 * @returns Array of specific recommendations
 */
export function getQualityRecommendations(imageData: ImageData): string[] {
  const metrics = analyzeImageQuality(imageData);
  return metrics.recommendations;
}






