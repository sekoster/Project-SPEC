'use client';

import { useState } from 'react';
import type { Vinyl, ConditionGrade } from '@/hooks/useVinyls';
import { GRADE_SCORE } from '@/hooks/useVinyls';
import { AMBER, CYBER_GREEN, CYBER_RED, CYBER_BG, actionBtn } from '@/lib/theme';

interface Props {
  vinyl: Vinyl;
  onEdit: (v: Vinyl) => void;
  onDelete: (id: string) => void;
  onView: (v: Vinyl) => void;
}

export function VinylCard({ vinyl: v, onEdit, onDelete, onView }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const score = v.condition_grade
    ? (GRADE_SCORE[v.condition_grade as ConditionGrade] ?? 5)
    : (v.condition ?? 5);
  const barClr = score >= 8 ? CYBER_GREEN : score <= 3 ? CYBER_RED : AMBER;

  return (
    <div style={{
      background: 'rgba(30,30,35,0.75)',
      border: `1px solid ${barClr}`,
      borderRadius: 16,
      overflow: 'hidden',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Vinyl disk */}
      <div onClick={() => onView(v)} style={{ width: '100%', aspectRatio: '1 / 1', position: 'relative', padding: '12%', cursor: 'pointer' }}>
        {/* Disk gövdesi */}
        <div
          onMouseEnter={() => setSpinning(true)}
          onMouseLeave={() => setSpinning(false)}
          style={{
            width: '100%', height: '100%',
            borderRadius: '50%',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: `0 0 0 2px ${barClr}33, 0 8px 32px rgba(0,0,0,0.7)`,
            animation: spinning ? 'vinyl-spin 1.8s linear infinite' : 'none',
          }}
        >
          {/* Kapak görseli veya groove pattern */}
          {v.image_url ? (
            <img
              src={v.image_url}
              alt={v.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: `radial-gradient(circle, #2a2a2a 0%, #111 40%, #0a0a0a 100%)`,
            }} />
          )}

          {/* Groove overlay */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: `
              radial-gradient(circle, transparent 28%, rgba(0,0,0,0.15) 29%, transparent 30%),
              radial-gradient(circle, transparent 38%, rgba(0,0,0,0.12) 39%, transparent 40%),
              radial-gradient(circle, transparent 50%, rgba(0,0,0,0.1) 51%, transparent 52%),
              radial-gradient(circle, transparent 62%, rgba(0,0,0,0.08) 63%, transparent 64%)
            `,
          }} />

          {/* Merkez delik */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '14%', height: '14%',
            borderRadius: '50%',
            background: '#0a0a0a',
            border: `1px solid rgba(255,255,255,0.08)`,
            boxShadow: 'inset 0 0 4px rgba(0,0,0,0.8)',
            zIndex: 2,
          }} />
        </div>

        {/* Kondisyon badge */}
        <div style={{
          position: 'absolute', top: '8%', right: '8%',
          background: 'rgba(0,0,0,0.85)',
          border: `1px solid ${barClr}`,
          color: barClr,
          fontSize: 9, fontWeight: 'bold',
          padding: '2px 6px', borderRadius: 3,
          backdropFilter: 'blur(4px)',
          letterSpacing: 1,
          zIndex: 3,
        }}>
          {v.condition_grade ?? `${v.condition}/10`}
        </div>
      </div>

      {/* İçerik */}
      <div style={{ padding: '8px 16px 16px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        <div style={{ color: CYBER_GREEN, fontSize: 10, fontWeight: 'bold', letterSpacing: 2 }}>
          {v.artist}
        </div>
        <div style={{ color: '#fff', fontSize: 15, fontWeight: 900, lineHeight: 1.2 }}>
          {v.title}
        </div>
        <div style={{ fontSize: 10, opacity: 0.5, letterSpacing: 1 }}>
          {v.press_year}{v.size ? ` · ${v.size}` : ''}{v.color ? ` · ${v.color}` : ''}
        </div>
        {(v.label || v.catalog_number) && (
          <div style={{ fontSize: 9, opacity: 0.4, letterSpacing: 1 }}>
            {[v.label, v.catalog_number].filter(Boolean).join(' / ')}
          </div>
        )}
        {(v.genre || v.style) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
            {v.genre?.split(', ').map(g => (
              <span key={g} style={{
                fontSize: 9, letterSpacing: 1, color: AMBER,
                border: `1px solid rgba(255,95,0,0.3)`,
                borderRadius: 3, padding: '1px 6px',
              }}>
                {g.toUpperCase()}
              </span>
            ))}
            {v.style?.split(', ').map(s => (
              <span key={s} style={{
                fontSize: 9, letterSpacing: 1, color: '#00ff64',
                border: `1px solid rgba(0,255,100,0.25)`,
                borderRadius: 3, padding: '1px 6px',
              }}>
                {s.toUpperCase()}
              </span>
            ))}
          </div>
        )}

        {/* Kondisyon bar */}
        <div style={{ display: 'flex', gap: 3, marginBottom: 10 }}>
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i < score ? barClr : 'rgba(255,255,255,0.1)',
            }} />
          ))}
        </div>

        {/* Butonlar */}
        {confirmDelete ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: CYBER_RED, flex: 1 }}>Emin misin?</span>
            <button onClick={() => onDelete(v.id)} style={actionBtn(CYBER_RED)}>[EVET]</button>
            <button onClick={() => setConfirmDelete(false)} style={actionBtn(AMBER)}>[İPTAL]</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onEdit(v)} style={actionBtn(CYBER_GREEN)}>[EDIT]</button>
            <button onClick={() => setConfirmDelete(true)} style={actionBtn(CYBER_RED)}>[DELETE]</button>
          </div>
        )}
      </div>
    </div>
  );
}
