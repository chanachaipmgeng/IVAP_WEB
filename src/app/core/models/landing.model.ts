export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  benefits: string[];
  category: 'core' | 'advanced' | 'integration';
  isHighlighted: boolean;
}

export interface UseCase {
  id: string;
  industry: string;
  icon: string;
  description: string;
  features: string[];
  benefits: string[];
  targetAudience: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  company: string;
  position?: string;
  role?: string;
  content: string;
  rating: number;
  avatar: string;
  icon?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  period: 'monthly' | 'yearly';
  features: string[];
  isPopular: boolean;
  isCustom: boolean;
}

export interface ContactForm {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  interest: string[];
  budget: string;
  timeline: string;
}

export interface LandingPageData {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    ctaText: string;
    ctaSecondary: string;
    backgroundImage: string;
  };
  features: Feature[];
  useCases: UseCase[];
  testimonials: Testimonial[];
  pricing: PricingPlan[];
  statistics: {
    totalUsers: number;
    totalCameras: number;
    totalEvents: number;
    uptime: number;
  };
}

export interface LandingFilters {
  category: string;
  industry: string;
  priceRange: {
    min: number;
    max: number;
  };
}
