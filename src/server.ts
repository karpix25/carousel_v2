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
