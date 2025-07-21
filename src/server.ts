import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { card } from './routes/card.js';

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

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Professional Card Generator API',
    version: '1.0.0',
    endpoints: {
      'POST /api/card/generate': 'Generate professional card from Markdown',
      'GET /api/card/health': 'Health check'
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

// README.md usage example
/*
POST /api/card/generate

{
  "content": "# Professional Card\n## Subtitle\nThis is ***highlighted text*** with professional typography.\n\n- Clean design\n- Modern approach\n- High quality",
  "style": "modern",
  "colorTheme": {
    "primary": "#2563eb",
    "secondary": "#64748b", 
    "accent": "#f59e0b",
    "background": "#ffffff",
    "text": "#1f2937"
  },
  "typography": {
    "headingFont": "Inter",
    "bodyFont": "Inter", 
    "fontSize": 16,
    "lineHeight": 1.6
  },
  "features": {
    "hangingPunctuation": true,
    "widowOrphanControl": true,
    "coloredText": true,
    "svgPattern": "dots"
  }
}

Response: PNG image (1600x2000px)
*/
