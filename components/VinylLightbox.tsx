'use client';

import { useEffect, useState } from 'react';
import type { Vinyl, ConditionGrade } from '@/hooks/useVinyls';
import { GRADE_SCORE } from '@/hooks/useVinyls';
import { AMBER, CYBER_GREEN, CYBER_RED } from '@/lib/theme';

interface Props {
  vinyl: Vinyl;
  onClose: () => void;
}

function artistColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 65%, 62%)`;
}

async function extractColor(src: string): Promise<string | null> {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 50; canvas.height = 50;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, 50, 50);
        const d = ctx.getImageData(0, 0, 50, 50).data;
        let r = 0, g = 0, b = 0, n = 0;
        for (let i = 0; i < d.length; i += 4) {
          const br = (d[i] + d[i + 1] + d[i + 2]) / 3;
          if (br > 25 && br < 230) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
        }
        resolve(n > 0 ? `rgb(${Math.round(r / n)},${Math.round(g / n)},${Math.round(b / n)})` : null);
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function VinylLightbox({ vinyl: v, onClose }: Props) {
  const [accent, setAccent] = useState(AMBER);

  const score = v.condition_grade
    ? (GRADE_SCORE[v.condition_grade as ConditionGrade] ?? 5)
    : (v.condition ?? 5);

  useEffect(() => {
    if (v.image_url) {
      extractColor(v.image_url).then(c => setAccent(c || artistColor(v.artist)));
    } else {
      setAccent(artistColor(v.artist));
    }
  }, [v.image_url, v.artist]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 3000,
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          display: 'flex', alignItems: 'center', gap: 64,
          maxWidth: 900, width: '100%',
          flexWrap: 'wrap', justifyContent: 'center',
        }}
      >
        {/* Vinyl disk */}
        <div style={{ flexShrink: 0, width: 'min(400px, 80vw)', aspectRatio: '1/1', position: 'relative' }}>
          <div style={{
            width: '100%', height: '100%',
            borderRadius: '50%', overflow: 'hidden', position: 'relative',
            animation: 'vinyl-spin 1.8s linear infinite',
            boxShadow: `0 0 80px ${accent}60, 0 0 0 1px ${accent}30`,
          }}>
            {v.image_url
              ? <img src={v.image_url} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <div style={{ width: '100%', height: '100%', background: 'radial-gradient(circle, #2a2a2a 0%, #111 40%, #0a0a0a 100%)' }} />
            }
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: `
                radial-gradient(circle, transparent 28%, rgba(0,0,0,0.2) 29%, transparent 30%),
                radial-gradient(circle, transparent 36%, rgba(0,0,0,0.15) 37%, transparent 38%),
                radial-gradient(circle, transparent 44%, rgba(0,0,0,0.12) 45%, transparent 46%),
                radial-gradient(circle, transparent 52%, rgba(0,0,0,0.1) 53%, transparent 54%),
                radial-gradient(circle, transparent 60%, rgba(0,0,0,0.08) 61%, transparent 62%),
                radial-gradient(circle, transparent 68%, rgba(0,0,0,0.06) 69%, transparent 70%)
              `,
            }} />
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: '12%', height: '12%', borderRadius: '50%',
              background: '#080808', border: '1px solid rgba(255,255,255,0.1)', zIndex: 2,
            }} />
          </div>
        </div>

        {/* Detaylar */}
        <div style={{ flex: 1, minWidth: 220, fontFamily: 'monospace' }}>
          <div style={{ color: accent, fontSize: 11, letterSpacing: 3, marginBottom: 8 }}>
            {v.artist}
          </div>
          <div style={{ color: '#fff', fontSize: 28, fontWeight: 900, lineHeight: 1.15, marginBottom: 16, fontFamily: 'sans-serif' }}>
            {v.title}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'YIL',     value: v.press_year },
              { label: 'LABEL',   value: v.label },
              { label: 'KAT. NO', value: v.catalog_number },
              { label: 'BOYUT',   value: v.size },
              { label: 'RENK',    value: v.color },
            ].filter(r => r.value).map(row => (
              <div key={row.label} style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
                <span style={{ fontSize: 9, opacity: 0.4, letterSpacing: 2, width: 56, flexShrink: 0 }}>{row.label}</span>
                <span style={{ fontSize: 13, color: '#fff', opacity: 0.85 }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Kondisyon */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 9, opacity: 0.4, letterSpacing: 2 }}>KONDİSYON</span>
              <span style={{ fontSize: 16, fontWeight: 'bold', color: accent }}>
                {v.condition_grade ?? `${v.condition}/10`}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 3 }}>
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} style={{
                  flex: 1, height: 4, borderRadius: 2,
                  background: i < score ? accent : 'rgba(255,255,255,0.08)',
                }} />
              ))}
            </div>
          </div>

          {/* Genre / style */}
          {(v.genre || v.style) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 20 }}>
              {v.genre?.split(', ').map(g => (
                <span key={g} style={{
                  fontSize: 10, padding: '3px 10px', borderRadius: 4,
                  background: `${accent}20`, color: accent, letterSpacing: 1,
                }}>
                  {g.toUpperCase()}
                </span>
              ))}
              {v.style?.split(', ').map(s => (
                <span key={s} style={{
                  fontSize: 10, padding: '3px 10px', borderRadius: 4,
                  background: 'rgba(0,255,100,0.1)', color: CYBER_GREEN, letterSpacing: 1,
                }}>
                  {s.toUpperCase()}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={onClose}
            style={{
              marginTop: 32, background: 'none', border: `1px solid rgba(255,255,255,0.15)`,
              color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: 11,
              padding: '8px 20px', borderRadius: 4, cursor: 'pointer', letterSpacing: 2,
            }}
          >
            [ESC] KAPAT
          </button>
        </div>
      </div>
    </div>
  );
}
