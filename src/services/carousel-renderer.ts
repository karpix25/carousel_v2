import { CardRenderer } from './card-renderer.js';
import { CarouselParser, type SlideData, type CarouselSettings } from './carousel-parser.js';
import type { CardConfig, ParsedContent } from '../types/index.js';

export class CarouselRenderer {
  static async generateCarousel(text: string, settings: CarouselSettings = {}): Promise<{
    slides: SlideData[];
    images: string[];
    metadata: any;
  }> {
    const startTime = Date.now();

    // Парсинг слайдов
    let slides = await CarouselParser.parseMarkdownToSlides(text);
    slides = CarouselParser.addFinalSlide(slides, settings);

    if (!slides.length) {
      slides = [{
        type: 'text',
        title: 'Ваш контент',
        text: text.substring(0, 200),
        color: 'default'
      }];
    }

    // Генерация изображений
    const images: string[] = [];
    const totalSlides = slides.length;

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const slideNumber = i + 1;

      // Конвертируем SlideData в CardConfig
      const cardConfig: CardConfig = {
        content: this.slideToMarkdown(slide),
        style: settings.style || 'instagram',
        username: settings.username,
        authorName: settings.authorName,
        slideNumber: `${slideNumber}/${totalSlides}`,
        colorTheme: {
          primary: settings.brandColor || '#2563eb',
          secondary: '#64748b',
          accent: settings.brandColor || '#f59e0b',
          background: slide.color === 'accent' ? (settings.brandColor || '#2563eb') : '#ffffff',
          text: slide.color === 'accent' ? '#ffffff' : '#1f2937'
        },
        typography: {
          headingFont: 'Inter',
          bodyFont: 'Inter',
          fontSize: 18,
          lineHeight: 1.5
        },
        dimensions: {
          width: 1080,
          height: 1350
        },
        features: {
          hangingPunctuation: true,
          widowOrphanControl: true,
          coloredText: true,
          svgPattern: 'curves'
        }
      };

      // Парсинг контента
      const parsedContent: ParsedContent = {
        title: slide.title,
        subtitle: slide.subtitle,
        body: slide.text || '',
        highlights: this.extractHighlights(slide.text || '')
      };

      // Рендеринг карточки
      const imageBuffer = await CardRenderer.render(cardConfig, parsedContent);
      const base64 = imageBuffer.toString('base64');
      images.push(base64);
    }

    const processingTime = Date.now() - startTime;

    return {
      slides,
      images,
      metadata: {
        totalSlides: slides.length,
        generatedAt: new Date().toISOString(),
        processingTime,
        settings,
        engine: 'satori-carousel'
      }
    };
  }

  private static slideToMarkdown(slide: SlideData): string {
    let markdown = '';
    
    if (slide.title) {
      markdown += `# ${slide.title}\n\n`;
    }
    
    if (slide.subtitle) {
      markdown += `## ${slide.subtitle}\n\n`;
    }
    
    if (slide.text) {
      markdown += slide.text;
    }
    
    return markdown;
  }

  private static extractHighlights(text: string): string[] {
    const highlights: string[] = [];
    const coloredTextRegex = /\*\*\*(.*?)\*\*\*/g;
    let match;
    
    while ((match = coloredTextRegex.exec(text)) !== null) {
      highlights.push(match[1]);
    }
    
    return highlights;
  }
}
