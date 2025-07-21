// src/services/typography.ts
import Color from 'colorjs.io';
import { LineBreaker } from 'css-line-break';
import type { TypographySettings } from '../types/index.js';

export class TypographyService {
  private static hangingPunctuationChars = ['.', ',', ';', ':', '!', '?', '"', "'", '»', '›'];
  
  static calculateOptimalLineHeight(fontSize: number): number {
    return fontSize * 1.618;
  }
  
  static applyHangingPunctuation(text: string): string {
    return text.replace(
      new RegExp(`([${this.hangingPunctuationChars.join('')}])`, 'g'),
      '<span style="margin-left: -0.3em; text-indent: 0.3em; display: inline-block;">$1</span>'
    );
  }
  
  static controlWidowsOrphans(text: string): string {
    return text.replace(/\s+(\S+\s*)$/, '\u00A0$1');
  }
  
  static optimizeLineBreaks(text: string, maxWidth: number): string {
    const breaker = new LineBreaker(text);
    let result = '';
    let currentLine = '';
    
    for (const word of breaker) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      
      if (this.measureTextWidth(testLine) > maxWidth && currentLine) {
        result += this.controlWidowsOrphans(currentLine) + '\n';
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      result += this.controlWidowsOrphans(currentLine);
    }
    
    return result;
  }
  
  private static measureTextWidth(text: string): number {
    return text.length * 0.6;
  }
  
  static generateColorVariations(baseColor: string, count: number = 5): string[] {
    const color = new Color(baseColor);
    const variations: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const lightness = 0.2 + (i / count) * 0.6;
      const variation = color.set('oklch.l', lightness);
      variations.push(variation.toString({ format: 'hex' }));
    }
    
    return variations;
  }
  
  static ensureContrast(foreground: string, background: string, minRatio: number = 4.5): string {
    const fg = new Color(foreground);
    const bg = new Color(background);
    
    const contrast = Math.abs(fg.contrast(bg, 'WCAG21'));
    
    if (contrast >= minRatio) {
      return foreground;
    }
    
    const targetLightness = bg.get('oklch.l') > 0.5 ? 0.1 : 0.9;
    return fg.set('oklch.l', targetLightness).toString({ format: 'hex' });
  }
}

// src/services/markdown-parser.ts
import { marked } from 'marked';
import type { ParsedContent } from '../types/index.js';

export class MarkdownParser {
  private static extractTitle(content: string): string | undefined {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return titleMatch?.[1];
  }

