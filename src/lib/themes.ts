// Pre-designed form themes
export interface FormTheme {
  id: string;
  name: string;
  description: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    accent: string;
    muted: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  backgroundImage?: string;
  backgroundGradient?: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  cardStyle: 'flat' | 'elevated' | 'glass' | 'outlined';
}

export const formThemes: FormTheme[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Clean and professional with subtle elegance',
    preview: '/themes/modern-minimal.png',
    colors: {
      primary: '#6366F1', // Indigo
      secondary: '#EC4899', // Pink
      background: '#0F172A', // Slate 900
      foreground: '#FFFFFF',
      accent: '#F59E0B', // Amber
      muted: '#64748B',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    backgroundGradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)',
    borderRadius: 'lg',
    cardStyle: 'glass',
  },
  {
    id: 'vibrant-bold',
    name: 'Vibrant Bold',
    description: 'Eye-catching and energetic design',
    preview: '/themes/vibrant-bold.png',
    colors: {
      primary: '#F43F5E', // Rose
      secondary: '#8B5CF6', // Violet
      background: '#18181B', // Zinc 900
      foreground: '#FAFAFA',
      accent: '#FBBF24', // Yellow
      muted: '#71717A',
    },
    fonts: {
      heading: 'Poppins',
      body: 'Inter',
    },
    backgroundGradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
    borderRadius: 'xl',
    cardStyle: 'elevated',
  },
  {
    id: 'corporate-pro',
    name: 'Corporate Professional',
    description: 'Traditional and trustworthy for business',
    preview: '/themes/corporate-pro.png',
    colors: {
      primary: '#1E40AF', // Blue 800
      secondary: '#059669', // Emerald
      background: '#F8FAFC', // Slate 50
      foreground: '#1E293B',
      accent: '#0284C7', // Sky
      muted: '#94A3B8',
    },
    fonts: {
      heading: 'Roboto',
      body: 'Roboto',
    },
    backgroundGradient: 'linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%)',
    borderRadius: 'sm',
    cardStyle: 'outlined',
  },
  {
    id: 'nature-calm',
    name: 'Nature Calm',
    description: 'Soothing earth tones and organic feel',
    preview: '/themes/nature-calm.png',
    colors: {
      primary: '#059669', // Emerald
      secondary: '#84CC16', // Lime
      background: '#F0FDF4', // Green 50
      foreground: '#14532D',
      accent: '#F59E0B', // Amber
      muted: '#6B7280',
    },
    fonts: {
      heading: 'Merriweather',
      body: 'Open Sans',
    },
    backgroundGradient: 'linear-gradient(135deg, rgba(5, 150, 105, 0.05) 0%, rgba(132, 204, 22, 0.05) 100%)',
    borderRadius: 'md',
    cardStyle: 'flat',
  },
  {
    id: 'tech-futuristic',
    name: 'Tech Futuristic',
    description: 'Cutting-edge with neon accents',
    preview: '/themes/tech-futuristic.png',
    colors: {
      primary: '#06B6D4', // Cyan
      secondary: '#A855F7', // Purple
      background: '#0C0A09', // Stone 950
      foreground: '#FAFAF9',
      accent: '#10B981', // Emerald
      muted: '#78716C',
    },
    fonts: {
      heading: 'Space Grotesk',
      body: 'Inter',
    },
    backgroundGradient: 'radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
    borderRadius: 'lg',
    cardStyle: 'glass',
  },
  {
    id: 'playful-creative',
    name: 'Playful Creative',
    description: 'Fun and friendly for casual forms',
    preview: '/themes/playful-creative.png',
    colors: {
      primary: '#F97316', // Orange
      secondary: '#EC4899', // Pink
      background: '#FFF7ED', // Orange 50
      foreground: '#7C2D12',
      accent: '#8B5CF6', // Violet
      muted: '#9CA3AF',
    },
    fonts: {
      heading: 'Quicksand',
      body: 'Nunito',
    },
    backgroundGradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(236, 72, 153, 0.05) 50%, rgba(139, 92, 246, 0.05) 100%)',
    borderRadius: 'xl',
    cardStyle: 'elevated',
  },
  {
    id: 'elegant-dark',
    name: 'Elegant Dark',
    description: 'Sophisticated with gold accents',
    preview: '/themes/elegant-dark.png',
    colors: {
      primary: '#D97706', // Amber 600
      secondary: '#EAB308', // Yellow
      background: '#171717', // Neutral 900
      foreground: '#FAFAFA',
      accent: '#F59E0B', // Amber
      muted: '#A3A3A3',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Lato',
    },
    backgroundGradient: 'linear-gradient(135deg, rgba(217, 119, 6, 0.05) 0%, rgba(234, 179, 8, 0.05) 100%)',
    borderRadius: 'md',
    cardStyle: 'glass',
  },
];

export const defaultTheme: FormTheme = formThemes[0];

// Google Fonts to load
export const googleFonts = [
  'Inter:wght@300;400;500;600;700',
  'Poppins:wght@300;400;500;600;700',
  'Roboto:wght@300;400;500;700',
  'Merriweather:wght@300;400;700',
  'Open+Sans:wght@300;400;600;700',
  'Space+Grotesk:wght@300;400;500;600;700',
  'Quicksand:wght@300;400;500;600;700',
  'Nunito:wght@300;400;600;700',
  'Playfair+Display:wght@400;500;600;700',
  'Lato:wght@300;400;700',
];

// Helper function to get font import URL
export function getFontImportUrl(): string {
  return `https://fonts.googleapis.com/css2?${googleFonts.join('&')}&display=swap`;
}

// Helper function to apply theme to form
export function applyThemeStyles(theme: FormTheme): React.CSSProperties {
  return {
    '--theme-primary': theme.colors.primary,
    '--theme-secondary': theme.colors.secondary,
    '--theme-background': theme.colors.background,
    '--theme-foreground': theme.colors.foreground,
    '--theme-accent': theme.colors.accent,
    '--theme-muted': theme.colors.muted,
    '--theme-font-heading': theme.fonts.heading,
    '--theme-font-body': theme.fonts.body,
    '--theme-border-radius': theme.borderRadius === 'none' ? '0' :
                              theme.borderRadius === 'sm' ? '0.25rem' :
                              theme.borderRadius === 'md' ? '0.5rem' :
                              theme.borderRadius === 'lg' ? '0.75rem' : '1rem',
    backgroundImage: theme.backgroundGradient || 'none',
  } as React.CSSProperties;
}

// Helper to get card style classes
export function getCardStyleClasses(cardStyle: FormTheme['cardStyle']): string {
  switch (cardStyle) {
    case 'flat':
      return 'bg-white shadow-none border-0';
    case 'elevated':
      return 'bg-white shadow-2xl border-0';
    case 'glass':
      return 'glass-panel backdrop-blur-xl';
    case 'outlined':
      return 'bg-transparent border-2 border-current';
    default:
      return 'glass-panel';
  }
}
