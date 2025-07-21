export class PatternService {
  static generateSVGPattern(type: string, color: string): string {
    const patterns = {
      dots: `
        <pattern id="dots" patternUnits="userSpaceOnUse" width="20" height="20">
          <circle cx="10" cy="10" r="2" fill="${color}" opacity="0.1"/>
        </pattern>
      `,
      lines: `
        <pattern id="lines" patternUnits="userSpaceOnUse" width="20" height="20">
          <path d="M0,10 L20,10" stroke="${color}" stroke-width="1" opacity="0.1"/>
        </pattern>
      `,
      grid: `
        <pattern id="grid" patternUnits="userSpaceOnUse" width="20" height="20">
          <path d="M20,0 L0,0 L0,20" fill="none" stroke="${color}" stroke-width="1" opacity="0.05"/>
        </pattern>
      `,
      diagonal: `
        <pattern id="diagonal" patternUnits="userSpaceOnUse" width="20" height="20">
          <path d="M0,20 L20,0" stroke="${color}" stroke-width="1" opacity="0.1"/>
        </pattern>
      `
    };
    
    return patterns[type as keyof typeof patterns] || patterns.dots;
  }
}
