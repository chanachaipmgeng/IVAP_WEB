/**
 * Angular Animations for Modern UX
 * Animation presets for consistent motion design
 */

import {
  trigger,
  state,
  style,
  transition,
  animate,
  keyframes,
  query,
  stagger,
  animateChild,
  group
} from '@angular/animations';

// Fade Animations
export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-in', style({ opacity: 1 }))
  ])
]);

export const fadeOut = trigger('fadeOut', [
  transition(':leave', [
    animate('300ms ease-out', style({ opacity: 0 }))
  ])
]);

export const fadeInOut = trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-in', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('300ms ease-out', style({ opacity: 0 }))
  ])
]);

// Slide Animations
export const slideInLeft = trigger('slideInLeft', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)', opacity: 0 }),
    animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
  ])
]);

export const slideInRight = trigger('slideInRight', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
  ])
]);

export const slideInUp = trigger('slideInUp', [
  transition(':enter', [
    style({ transform: 'translateY(100%)', opacity: 0 }),
    animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
  ])
]);

export const slideInDown = trigger('slideInDown', [
  transition(':enter', [
    style({ transform: 'translateY(-100%)', opacity: 0 }),
    animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
  ])
]);

// Scale Animations
export const scaleIn = trigger('scaleIn', [
  transition(':enter', [
    style({ transform: 'scale(0.8)', opacity: 0 }),
    animate('200ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
  ])
]);

export const scaleOut = trigger('scaleOut', [
  transition(':leave', [
    animate('200ms ease-in', style({ transform: 'scale(0.8)', opacity: 0 }))
  ])
]);

export const scaleInOut = trigger('scaleInOut', [
  transition(':enter', [
    style({ transform: 'scale(0.8)', opacity: 0 }),
    animate('200ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ transform: 'scale(0.8)', opacity: 0 }))
  ])
]);

// Complex Animations
export const bounceIn = trigger('bounceIn', [
  transition(':enter', [
    animate('600ms ease-out', keyframes([
      style({ transform: 'scale(0.8)', opacity: 0, offset: 0 }),
      style({ transform: 'scale(1.1)', opacity: 1, offset: 0.5 }),
      style({ transform: 'scale(0.95)', offset: 0.75 }),
      style({ transform: 'scale(1)', offset: 1 })
    ]))
  ])
]);

export const flipIn = trigger('flipIn', [
  transition(':enter', [
    animate('500ms ease-out', keyframes([
      style({ transform: 'perspective(400px) rotateY(90deg)', opacity: 0, offset: 0 }),
      style({ transform: 'perspective(400px) rotateY(-10deg)', opacity: 1, offset: 0.6 }),
      style({ transform: 'perspective(400px) rotateY(0deg)', offset: 1 })
    ]))
  ])
]);

export const zoomIn = trigger('zoomIn', [
  transition(':enter', [
    style({ transform: 'scale(0)', opacity: 0 }),
    animate('300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      style({ transform: 'scale(1)', opacity: 1 }))
  ])
]);

// List & Stagger Animations
export const listAnimation = trigger('listAnimation', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      stagger(50, [
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true })
  ])
]);

export const staggerFadeIn = trigger('staggerFadeIn', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0 }),
      stagger(100, [
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ], { optional: true })
  ])
]);

// Route Animations
export const routeSlide = trigger('routeSlide', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
      })
    ], { optional: true }),
    query(':enter', [
      style({ left: '100%' })
    ], { optional: true }),
    query(':leave', animateChild(), { optional: true }),
    group([
      query(':leave', [
        animate('300ms ease-out', style({ left: '-100%' }))
      ], { optional: true }),
      query(':enter', [
        animate('300ms ease-out', style({ left: '0%' }))
      ], { optional: true })
    ]),
    query(':enter', animateChild(), { optional: true })
  ])
]);

export const routeFade = trigger('routeFade', [
  transition('* <=> *', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
      })
    ], { optional: true }),
    query(':enter', [
      style({ opacity: 0 })
    ], { optional: true }),
    query(':leave', animateChild(), { optional: true }),
    group([
      query(':leave', [
        animate('200ms ease-out', style({ opacity: 0 }))
      ], { optional: true }),
      query(':enter', [
        animate('300ms 100ms ease-in', style({ opacity: 1 }))
      ], { optional: true })
    ]),
    query(':enter', animateChild(), { optional: true })
  ])
]);

