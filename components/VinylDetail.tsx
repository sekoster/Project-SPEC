'use client';

import { useEffect, useState } from 'react';
import type { Vinyl } from '@/hooks/useVinyls';

function artistColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 45%, 55%)`;
}

function extractColor(src: string): Promise<string | null> {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 50;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, 50, 50);
        const d = ctx.getImageData(0, 0, 50, 50).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < d.length; i += 4) {
          const brightness = (d[i] + d[i + 1] + d[i + 2]) / 3;
          if (brightness > 20 && brightness < 230) { r += d[i]; g += d[i + 1]; b += d[i + 2]; count++; }
        }
        if (!count) { resolve(null); return; }
        resolve(`rgb(${Math.round(r / count)},${Math.round(g / count)},${Math.round(b / count)})`);
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

interface Props {
  vinyl: Vinyl;
  onClose: () => void;
  onEdit: (v: Vinyl) => void;
  onDelete: (id: string) => void;
}

export function VinylDetail({ vinyl, onClose, onEdit, onDelete }: Props) {
  const [accent, setAccent] = useState(artistColor(vinyl.artist));
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    if (vinyl.image_url) extractColor(vinyl.image_url).then(c => { if (c) setAccent(c); });
  }, [vinyl]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleDelete = () => {
    if (confirm(`"${vinyl.title}" silinsin mi?`)) { onDelete(vinyl.id); onClose(); }
  };

  const details: [string, string | number | null | undefined][] = [
    ['Yıl', vinyl.press_year],
    ['Label', vinyl.label],
    ['Katalog', vinyl.catalog_number],
    ['Boyut', vinyl.size],
    ['Renk', vinyl.color],
    ['Kondisyon', vinyl.condition_grade],
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.96)',
        backdropFilter: 'blur(24px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 24, right: 28,
          background: 'transparent', border: 'none',
          color: 'rgba(255,255,255,0.25)', fontSize: 28,
          cursor: 'pointer', lineHeight: 1, padding: 4,
        }}
      >×</button>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 64,
          maxWidth: 860,
          width: '100%',
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Left: cover + vinyl disk */}
        <div style={{ position: 'relative', flexShrink: 0, width: 280 }}>
          {/* Vinyl disk behind cover */}
          <div style={{
            position: 'absolute',
            width: 260, height: 260,
            borderRadius: '50%',
            background: `radial-gradient(circle at center,
              #0a0a0a 13%, #1c1c1c 13%,
              #222 28%, #1a1a1a 28%,
              #232323 45%, #1a1a1a 45%,
              #222 62%, #1a1a1a 62%,
              #222 78%, #111 78%)`,
            top: '50%', left: '100%',
            transform: 'translate(-70%, -50%)',
            animation: 'vinyl-spin 1.8s linear infinite',
            boxShadow: `0 0 50px ${accent}25`,
            zIndex: 0,
          }}>
            <div style={{
              position: 'absolute', width: '14%', height: '14%',
              borderRadius: '50%', background: '#000',
              top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            }} />
          </div>

          {/* Album cover */}
          <div style={{
            width: 280, height: 280,
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative', zIndex: 2,
            boxShadow: `0 40px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.05)`,
          }}>
            {vinyl.image_url ? (
              <img src={vinyl.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, opacity: 0.15 }}>◉</div>
            )}
          </div>

          {/* Color glow */}
          <div style={{
            position: 'absolute', inset: -30, zIndex: 0, pointerEvents: 'none',
            background: `radial-gradient(ellipse at center, ${accent}18 0%, transparent 65%)`,
          }} />
        </div>

        {/* Right: details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.35, marginBottom: 8 }}>
            {vinyl.artist}
          </div>
          <div style={{ fontSize: 30, fontWeight: 400, color: '#fff', letterSpacing: -0.8, lineHeight: 1.2, marginBottom: 28 }}>
            {vinyl.title}
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 24 }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 40px', marginBottom: 28 }}>
            {details.filter(([, v]) => v).map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: 9, letterSpacing: 2, opacity: 0.28, textTransform: 'uppercase', marginBottom: 3 }}>
                  {label}
                </div>
                <div style={{ fontSize: 14, opacity: 0.85 }}>{val}</div>
              </div>
            ))}
          </div>

          {(vinyl.genre || vinyl.style) && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 32 }}>
              {vinyl.genre?.split(', ').map(g => (
                <span key={g} style={{
                  fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase',
                  padding: '3px 10px', borderRadius: 20,
                  border: '1px solid rgba(255,255,255,0.12)', opacity: 0.55,
                }}>{g}</span>
              ))}
              {vinyl.style?.split(', ').map(s => (
                <span key={s} style={{
                  fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase',
                  padding: '3px 10px', borderRadius: 20,
                  border: `1px solid ${accent}50`, color: accent, opacity: 0.8,
                }}>{s}</span>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => { onEdit(vinyl); onClose(); }}
              style={{
                background: '#fff', color: '#000', border: 'none',
                padding: '10px 24px', fontSize: 11, letterSpacing: 1.5,
                textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2, fontFamily: 'inherit',
              }}
            >Düzenle</button>
            <button
              onClick={handleDelete}
              style={{
                background: 'transparent', color: 'rgba(255,255,255,0.28)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '10px 24px', fontSize: 11, letterSpacing: 1.5,
                textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2, fontFamily: 'inherit',
              }}
            >Sil</button>
          </div>
        </div>
      </div>
    </div>
  );
}
