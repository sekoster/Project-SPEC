'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useVinyls, type Vinyl } from '@/hooks/useVinyls';
import { LoginScreen } from '@/components/LoginScreen';
import { VinylForm } from '@/components/VinylForm';
import { VinylCard } from '@/components/VinylCard';
import { VinylCardSpatial } from '@/components/VinylCardSpatial';
import { VinylLightbox } from '@/components/VinylLightbox';
import { AMBER, CYBER_RED, CYBER_BG, GRID_BG } from '@/lib/theme';

type Theme = 'cyber' | 'spatial';

export default function VinylVaultPage() {
  const { user, login, logout } = useAuth();
  const { vinyls, save, remove, enrichAll } = useVinyls(user);
  const [editingVinyl, setEditingVinyl] = useState<Vinyl | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [activeGenre, setActiveGenre] = useState('');
  const [enriching, setEnriching] = useState(false);
  const [viewingVinyl, setViewingVinyl] = useState<Vinyl | null>(null);
  const [theme, setTheme] = useState<Theme>('cyber');

  useEffect(() => {
    const saved = localStorage.getItem('vv-theme') as Theme | null;
    if (saved) setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === 'cyber' ? 'spatial' : 'cyber';
    setTheme(next);
    localStorage.setItem('vv-theme', next);
  };

  const needsEnrich = vinyls.some(v => !v.label || !v.genre || !v.style);
  const handleEnrich = async () => {
    setEnriching(true);
    await enrichAll();
    setEnriching(false);
  };

  const openForNew = () => { setEditingVinyl(null); setIsFormOpen(true); };
  const openForEdit = (v: Vinyl) => { setEditingVinyl(v); setIsFormOpen(true); };
  const closeForm = () => { setIsFormOpen(false); setEditingVinyl(null); };

  const genres = Array.from(
    new Set(vinyls.flatMap(v => v.genre?.split(', ') ?? []).filter(Boolean))
  ).sort();

  const filtered = vinyls
    .filter(v => {
      if (activeGenre && !v.genre?.split(', ').includes(activeGenre)) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        v.artist.toLowerCase().includes(q) ||
        v.title.toLowerCase().includes(q) ||
        String(v.press_year).includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'artist')    return a.artist.localeCompare(b.artist);
      if (sortBy === 'year-desc') return (b.press_year || 0) - (a.press_year || 0);
      if (sortBy === 'year-asc')  return (a.press_year || 0) - (b.press_year || 0);
      if (sortBy === 'date-asc')  return (a.created_at || '').localeCompare(b.created_at || '');
      return (b.created_at || '').localeCompare(a.created_at || ''); // date-desc
    });

  if (!user) return <LoginScreen onLogin={login} />;

  return (
    <main style={{
      minHeight: '100vh', width: '100%',
      background: `${GRID_BG} ${CYBER_BG}`,
      backgroundSize: '32px 32px',
      color: AMBER,
      fontFamily: 'monospace',
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(20,19,21,0.85)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,95,0,0.2)',
        padding: '14px 24px',
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      }}>
        <h1 style={{ fontSize: 16, letterSpacing: 4, margin: 0, textShadow: '0 0 8px #ff5f00AA', flexShrink: 0 }}>
          VINYL_VAULT <span style={{ opacity: 0.4, fontSize: 11 }}>[SYS]</span>
        </h1>

        {/* Arama */}
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="SEARCH_"
          style={{
            flex: 1, minWidth: 140,
            background: 'rgba(0,0,0,0.5)',
            border: `1px solid rgba(255,95,0,0.35)`,
            color: AMBER, fontFamily: 'monospace', fontSize: 12,
            padding: '7px 12px', borderRadius: 4, outline: 'none',
          }}
        />

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{
            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,95,0,0.35)',
            color: AMBER, fontFamily: 'monospace', fontSize: 11,
            padding: '7px 10px', borderRadius: 4, outline: 'none', flexShrink: 0,
          }}
        >
          <option value="date-desc">YENİ → ESKİ</option>
          <option value="date-asc">ESKİ → YENİ</option>
          <option value="artist">SANATÇI A→Z</option>
          <option value="year-desc">YIL ↓</option>
          <option value="year-asc">YIL ↑</option>
        </select>

        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: `1px solid rgba(255,95,0,0.35)`,
              color: AMBER, fontFamily: 'monospace', fontSize: 11,
              padding: '8px 14px', borderRadius: 4, cursor: 'pointer', letterSpacing: 1,
            }}
          >
            {theme === 'cyber' ? '[SPATIAL]' : '[CYBER]'}
          </button>
          {needsEnrich && (
            <button
              onClick={handleEnrich}
              disabled={enriching}
              style={{
                background: 'transparent', color: '#00ff64',
                border: '1px solid #00ff64',
                padding: '8px 14px', fontFamily: 'monospace', fontSize: 11,
                cursor: enriching ? 'default' : 'pointer', borderRadius: 4, opacity: enriching ? 0.5 : 1,
              }}
            >
              {enriching ? 'GÜNCELLENIYOR...' : '[MİGRASYON]'}
            </button>
          )}
          <button
            onClick={openForNew}
            style={{
              background: AMBER, color: '#000', border: 'none',
              padding: '8px 16px', fontFamily: 'monospace', fontSize: 11,
              fontWeight: 'bold', cursor: 'pointer', borderRadius: 4, letterSpacing: 1,
            }}
          >
            + YENİ PLAK
          </button>
          <button
            onClick={logout}
            style={{
              background: 'transparent', color: CYBER_RED,
              border: `1px solid ${CYBER_RED}`,
              padding: '8px 14px', fontFamily: 'monospace', fontSize: 11,
              cursor: 'pointer', borderRadius: 4,
            }}
          >
            [LOGOUT]
          </button>
        </div>
      </header>

      {/* Genre filtreleri */}
      {genres.length > 0 && (
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '16px 24px 0',
          display: 'flex', gap: 8, flexWrap: 'wrap',
        }}>
          <button
            onClick={() => setActiveGenre('')}
            style={{
              fontFamily: 'monospace', fontSize: 10, letterSpacing: 1,
              padding: '4px 12px', borderRadius: 20, cursor: 'pointer', border: '1px solid',
              borderColor: activeGenre === '' ? AMBER : 'rgba(255,95,0,0.3)',
              background: activeGenre === '' ? AMBER : 'transparent',
              color: activeGenre === '' ? '#000' : AMBER,
            }}
          >
            TÜMÜ ({vinyls.length})
          </button>
          {genres.map(g => (
            <button
              key={g}
              onClick={() => setActiveGenre(activeGenre === g ? '' : g)}
              style={{
                fontFamily: 'monospace', fontSize: 10, letterSpacing: 1,
                padding: '4px 12px', borderRadius: 20, cursor: 'pointer', border: '1px solid',
                borderColor: activeGenre === g ? AMBER : 'rgba(255,95,0,0.3)',
                background: activeGenre === g ? AMBER : 'transparent',
                color: activeGenre === g ? '#000' : AMBER,
              }}
            >
              {g.toUpperCase()} ({vinyls.filter(v => v.genre?.split(', ').includes(g)).length})
            </button>
          ))}
        </div>
      )}

      {/* Koleksiyon */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 80px' }}>
        {vinyls.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 100, opacity: 0.35 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>◉</div>
            <div style={{ letterSpacing: 4, fontSize: 13 }}>KOLEKSİYON BOŞ</div>
            <div style={{ fontSize: 11, marginTop: 8, letterSpacing: 1 }}>
              İlk plağını eklemek için "+ YENİ PLAK" butonuna tıkla
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 100, opacity: 0.35 }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>◎</div>
            <div style={{ letterSpacing: 3, fontSize: 13 }}>SONUÇ BULUNAMADI</div>
            <div style={{ fontSize: 11, marginTop: 8, letterSpacing: 1 }}>"{query}" ile eşleşen plak yok</div>
          </div>
        ) : (
          <>
            {query && (
              <div style={{ fontSize: 11, opacity: 0.4, marginBottom: 20, letterSpacing: 1 }}>
                {filtered.length} / {vinyls.length} PLAK
              </div>
            )}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: theme === 'spatial' ? 28 : 20,
            }}>
              {filtered.map(v => theme === 'spatial'
                ? <VinylCardSpatial key={v.id} vinyl={v} onEdit={openForEdit} onDelete={remove} onView={setViewingVinyl} />
                : <VinylCard key={v.id} vinyl={v} onEdit={openForEdit} onDelete={remove} onView={setViewingVinyl} />
              )}
            </div>
          </>
        )}
      </section>

      {viewingVinyl && (
        <VinylLightbox vinyl={viewingVinyl} onClose={() => setViewingVinyl(null)} />
      )}

      <VinylForm
        isOpen={isFormOpen}
        editingVinyl={editingVinyl}
        onSave={save}
        onClose={closeForm}
      />
    </main>
  );
}
