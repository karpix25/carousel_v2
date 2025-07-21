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

  static parse(markdown: string): ParsedContent {
    const title = this.extractTitle(markdown);
    const subtitle = this.extractSubtitle(markdown);
    const highlights = this.extractHighlights(markdown);
    
    // Remove titles and convert to HTML
    let processedMarkdown = markdown
      .replace(/^#\s+.+$/m, '')
      .replace(/^##\s+.+$/m, '')
      .replace(/\*\*\*(.*?)\*\*\*/g, '<span class="highlight">$1</span>')
      .trim();
    
    const body = marked(processedMarkdown);
    
    return {
      title,
      subtitle,
      body,
      highlights
    };
  }
}
