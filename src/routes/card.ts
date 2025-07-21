import { Hono } from 'hono';
import { MarkdownParser } from '../services/markdown-parser.js';
import { TypographyService } from '../services/typography.js';
import { CardRenderer } from '../services/card-renderer.js';
import type { CardConfig } from '../types/index.js';

const card = new Hono();

card.post('/generate', async (c) => {
  try {
    const body = await c.req.json();
    
    // Default configuration
    const config: CardConfig = {
      content: body.content || '',
      style: body.style || 'modern',
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
        width: body.dimensions?.width || 1600,
        height: body.dimensions?.height || 2000
      },
      features: {
        hangingPunctuation: body.features?.hangingPunctuation ?? true,
        widowOrphanControl: body.features?.widowOrphanControl ?? true,
        coloredText: body.features?.coloredText ?? true,
        svgPattern: body.features?.svgPattern || null
      }
    };
    
    // Validate input
    if (!config.content.trim()) {
      return c.json({ error: 'Content is required' }, 400);
    }
    
    // Parse markdown content
    const parsedContent = MarkdownParser.parse(config.content);
    
    // Apply typography enhancements
    if (config.features.hangingPunctuation) {
      parsedContent.body = TypographyService.applyHangingPunctuation(parsedContent.body);
    }
    
    if (config.features.widowOrphanControl) {
      parsedContent.body = TypographyService.controlWidowsOrphans(parsedContent.body);
    }
    
    // Ensure color contrast
    config.colorTheme.text = TypographyService.ensureContrast(
      config.colorTheme.text,
      config.colorTheme.background
    );
    
    // Generate card
    const imageBuffer = await CardRenderer.render(config, parsedContent);
    
    // Return PNG image
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

// Health check endpoint
card.get('/health', (c) => {
  return c.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export { card };
