'use client';

import { useState } from 'react';
import type { Vinyl } from '@/hooks/useVinyls';

interface Props {
  vinyl: Vinyl;
  index: number;
  onView: (v: Vinyl) => void;
}

export function VinylRow({ vinyl, index, onView }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onView(vinyl)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 28,
        padding: '16px 40px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        cursor: 'pointer',
        background: hovered ? 'rgba(255,255,255,0.02)' : 'transparent',
        transition: 'background 0.2s ease',
        userSelect: 'none',
      }}
    >
      {/* Sleeve */}
      <div style={{
        width: 76,
        height: 84,
        position: 'relative',
        flexShrink: 0,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 2,
      }}>
        <div style={{
          position: 'absolute',
          bottom: 6,
          left: 6,
          right: 6,
          aspectRatio: '1',
          transform: hovered ? 'translateY(-22px)' : 'translateY(0)',
          transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease',
          boxShadow: hovered
            ? '0 16px 32px rgba(0,0,0,0.9), 0 4px 12px rgba(0,0,0,0.6)'
            : '0 2px 6px rgba(0,0,0,0.5)',
          borderRadius: 1,
          overflow: 'hidden',
          background: '#111',
        }}>
          {vinyl.image_url ? (
            <img
              src={vinyl.image_url}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0.15, fontSize: 22,
            }}>◉</div>
          )}
        </div>
      </div>

      {/* Index */}
      <div style={{
        width: 28,
        fontSize: 11,
        opacity: 0.18,
        fontVariantNumeric: 'tabular-nums',
        flexShrink: 0,
        letterSpacing: 1,
        fontFamily: 'monospace',
      }}>
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* Info */}
      <div style={{
        flex: 1,
        minWidth: 0,
        transform: hovered ? 'translateX(4px)' : 'translateX(0)',
        transition: 'transform 0.25s ease',
      }}>
        <div style={{
          fontSize: 11,
          opacity: 0.38,
          letterSpacing: 2,
          textTransform: 'uppercase',
          marginBottom: 5,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {vinyl.artist}
        </div>
        <div style={{
          fontSize: 18,
          fontWeight: 400,
          color: '#fff',
          letterSpacing: -0.3,
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {vinyl.title}
        </div>
        {vinyl.genre && (
          <div style={{
            fontSize: 10,
            opacity: 0.22,
            marginTop: 5,
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}>
            {vinyl.genre.split(', ')[0]}
          </div>
        )}
      </div>

      {/* Meta */}
      <div style={{
        textAlign: 'right',
        flexShrink: 0,
        opacity: hovered ? 0.55 : 0.25,
        transition: 'opacity 0.2s ease',
        fontSize: 12,
        lineHeight: 1.8,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {vinyl.press_year && <div>{vinyl.press_year}</div>}
        {vinyl.label && (
          <div style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.7 }}>
            {vinyl.label}
          </div>
        )}
        {vinyl.size && <div style={{ fontSize: 10, opacity: 0.7 }}>{vinyl.size}</div>}
      </div>

      {/* Condition badge */}
      {vinyl.condition_grade && (
        <div style={{
          flexShrink: 0,
          width: 34,
          height: 34,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 9,
          letterSpacing: 0.5,
          opacity: hovered ? 0.65 : 0.3,
          transition: 'opacity 0.2s ease',
          textTransform: 'uppercase',
          fontFamily: 'monospace',
        }}>
          {vinyl.condition_grade}
        </div>
      )}
    </div>
  );
}