  private static extractSubtitle(content: string): string | undefined {
    const subtitleMatch = content.match(/^##\s+(.+)$/m);
    return subtitleMatch?.[1];
  }

  private static extractHighlights(content: string): string[] {
    const highlights: string[] = [];
    const coloredTextRegex = /\*\*\*(.*?)\*\*\*/g;
    let match;
    
    while ((match = coloredTextRegex.exec(content)) !== null) {
      highlights.push(match[1]);
    }
    
    return highlights;
  }

  static async parse(markdown: string): Promise<ParsedContent> {
    const title = this.extractTitle(markdown);
    const subtitle = this.extractSubtitle(markdown);
    const highlights = this.extractHighlights(markdown);
    
    let processedMarkdown = markdown
      .replace(/^#\s+.+$/m, '')
      .replace(/^##\s+.+$/m, '')
      .replace(/\*\*\*(.*?)\*\*\*/g, '<span class="highlight">$1</span>')
      .trim();
    
    const body = await marked(processedMarkdown);
    
    return {
      title,
      subtitle,
      body,
      highlights
    };
  }
}

// src/services/card-renderer.ts
import satori from 'satori';
import sharp from 'sharp';
import { readFile } from 'fs/promises';
import { InstagramCard, ModernCard, ClassicCard } from '../components/CardComponent.js';
import type { CardConfig, ParsedContent } from '../types/index.js';

export class CardRenderer {
  private static async loadFont(path: string): Promise<ArrayBuffer> {
    const font = await readFile(path);
    return font.buffer;
  }
  
  static async render(config: CardConfig, content: ParsedContent): Promise<Buffer> {
    try {
      const [regularFont, boldFont] = await Promise.all([
        this.loadFont('./assets/fonts/Inter-Regular.ttf'),
        this.loadFont('./assets/fonts/Inter-Bold.ttf')
      ]);
      
      const CardComponent = config.style === 'instagram' ? InstagramCard : 
                           config.style === 'modern' ? ModernCard : ClassicCard;
      
      const svg = await satori(
        CardComponent({ config, content }),
        {
          width: config.dimensions.width,
          height: config.dimensions.height,
          fonts: [
            {
              name: 'Inter',
              data: regularFont,
              weight: 400,
              style: 'normal'
            },
            {
              name: 'Inter',
              data: boldFont,
              weight: 700,
              style: 'normal'
            }
          ]
        }
      );
      
      const png = await sharp(Buffer.from(svg))
        .png({
          quality: 95,
          compressionLevel: 6
        })
        .toBuffer();
      
      return png;
    } catch (error) {
      console.error('Card rendering error:', error);
      throw new Error(`Failed to render card: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// src/routes/card.ts
import { Hono } from 'hono';
import { MarkdownParser } from '../services/markdown-parser.js';
import { TypographyService } from '../services/typography.js';
import { CardRenderer } from '../services/card-renderer.js';
import type { CardConfig } from '../types/index.js';

const card = new Hono();

card.post('/generate', async (c) => {
  try {
    const body = await c.req.json();
    
    const config: CardConfig = {
      content: body.content || '',
      style: body.style || 'instagram',
      username: body.username,
      authorName: body.authorName,
      slideNumber: body.slideNumber,
      colorTheme: {
        primary: body.colorTheme?.primary || '#2563eb',
        secondary: body.colorTheme?.secondary || '#64748b',
        accent: body.colorTheme?.accent || '#f59e0b',
        background: body.colorTheme?.background || '#ffffff',
        text: body.colorTheme?.text || '#1f2937'
      },
      typography: {
        headingFont: body.typography?.headingFont || 'Inter',
        bodyFont: body.typography?.bodyFont || 'Inter',
        fontSize: body.typography?.fontSize || 16,
        lineHeight: body.typography?.lineHeight || 1.6
      },
      dimensions: {
        width: body.dimensions?.width || 1080,
        height: body.dimensions?.height || 1350
      },
      features: {
        hangingPunctuation: body.features?.hangingPunctuation ?? true,
        widowOrphanControl: body.features?.widowOrphanControl ?? true,
        coloredText: body.features?.coloredText ?? true,
        svgPattern: body.features?.svgPattern || null
      }
    };
    
    if (!config.content.trim()) {
      return c.json({ error: 'Content is required' }, 400);
    }
    
    const parsedContent = await MarkdownParser.parse(config.content);
    
    if (config.features.hangingPunctuation) {
      parsedContent.body = TypographyService.applyHangingPunctuation(parsedContent.body);
    }
    
    if (config.features.widowOrphanControl) {
      parsedContent.body = TypographyService.controlWidowsOrphans(parsedContent.body);
    }
    
    config.colorTheme.text = TypographyService.ensureContrast(
      config.colorTheme.text,
      config.colorTheme.background
    );
    
    const imageBuffer = await CardRenderer.render(config, parsedContent);
    
    c.header('Content-Type', 'image/png');
    c.header('Content-Length', imageBuffer.length.toString());
    c.header('Cache-Control', 'public, max-age=3600');
    
    return c.body(imageBuffer);
    
  } catch (error) {
    console.error('Card generation error:', error);
    return c.json({ 
      error: 'Failed to generate card',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

card.get('/health', (c) => {
  return c.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export { card };
