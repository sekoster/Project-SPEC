'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useVinyls, type Vinyl } from '@/hooks/useVinyls';
import { LoginScreen } from '@/components/LoginScreen';
import { VinylForm } from '@/components/VinylForm';
import { VinylRow } from '@/components/VinylRow';
import { VinylDetail } from '@/components/VinylDetail';

export default function VinylVaultPage() {
  const { user, login, logout } = useAuth();
  const { vinyls, save, remove } = useVinyls(user);
  const [editingVinyl, setEditingVinyl] = useState<Vinyl | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingVinyl, setViewingVinyl] = useState<Vinyl | null>(null);
  const [query, setQuery] = useState('');

  const openForNew = () => { setEditingVinyl(null); setIsFormOpen(true); };
  const openForEdit = (v: Vinyl) => { setEditingVinyl(v); setIsFormOpen(true); };
  const closeForm = () => { setIsFormOpen(false); setEditingVinyl(null); };

  const filtered = vinyls.filter(v => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return v.artist.toLowerCase().includes(q) || v.title.toLowerCase().includes(q);
  });

  if (!user) return <LoginScreen onLogin={login} />;

  return (
    <main style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: '"Inter", system-ui, sans-serif' }}>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        padding: '18px 40px',
        display: 'flex', alignItems: 'center', gap: 24,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ fontSize: 13, letterSpacing: 4, opacity: 0.4, textTransform: 'uppercase', flexShrink: 0 }}>
          Vinyl Vault
        </div>

        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="search..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            fontSize: 13,
            padding: '4px 0',
            outline: 'none',
            fontFamily: 'inherit',
            opacity: 0.6,
          }}
        />

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
          <button
            onClick={openForNew}
            style={{
              background: '#fff', color: '#000', border: 'none',
              padding: '8px 20px', fontSize: 11, letterSpacing: 1.5,
              textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2, fontFamily: 'inherit',
            }}
          >+ Add</button>
          <button
            onClick={logout}
            style={{
              background: 'transparent', color: 'rgba(255,255,255,0.25)',
              border: 'none', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >Logout</button>
        </div>
      </header>

      {/* Record count */}
      <div style={{
        padding: '28px 40px 12px',
        fontSize: 10, letterSpacing: 3, opacity: 0.22, textTransform: 'uppercase',
        fontFamily: 'monospace',
      }}>
        {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
      </div>

      {/* List */}
      {vinyls.length === 0 ? (
        <div style={{ textAlign: 'center', paddingTop: 120, opacity: 0.2 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>◉</div>
          <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase' }}>Collection empty</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', paddingTop: 120, opacity: 0.2 }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>◎</div>
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase' }}>No results for "{query}"</div>
        </div>
      ) : (
        <div>
          {filtered.map((v, i) => (
            <VinylRow key={v.id} vinyl={v} index={i} onView={setViewingVinyl} />
          ))}
        </div>
      )}

      {viewingVinyl && (
        <VinylDetail
          vinyl={viewingVinyl}
          onClose={() => setViewingVinyl(null)}
          onEdit={openForEdit}
          onDelete={remove}
        />
      )}

      <VinylForm isOpen={isFormOpen} editingVinyl={editingVinyl} onSave={save} onClose={closeForm} />
    </main>
  );
}
