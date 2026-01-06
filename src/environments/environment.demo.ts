/**
 * Demo/Development environment configuration
 * This file contains demo routes and features enabled flag
 */
export const demoConfig = {
  enableDemoPages: !environment.production,
  demoRoutes: [
    'map-demo',
    'face-recognition-demo',
    'face-recognition-live',
    'timestamp-demo',
    'mobile-demo',
    'select2-demo',
    'echarts-demo',
    'rating-demo',
    'validation-demo',
    'notification-demo',
    'calendar-demo',
    'timeline-demo',
    'advanced-ui-demo',
    'accordion-demo',
    'draggable-cards-demo',
    'swiper-gallery-demo',
    'offcanvas-demo',
    'rich-text-editor-demo',
    'advanced-data-table-demo',
    'gallery-demo'
  ]
};

// Import environment for production check
import { environment } from './environment';

