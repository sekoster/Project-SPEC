'use client';

import { useEffect, useRef, useState } from 'react';
import type { Vinyl, ConditionGrade } from '@/hooks/useVinyls';
import { GRADE_SCORE } from '@/hooks/useVinyls';
import { CYBER_RED, AMBER, actionBtn } from '@/lib/theme';

interface Props {
  vinyl: Vinyl;
  onEdit: (v: Vinyl) => void;
  onDelete: (id: string) => void;
  onView: (v: Vinyl) => void;
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

export function VinylCardSpatial({ vinyl: v, onEdit, onDelete, onView }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const [accent, setAccent] = useState('');

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: y * -12, y: x * 12 });
  };

  const handleMouseEnter = () => { setHovering(true); setSpinning(true); };
  const handleMouseLeave = () => { setTilt({ x: 0, y: 0 }); setHovering(false); setSpinning(false); };

  return (
    <div style={{ perspective: '1000px' }} onMouseMove={handleMouseMove} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div style={{
        background: '#0d0d0f',
        borderRadius: 20,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hovering ? 1.03 : 1})`,
        transition: hovering ? 'transform 0.1s ease' : 'transform 0.5s ease',
        boxShadow: hovering
          ? `0 24px 64px ${accent}50, 0 0 0 1px ${accent}50`
          : `0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)`,
        willChange: 'transform',
      }}>
        {/* Disk alanı */}
        <div
          onClick={() => onView(v)}
          style={{
            cursor: 'pointer', width: '100%', aspectRatio: '1/1',
            position: 'relative', padding: '10%',
            background: `radial-gradient(circle at 50% 10%, ${accent}18 0%, transparent 65%)`,
          }}
        >
          <div style={{
            width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
            position: 'relative',
            boxShadow: `0 0 0 1px ${accent}30, 0 8px 40px rgba(0,0,0,0.8)`,
            animation: spinning ? 'vinyl-spin 1.8s linear infinite' : 'none',
          }}>
            {v.image_url
              ? <img src={v.image_url} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <div style={{ width: '100%', height: '100%', background: 'radial-gradient(circle, #2a2a2a 0%, #111 40%, #0a0a0a 100%)' }} />
            }
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: `
                radial-gradient(circle, transparent 28%, rgba(0,0,0,0.15) 29%, transparent 30%),
                radial-gradient(circle, transparent 38%, rgba(0,0,0,0.12) 39%, transparent 40%),
                radial-gradient(circle, transparent 50%, rgba(0,0,0,0.1) 51%, transparent 52%),
                radial-gradient(circle, transparent 62%, rgba(0,0,0,0.08) 63%, transparent 64%)
              `,
            }} />
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: '14%', height: '14%', borderRadius: '50%',
              background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', zIndex: 2,
            }} />
          </div>

          {/* Kondisyon badge */}
          <div style={{
            position: 'absolute', top: '8%', right: '8%',
            background: 'rgba(0,0,0,0.85)', border: `1px solid ${accent}70`,
            color: accent, fontSize: 9, fontWeight: 'bold',
            padding: '2px 7px', borderRadius: 4, backdropFilter: 'blur(4px)',
            letterSpacing: 1, zIndex: 3,
          }}>
            {v.condition_grade ?? `${v.condition}/10`}
          </div>
        </div>

        {/* Bilgi */}
        <div style={{ padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
          <div style={{ color: accent, fontSize: 10, fontWeight: 'bold', letterSpacing: 2, fontFamily: 'monospace' }}>
            {v.artist}
          </div>
          <div style={{ color: '#fff', fontSize: 14, fontWeight: 900, lineHeight: 1.2 }}>
            {v.title}
          </div>
          <div style={{ fontSize: 10, opacity: 0.35, letterSpacing: 1, fontFamily: 'monospace' }}>
            {[v.press_year, v.size, v.label].filter(Boolean).join(' · ')}
          </div>

          {v.genre && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 2 }}>
              {v.genre.split(', ').map(g => (
                <span key={g} style={{
                  fontSize: 9, padding: '1px 6px', borderRadius: 3,
                  background: `${accent}20`, color: accent,
                  fontFamily: 'monospace', letterSpacing: 1,
                }}>
                  {g.toUpperCase()}
                </span>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 2, margin: '6px 0 4px' }}>
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} style={{
                flex: 1, height: 2, borderRadius: 2,
                background: i < score ? accent : 'rgba(255,255,255,0.07)',
              }} />
            ))}
          </div>

          {confirmDelete ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: CYBER_RED, flex: 1, fontFamily: 'monospace' }}>Emin misin?</span>
              <button onClick={() => onDelete(v.id)} style={actionBtn(CYBER_RED)}>[EVET]</button>
              <button onClick={() => setConfirmDelete(false)} style={actionBtn(AMBER)}>[İPTAL]</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => onEdit(v)} style={actionBtn(accent || AMBER)}>[EDIT]</button>
              <button onClick={() => setConfirmDelete(true)} style={actionBtn(CYBER_RED)}>[DELETE]</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
