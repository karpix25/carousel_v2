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
