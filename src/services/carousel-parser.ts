// src/services/carousel-parser.ts
import { marked } from 'marked';

export interface SlideData {
  type: 'intro' | 'text' | 'quote';
  title?: string;
  subtitle?: string;
  text?: string;
  color: 'default' | 'accent';
  size?: 'small' | 'medium' | 'large';
}

export interface CarouselSettings {
  username?: string;
  authorName?: string;
  brandColor?: string;
  style?: 'instagram' | 'modern' | 'classic';
  finalSlide?: {
    enabled: boolean;
    type: 'cta' | 'contact' | 'brand';
    title?: string;
    text?: string;
    color?: 'default' | 'accent';
  };
}

export class CarouselParser {
  static async parseMarkdownToSlides(text: string): Promise<SlideData[]> {
    const tokens = marked.lexer(text);
    const slides: SlideData[] = [];
    let currentSlide: SlideData | null = null;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.type === 'heading' && token.depth === 1) {
        // # Заголовок = intro слайд
        const nextToken = tokens[i + 1];
        const subtitle = (nextToken && nextToken.type === 'paragraph') ? nextToken.text : '';
        
        slides.push({
          type: 'intro',
          title: token.text,
          text: subtitle,
          color: 'accent'
        });
        
        // Пропускаем следующий токен если он стал subtitle
        if (subtitle) i++;
        
      } else if (token.type === 'heading' && token.depth === 2) {
        // ## Заголовок = text слайд
        currentSlide = {
          type: 'text',
          title: token.text,
          text: '',
          color: 'default',
          content: []
        } as any;
        slides.push(currentSlide);
        
      } else if (token.type === 'blockquote') {
        // > Цитата = quote слайд
        const quoteText = token.tokens?.[0]?.text || '';
        slides.push({
          type: 'quote',
          text: quoteText,
          color: 'accent',
          size: quoteText.length > 100 ? 'small' : 'large'
        });
        
      } else if (currentSlide && (token.type === 'paragraph' || token.type === 'list')) {
        // Добавляем контент к текущему слайду
        if (token.type === 'paragraph') {
          (currentSlide as any).content = (currentSlide as any).content || [];
          (currentSlide as any).content.push({ type: 'paragraph', text: token.text });
        } else if (token.type === 'list') {
          (currentSlide as any).content = (currentSlide as any).content || [];
          (currentSlide as any).content.push({
            type: 'list',
            items: token.items.map(item => item.text)
          });
        }
      }
    }

    // Объединяем контент для text слайдов
    slides.forEach(slide => {
      if ((slide as any).content) {
        const content = (slide as any).content;
        const paragraphs = content.filter((c: any) => c.type === 'paragraph').map((c: any) => c.text);
        const lists = content.filter((c: any) => c.type === 'list');

        let fullText = '';
        if (paragraphs.length) {
          fullText += paragraphs.join('\n\n');
        }
        if (lists.length) {
          if (fullText) fullText += '\n\n';
          lists.forEach((list: any) => {
            fullText += list.items.map((item: string) => `• ${item}`).join('\n');
          });
        }
        slide.text = fullText;
        delete (slide as any).content;
      }
    });

    return slides;
  }

  static addFinalSlide(slides: SlideData[], settings: CarouselSettings): SlideData[] {
    const finalSlideConfig = settings.finalSlide;
    if (!finalSlideConfig?.enabled) return slides;

    const templates = {
      cta: { 
        title: 'Подписывайтесь!', 
        text: 'Больше контента в профиле', 
        color: 'accent' as const 
      },
      contact: { 
        title: 'Связаться:', 
        text: 'email@example.com\n\nTelegram: @username', 
        color: 'default' as const 
      },
      brand: { 
        title: 'Спасибо за внимание!', 
        text: 'Помогаю бизнесу расти', 
        color: 'accent' as const 
      }
    };

    const template = templates[finalSlideConfig.type] || templates.cta;
    const finalSlide: SlideData = {
      type: 'text',
      ...template,
      title: finalSlideConfig.title || template.title,
      text: finalSlideConfig.text || template.text,
      color: finalSlideConfig.color || template.color
    };

    return [...slides, finalSlide];
  }
}

// src/services/carousel-renderer.ts
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

// src/routes/carousel.ts
import { Hono } from 'hono';
import { CarouselRenderer } from '../services/carousel-renderer.js';

const carousel = new Hono();

carousel.post('/generate-carousel', async (c) => {
  const startTime = Date.now();
  
  try {
    const body = await c.req.json();
    const { text, settings = {} } = body;
    
    if (!text || typeof text !== 'string') {
      return c.json({ error: 'Требуется валидный text' }, 400);
    }

    console.log(`🎯 Генерация карусели (${text.length} символов)`);

    const result = await CarouselRenderer.generateCarousel(text, settings);

    const processingTime = Date.now() - startTime;
    console.log(`✅ Готово за ${processingTime}ms (${result.slides.length} слайдов)`);

    return c.json(result);

  } catch (error) {
    console.error('❌ Ошибка:', error);
    return c.json({ 
      error: 'Failed to generate carousel',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

carousel.get('/health', (c) => {
  return c.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    engine: 'satori-carousel'
  });
});

export { carousel };

// src/server.ts - ОБНОВЛЕННЫЙ
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { card } from './routes/card.js';
import { carousel } from './routes/carousel.js';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.route('/api/card', card);
app.route('/api', carousel);  // /api/generate-carousel

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Professional Card Generator API',
    version: '1.0.0',
    endpoints: {
      'POST /api/card/generate': 'Generate single card from Markdown',
      'POST /api/generate-carousel': 'Generate full carousel from Markdown', 
      'GET /api/card/health': 'Health check for cards',
      'GET /api/health': 'Health check for carousel'
    }
  });
});

// Error handling
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  }, 500);
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

console.log(`🚀 Professional Card API starting on port ${port}`);

serve({
  fetch: app.fetch,
  port
});
