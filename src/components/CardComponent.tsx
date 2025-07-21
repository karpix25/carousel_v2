import type { CardConfig, ParsedContent } from '../types/index.js';

interface CardProps {
  config: CardConfig;
  content: ParsedContent;
}

// Карточка в стиле Instagram Stories/Posts (основанная на ваших примерах)
export function InstagramCard({ config, content }: CardProps) {
  const { colorTheme, typography, dimensions, features } = config;
  
  return (
    <div
      style={{
        width: dimensions.width,
        height: dimensions.height,
        background: colorTheme.background,
        padding: '48px 40px 40px 40px', // Отступы как в примерах
        display: 'flex',
        flexDirection: 'column',
        fontFamily: typography.bodyFont,
        color: colorTheme.text,
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden'
      }}
    >
      {/* Header с username и номером слайда */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '60px',
          fontSize: '16px',
          fontWeight: 400,
          opacity: 0.7
        }}
      >
        <span>@{config.username || 'username'}</span>
        <span>{config.slideNumber || '1/10'}</span>
      </div>
      
      {/* Основной заголовок */}
      {content.title && (
        <h1
          style={{
            fontFamily: typography.headingFont,
            fontSize: '48px', // Крупный заголовок как в примерах
            lineHeight: 1.1,
            fontWeight: 700,
            marginBottom: '40px',
            letterSpacing: '-0.02em'
          }}
        >
          {/* Поддержка выделенного текста */}
          {content.title.split(' ').map((word, index) => {
            if (content.highlights.includes(word)) {
              return (
                <span key={index} style={{ textDecoration: 'underline', textDecorationColor: colorTheme.accent }}>
                  {word}{' '}
                </span>
              );
            }
            return word + ' ';
          })}
        </h1>
      )}
      
      {/* Основной текст */}
      <div
        style={{
          flex: 1,
          fontSize: '20px',
          lineHeight: 1.4,
          marginBottom: '40px'
        }}
        dangerouslySetInnerHTML={{ __html: content.body }}
      />
      
      {/* Footer с именем/подписью */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '16px',
          opacity: 0.6
        }}
      >
        <span>{config.authorName || 'Твоё имя или подпись'}</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12,5 19,12 12,19"></polyline>
        </svg>
      </div>
      
      {/* Декоративные кривые как в примерах */}
      {features.svgPattern && (
        <svg
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '300px',
            height: '400px',
            opacity: 0.1,
            pointerEvents: 'none'
          }}
          viewBox="0 0 300 400"
        >
          <path
            d="M300,0 C200,100 250,200 150,300 C100,350 200,400 300,400 Z"
            fill={colorTheme.accent}
          />
        </svg>
      )}
    </div>
  );
}

export function ModernCard({ config, content }: CardProps) {
  const { colorTheme, typography, dimensions, features } = config;
  
  return (
    <div
      style={{
        width: dimensions.width,
        height: dimensions.height,
        background: colorTheme.background,
        padding: '64px 48px', // Более сбалансированные отступы
        display: 'flex',
        flexDirection: 'column',
        fontFamily: typography.bodyFont,
        fontSize: typography.fontSize,
        lineHeight: typography.lineHeight,
        color: colorTheme.text,
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden'
      }}
    >
      {/* Минималистичный заголовок */}
      {content.title && (
        <h1
          style={{
            fontFamily: typography.headingFont,
            fontSize: '36px',
            lineHeight: 1.2,
            color: colorTheme.primary,
            marginBottom: '32px',
            fontWeight: 600,
            letterSpacing: '-0.025em'
          }}
        >
          {content.title}
        </h1>
      )}
      
      {/* Основной контент */}
      <div
        style={{
          flex: 1,
          fontSize: '18px',
          lineHeight: 1.6,
          color: colorTheme.text
        }}
        dangerouslySetInnerHTML={{ __html: content.body }}
      />
      
      {/* Минималистичный акцент */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${colorTheme.primary}, ${colorTheme.accent})`
        }}
      />
    </div>
  );
}

export function ClassicCard({ config, content }: CardProps) {
  const { colorTheme, typography, dimensions } = config;
  
  return (
    <div
      style={{
        width: dimensions.width,
        height: dimensions.height,
        background: colorTheme.background,
        padding: '100px 80px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: typography.bodyFont,
        fontSize: typography.fontSize,
        lineHeight: typography.lineHeight,
        color: colorTheme.text,
        border: `3px solid ${colorTheme.primary}`,
        position: 'relative'
      }}
    >
      {/* Corner Decorations */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          width: '60px',
          height: '60px',
          border: `2px solid ${colorTheme.primary}`,
          borderRight: 'none',
          borderBottom: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          border: `2px solid ${colorTheme.primary}`,
          borderLeft: 'none',
          borderTop: 'none'
        }}
      />
      
      {/* Title */}
      {content.title && (
        <h1
          style={{
            fontFamily: typography.headingFont,
            fontSize: typography.fontSize * 2.2,
            lineHeight: 1.3,
            color: colorTheme.primary,
            marginBottom: '30px',
            textAlign: 'center',
            fontWeight: 600,
            letterSpacing: '0.02em'
          }}
        >
          {content.title}
        </h1>
      )}
      
      {/* Divider */}
      <div
        style={{
          width: '200px',
          height: '2px',
          background: colorTheme.accent,
          margin: '0 auto 40px',
          opacity: 0.7
        }}
      />
      
      {/* Content */}
      <div
        style={{
          flex: 1,
          textAlign: 'justify',
          fontSize: typography.fontSize,
          lineHeight: typography.lineHeight
        }}
        dangerouslySetInnerHTML={{ __html: content.body }}
      />
    </div>
  );
}
