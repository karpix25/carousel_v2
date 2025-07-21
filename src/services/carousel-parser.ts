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
        const subtitle = (nextToken && nextToken.type === 'paragraph' && 'text' in nextToken) ? nextToken.text : '';
        
        slides.push({
          type: 'intro',
          title: 'text' in token ? token.text : '',
          text: subtitle,
          color: 'accent'
        });
        
        // Пропускаем следующий токен если он стал subtitle
        if (subtitle) i++;
        
      } else if (token.type === 'heading' && token.depth === 2) {
        // ## Заголовок = text слайд
        currentSlide = {
          type: 'text',
          title: 'text' in token ? token.text : '',
          text: '',
          color: 'default'
        };
        slides.push(currentSlide);
        
      } else if (token.type === 'blockquote') {
        // > Цитата = quote слайд
        const quoteText = (token as any).tokens?.[0]?.text || '';
        slides.push({
          type: 'quote',
          text: quoteText,
          color: 'accent',
          size: quoteText.length > 100 ? 'small' : 'large'
        });
        
      } else if (currentSlide && (token.type === 'paragraph' || token.type === 'list')) {
        // Добавляем контент к текущему слайду - ИСПРАВЛЯЕМ ПРОВЕРКУ null
        if (token.type === 'paragraph' && 'text' in token && currentSlide) {
          const content = (currentSlide as any).content || [];
          content.push({ type: 'paragraph', text: token.text });
          (currentSlide as any).content = content;
        } else if (token.type === 'list' && 'items' in token && currentSlide) {
          const content = (currentSlide as any).content || [];
          content.push({
            type: 'list',
            items: token.items.map((item: any) => item.text || '')
          });
          (currentSlide as any).content = content;
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
