'use client';

import { useEffect, useRef, useState } from 'react';
import type { Vinyl, VinylFields, DiscogsResult } from '@/hooks/useVinyls';
import { searchDiscogs } from '@/hooks/useVinyls';
import { AMBER, CYBER_GREEN, CYBER_RED, inputStyle } from '@/lib/theme';
import { CONDITION_GRADES } from '@/hooks/useVinyls';

interface Props {
  isOpen: boolean;
  editingVinyl: Vinyl | null;
  onSave: (fields: VinylFields, editingId: string | null, existingImageUrl?: string) => Promise<string | null>;
  onClose: () => void;
}

export function VinylForm({ isOpen, editingVinyl, onSave, onClose }: Props) {
  const [sanatci, setSanatci] = useState('');
  const [albumAdi, setAlbumAdi] = useState('');
  const [basimYili, setBasimYili] = useState<number | ''>('');
  const [label, setLabel] = useState('');
  const [catalogNo, setCatalogNo] = useState('');
  const [size, setSize] = useState('12"');
  const [color, setColor] = useState('');
  const [conditionGrade, setConditionGrade] = useState('');
  const [genre, setGenre] = useState('');
  const [style, setStyle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<DiscogsResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | undefined>();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (editingVinyl) {
      setSanatci(editingVinyl.artist);
      setAlbumAdi(editingVinyl.title);
      setBasimYili(editingVinyl.press_year);
      setLabel(editingVinyl.label ?? '');
      setCatalogNo(editingVinyl.catalog_number ?? '');
      setSize(editingVinyl.size ?? '12"');
      setColor(editingVinyl.color ?? '');
      setConditionGrade(editingVinyl.condition_grade ?? '');
      setGenre(editingVinyl.genre ?? '');
      setStyle(editingVinyl.style ?? '');
    } else {
      setSanatci(''); setAlbumAdi(''); setBasimYili('');
      setLabel(''); setCatalogNo(''); setSize('12"'); setColor(''); setConditionGrade(''); setGenre(''); setStyle('');
    }
    setSearchQuery(''); setSuggestions([]); setSelectedImageUrl(undefined);
    setError(null);
  }, [editingVinyl, isOpen]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.trim().length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const results = await searchDiscogs(searchQuery);
      setSuggestions(results);
      setSearching(false);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  const pickSuggestion = (r: DiscogsResult) => {
    setSanatci(r.artist.toUpperCase());
    setAlbumAdi(r.title.toUpperCase());
    if (r.year) setBasimYili(Number(r.year));
    if (r.label) setLabel(r.label);
    if (r.catalog_number) setCatalogNo(r.catalog_number);
    if (r.size) setSize(r.size);
    if (r.genre) setGenre(r.genre);
    if (r.style) setStyle(r.style);
    setSelectedImageUrl(r.image_url || undefined);
    setSearchQuery('');
    setSuggestions([]);
  };

  const handleClose = () => {
    setSanatci(''); setAlbumAdi(''); setBasimYili('');
    setLabel(''); setCatalogNo(''); setSize('12"'); setColor(''); setConditionGrade(''); setGenre(''); setStyle('');
    setSearchQuery(''); setSuggestions([]); setSelectedImageUrl(undefined);
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const err = await onSave(
      {
        artist: sanatci.toUpperCase(),
        title: albumAdi.toUpperCase(),
        press_year: Number(basimYili),
        condition_grade: conditionGrade || undefined,
        label: label || undefined,
        catalog_number: catalogNo || undefined,
        size: size || undefined,
        color: color || undefined,
        genre: genre || undefined,
        style: style || undefined,
      },
      editingVinyl?.id ?? null,
      selectedImageUrl ?? editingVinyl?.image_url
    );
    if (err) {
      setError(err);
    } else {
      handleClose();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div style={{ width: '100%', maxWidth: 460 }}>
        <h2 style={{
          textAlign: 'center', letterSpacing: 5, marginBottom: 20,
          color: AMBER, textShadow: '0 0 10px #ff5f00AA', fontFamily: 'monospace',
        }}>
          {editingVinyl ? 'EDIT_ENTRY' : 'NEW_ENTRY'} [SYS]
        </h2>
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex', flexDirection: 'column', gap: 12,
            background: 'rgba(20,19,21,0.97)', padding: 28, borderRadius: 16,
            border: `1px solid ${AMBER}`, boxShadow: `0 0 60px rgba(255,95,0,0.2)`,
          }}
        >
          {/* Discogs arama */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={searching ? 'ARANIYOR...' : 'DISCOGS\'DA ARA_'}
              style={{ ...inputStyle, borderColor: suggestions.length > 0 ? AMBER : 'rgba(255,95,0,0.35)' }}
            />
            {suggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                background: '#1a1a1f', border: `1px solid ${AMBER}`,
                borderTop: 'none', borderRadius: '0 0 6px 6px',
                maxHeight: 260, overflowY: 'auto',
              }}>
                {suggestions.map((r, i) => (
                  <div
                    key={i}
                    onClick={() => pickSuggestion(r)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', cursor: 'pointer',
                      borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,95,0,0.1)' : 'none',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,95,0,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {r.thumb ? (
                      <img src={r.thumb} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 36, height: 36, background: '#222', borderRadius: 3, flexShrink: 0 }} />
                    )}
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                      <div style={{ color: AMBER, fontSize: 10, opacity: 0.7 }}>{r.artist}{r.year ? ` · ${r.year}` : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <input type="text" value={sanatci} onChange={e => setSanatci(e.target.value)} placeholder="SANATÇI *" style={inputStyle} required />
          <input type="text" value={albumAdi} onChange={e => setAlbumAdi(e.target.value)} placeholder="ALBÜM ADI *" style={inputStyle} required />
          <input type="number" value={basimYili} onChange={e => setBasimYili(e.target.value === '' ? '' : Number(e.target.value))} placeholder="BASIM YILI *" style={inputStyle} required />

          <div style={{ display: 'flex', gap: 8 }}>
            <input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="LABEL" style={{ ...inputStyle, flex: 1 }} />
            <input type="text" value={catalogNo} onChange={e => setCatalogNo(e.target.value)} placeholder="KAT. NO" style={{ ...inputStyle, flex: 1 }} />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <select value={size} onChange={e => setSize(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
              <option value='12"'>12"</option>
              <option value='10"'>10"</option>
              <option value='7"'>7"</option>
            </select>
            <input type="text" value={color} onChange={e => setColor(e.target.value)} placeholder='RENK' style={{ ...inputStyle, flex: 1 }} />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <select value={conditionGrade} onChange={e => setConditionGrade(e.target.value)} style={{ ...inputStyle, flex: 1 }} required>
            <option value="">KONDİSYON *</option>
            {CONDITION_GRADES.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
            </select>
            <input type="text" value={genre} onChange={e => setGenre(e.target.value)} placeholder="GENRE" style={{ ...inputStyle, flex: 1 }} />
          </div>
          <input type="text" value={style} onChange={e => setStyle(e.target.value)} placeholder="STYLE" style={inputStyle} />
          <button
            type="submit"
            disabled={loading}
            style={{ background: editingVinyl ? CYBER_GREEN : AMBER, color: '#000', padding: 14, border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: 5, letterSpacing: 2, fontFamily: 'monospace', fontSize: 13 }}
          >
            {loading ? 'PROCESSING...' : editingVinyl ? 'UPDATE_RECORD' : 'SAVE_TO_VAULT'}
          </button>
          <button type="button" onClick={handleClose} style={{ color: '#555', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontFamily: 'monospace', letterSpacing: 1 }}>
            [ESC] CANCEL
          </button>
          {error && <div style={{ color: CYBER_RED, fontSize: 12, textAlign: 'center' }}>{error}</div>}
        </form>
      </div>
    </div>
  );
}
