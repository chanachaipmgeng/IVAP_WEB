/**
 * Demo Routes Configuration
 * These routes are only included in development mode
 * Production builds exclude these routes for security and performance
 *
 * To enable demo routes in production, set ENABLE_DEMO_ROUTES=true in environment
 */
import { Routes } from '@angular/router';
import { environment } from '../environments/environment';

export function getDemoRoutes(): Routes {


  return [
    {
      path: 'map-demo',
      loadComponent: () => import('./features/portal/map-demo/map-demo.component')
        .then(m => m.MapDemoComponent)
    },
    {
      path: 'face-recognition-demo',
      loadComponent: () => import('./features/portal/face-recognition-demo/face-recognition-demo.component')
        .then(m => m.FaceRecognitionDemoComponent)
    },
    {
      path: 'face-recognition-live',
      loadComponent: () => import('./features/portal/face-recognition-live/face-recognition-live.component')
        .then(m => m.FaceRecognitionLiveComponent)
    },
    {
      path: 'timestamp-demo',
      loadComponent: () => import('./features/portal/timestamp-demo/timestamp-demo.component')
        .then(m => m.TimestampDemoComponent)
    },
    {
      path: 'mobile-demo',
      loadComponent: () => import('./features/portal/mobile-demo/mobile-demo.component')
        .then(m => m.MobileDemoComponent)
    },
    {
      path: 'echarts-demo',
      loadComponent: () => import('./features/portal/echarts-demo/echarts-demo.component')
        .then(m => m.EChartsDemoComponent)
    },
    {
      path: 'rating-demo',
      loadComponent: () => import('./features/portal/rating-demo/rating-demo.component')
        .then(m => m.RatingDemoComponent)
    },
    {
      path: 'validation-demo',
      loadComponent: () => import('./features/portal/validation-demo/validation-demo.component')
        .then(m => m.ValidationDemoComponent)
    },
    {
      path: 'notification-demo',
      loadComponent: () => import('./features/portal/notification-demo/notification-demo.component')
        .then(m => m.NotificationDemoComponent)
    },
    {
      path: 'calendar-demo',
      loadComponent: () => import('./features/portal/calendar-demo/calendar-demo.component')
        .then(m => m.CalendarDemoComponent)
    },
    {
      path: 'timeline-demo',
      loadComponent: () => import('./features/portal/timeline-demo/timeline-demo.component')
        .then(m => m.TimelineDemoComponent)
    },
    {
      path: 'advanced-ui-demo',
      loadComponent: () => import('./features/portal/advanced-ui-demo/advanced-ui-demo.component')
        .then(m => m.AdvancedUiDemoComponent)
    },
    {
      path: 'accordion-demo',
      loadComponent: () => import('./features/portal/accordion-demo/accordion-demo.component')
        .then(m => m.AccordionDemoComponent)
    },
    {
      path: 'draggable-cards-demo',
      loadComponent: () => import('./features/portal/draggable-cards-demo/draggable-cards-demo.component')
        .then(m => m.DraggableCardsDemoComponent)
    },
    {
      path: 'swiper-gallery-demo',
      loadComponent: () => import('./features/portal/swiper-gallery-demo/swiper-gallery-demo.component')
        .then(m => m.SwiperGalleryDemoComponent)
    },
    {
      path: 'offcanvas-demo',
      loadComponent: () => import('./features/portal/offcanvas-demo/offcanvas-demo.component')
        .then(m => m.OffcanvasDemoComponent)
    },
    {
      path: 'rich-text-editor-demo',
      loadComponent: () => import('./features/portal/rich-text-editor-demo/rich-text-editor-demo.component')
        .then(m => m.RichTextEditorDemoComponent)
    },
    {
      path: 'advanced-data-table-demo',
      loadComponent: () => import('./features/portal/advanced-data-table-demo/advanced-data-table-demo.component')
        .then(m => m.AdvancedDataTableDemoComponent)
    },
    {
      path: 'gallery-demo',
      loadComponent: () => import('./features/portal/gallery-demo/gallery-demo.component')
        .then(m => m.GalleryDemoComponent)
    }
  ];
}

