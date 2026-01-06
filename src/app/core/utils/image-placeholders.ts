/**
 * Image Placeholder Utilities
 * Provides placeholder images when actual images are not available
 */

/**
 * Generate a simple SVG placeholder image
 */
export function generatePlaceholderSVG(
  width: number,
  height: number,
  bgColor: string = '#4F46E5',
  textColor: string = '#FFFFFF',
  text: string = 'Image'
): string {
  const encodedText = encodeURIComponent(text);
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24"
            fill="${textColor}" text-anchor="middle" dominant-baseline="middle">
        ${text}
      </text>
    </svg>
  `)}`;
}

/**
 * Predefined placeholder images for landing page
 */
export const PLACEHOLDER_IMAGES = {
  // Hero images
  heroDashboard: generatePlaceholderSVG(800, 600, '#4F46E5', '#FFFFFF', 'Dashboard Overview'),
  heroFaceRecognition: generatePlaceholderSVG(800, 600, '#10B981', '#FFFFFF', 'Face Recognition'),
  heroVideoAnalytics: generatePlaceholderSVG(800, 600, '#F59E0B', '#FFFFFF', 'Video Analytics'),
  heroEvents: generatePlaceholderSVG(800, 600, '#EF4444', '#FFFFFF', 'Event Management'),

  // Feature images
  featureFaceRecognition: generatePlaceholderSVG(400, 300, '#10B981', '#FFFFFF', 'Face Recognition'),
  featureVideoAnalytics: generatePlaceholderSVG(400, 300, '#F59E0B', '#FFFFFF', 'Video Analytics'),
  featureEvents: generatePlaceholderSVG(400, 300, '#EF4444', '#FFFFFF', 'Events'),
  featureAccessControl: generatePlaceholderSVG(400, 300, '#8B5CF6', '#FFFFFF', 'Access Control'),
  featureAttendance: generatePlaceholderSVG(400, 300, '#06B6D4', '#FFFFFF', 'Attendance'),
  featureDashboard: generatePlaceholderSVG(400, 300, '#4F46E5', '#FFFFFF', 'Dashboard'),

  // New Feature images
  featureLiveness: generatePlaceholderSVG(400, 300, '#EC4899', '#FFFFFF', 'Liveness Detection'),
  featureSmartSearch: generatePlaceholderSVG(400, 300, '#6366F1', '#FFFFFF', 'Smart Search'),
  featureAlerts: generatePlaceholderSVG(400, 300, '#DC2626', '#FFFFFF', 'Real-time Alerts'),
  featureVehicle: generatePlaceholderSVG(400, 300, '#F97316', '#FFFFFF', 'Vehicle Management'),

  // Gallery images (full size)
  gallery1: generatePlaceholderSVG(1200, 800, '#4F46E5', '#FFFFFF', 'Dashboard Overview'),
  gallery2: generatePlaceholderSVG(1200, 800, '#10B981', '#FFFFFF', 'Face Recognition'),
  gallery3: generatePlaceholderSVG(1200, 800, '#F59E0B', '#FFFFFF', 'Video Analytics'),
  gallery4: generatePlaceholderSVG(1200, 800, '#EF4444', '#FFFFFF', 'Event Management'),
  gallery5: generatePlaceholderSVG(1200, 800, '#8B5CF6', '#FFFFFF', 'Access Control'),

  // Gallery thumbnails
  gallery1Thumb: generatePlaceholderSVG(300, 200, '#4F46E5', '#FFFFFF', 'Dashboard'),
  gallery2Thumb: generatePlaceholderSVG(300, 200, '#10B981', '#FFFFFF', 'Face Recognition'),
  gallery3Thumb: generatePlaceholderSVG(300, 200, '#F59E0B', '#FFFFFF', 'Video Analytics'),
  gallery4Thumb: generatePlaceholderSVG(300, 200, '#EF4444', '#FFFFFF', 'Events'),
  gallery5Thumb: generatePlaceholderSVG(300, 200, '#8B5CF6', '#FFFFFF', 'Access Control'),

  // Background
  heroBg: generatePlaceholderSVG(1920, 1080, '#1E293B', '#FFFFFF', 'IVAP Platform')
};



















