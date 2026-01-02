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

export const formThemes: FormTheme[] = [];

export const defaultTheme: FormTheme = {
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
};

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
  if (!theme || !theme.colors || !theme.fonts) {
    return applyThemeStyles(defaultTheme);
  }

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