// Modal & Dialog Animations
export const modalAnimation = trigger('modalAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    query('.modal-backdrop', [
      style({ opacity: 0 })
    ], { optional: true }),
    query('.modal-content', [
      style({ transform: 'scale(0.7)', opacity: 0 })
    ], { optional: true }),
    group([
      animate('200ms ease-out', style({ opacity: 1 })),
      query('.modal-backdrop', [
        animate('200ms ease-out', style({ opacity: 1 }))
      ], { optional: true }),
      query('.modal-content', [
        animate('300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          style({ transform: 'scale(1)', opacity: 1 }))
      ], { optional: true })
    ])
  ]),
  transition(':leave', [
    group([
      animate('200ms ease-in', style({ opacity: 0 })),
      query('.modal-content', [
        animate('200ms ease-in', style({ transform: 'scale(0.7)', opacity: 0 }))
      ], { optional: true })
    ])
  ])
]);

// Dropdown Animation
export const dropdownAnimation = trigger('dropdownAnimation', [
  transition(':enter', [
    style({
      opacity: 0,
      transform: 'translateY(-10px) scale(0.95)'
    }),
    animate('200ms ease-out', style({
      opacity: 1,
      transform: 'translateY(0) scale(1)'
    }))
  ]),
  transition(':leave', [
    animate('150ms ease-in', style({
      opacity: 0,
      transform: 'translateY(-10px) scale(0.95)'
    }))
  ])
]);

// Toast/Notification Animation
export const toastAnimation = trigger('toastAnimation', [
  transition(':enter', [
    style({
      transform: 'translateX(100%)',
      opacity: 0
    }),
    animate('300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      style({ transform: 'translateX(0)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('200ms ease-in',
      style({ transform: 'translateX(100%)', opacity: 0 }))
  ])
]);

// Loading Animations
export const pulseAnimation = trigger('pulseAnimation', [
  state('active', style({ transform: 'scale(1)' })),
  transition('* => active', [
    animate('1s ease-in-out', keyframes([
      style({ transform: 'scale(1)', offset: 0 }),
      style({ transform: 'scale(1.05)', offset: 0.5 }),
      style({ transform: 'scale(1)', offset: 1 })
    ]))
  ])
]);

export const spinAnimation = trigger('spinAnimation', [
  transition('* => *', [
    animate('1s linear', keyframes([
      style({ transform: 'rotate(0deg)', offset: 0 }),
      style({ transform: 'rotate(360deg)', offset: 1 })
    ]))
  ])
]);

// Expand/Collapse Animation
export const expandCollapse = trigger('expandCollapse', [
  transition(':enter', [
    style({ height: 0, opacity: 0, overflow: 'hidden' }),
    animate('300ms ease-out', style({ height: '*', opacity: 1 }))
  ]),
  transition(':leave', [
    style({ overflow: 'hidden' }),
    animate('300ms ease-in', style({ height: 0, opacity: 0 }))
  ])
]);

// Shake Animation (for errors)
export const shakeAnimation = trigger('shakeAnimation', [
  transition('* => shake', [
    animate('400ms', keyframes([
      style({ transform: 'translateX(0)', offset: 0 }),
      style({ transform: 'translateX(-10px)', offset: 0.25 }),
      style({ transform: 'translateX(10px)', offset: 0.5 }),
      style({ transform: 'translateX(-10px)', offset: 0.75 }),
      style({ transform: 'translateX(0)', offset: 1 })
    ]))
  ])
]);

// Highlight Animation
export const highlightAnimation = trigger('highlightAnimation', [
  transition('* => highlight', [
    animate('600ms', keyframes([
      style({ backgroundColor: 'transparent', offset: 0 }),
      style({ backgroundColor: '#FEF3C7', offset: 0.3 }),
      style({ backgroundColor: '#FEF3C7', offset: 0.7 }),
      style({ backgroundColor: 'transparent', offset: 1 })
    ]))
  ])
]);

/**
 * Export all animations as a single array for easy import
 */
export const APP_ANIMATIONS = [
  fadeIn,
  fadeOut,
  fadeInOut,
  slideInLeft,
  slideInRight,
  slideInUp,
  slideInDown,
  scaleIn,
  scaleOut,
  scaleInOut,
  bounceIn,
  flipIn,
  zoomIn,
  listAnimation,
  staggerFadeIn,
  routeSlide,
  routeFade,
  modalAnimation,
  dropdownAnimation,
  toastAnimation,
  pulseAnimation,
  spinAnimation,
  expandCollapse,
  shakeAnimation,
  highlightAnimation
];

