export interface CardConfig {
  content: string; // Markdown content
  style: 'instagram' | 'modern' | 'classic';
  username?: string; // Для Instagram стиля
  authorName?: string; // Имя автора
  slideNumber?: string; // Номер слайда (1/10)
  colorTheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    fontSize: number;
    lineHeight: number;
  };
  dimensions: {
    width: number;
    height: number;
  };
  features: {
    hangingPunctuation: boolean;
    widowOrphanControl: boolean;
    coloredText: boolean;
    svgPattern: string | null;
  };
}

export interface ParsedContent {
  title?: string;
  subtitle?: string;
  body: string;
  highlights: string[];
}

export interface TypographySettings {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
}
