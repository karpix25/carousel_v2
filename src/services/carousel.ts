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
