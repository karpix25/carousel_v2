import { Color } from 'colorjs.io';
import { LineBreaker } from 'css-line-break';
import type { TypographySettings } from '../types/index.js';

export class TypographyService {
  private static hangingPunctuationChars = ['.', ',', ';', ':', '!', '?', '"', "'", '»', '›'];
  
  static calculateOptimalLineHeight(fontSize: number): number {
    // Golden ratio based line height
    return fontSize * 1.618;
  }
  
  static applyHangingPunctuation(text: string): string {
    return text.replace(
      new RegExp(`([${this.hangingPunctuationChars.join('')}])`, 'g'),
      '<span style="margin-left: -0.3em; text-indent: 0.3em; display: inline-block;">$1</span>'
    );
  }
  
  static controlWidowsOrphans(text: string): string {
    // Replace space before last word with non-breaking space
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
    // Simplified width calculation - in real implementation use actual font metrics
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
    
    // Adjust lightness to meet contrast requirements
    const targetLightness = bg.get('oklch.l') > 0.5 ? 0.1 : 0.9;
    return fg.set('oklch.l', targetLightness).toString({ format: 'hex' });
  }
}
