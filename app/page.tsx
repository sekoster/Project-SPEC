'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Neon amber tone for destructive highlight
const AMBER = '#ff5f00';
const ERROR_RED = '#FF2310';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

interface Vinyl {
  id: string;
  title: string;
  artist: string;
  press_year: number;
  condition: number;
  created_at?: string;
}

export default function VinylFormPage() {
  const [sanatci, setSanatci] = useState('');
  const [albumAdi, setAlbumAdi] = useState('');
  const [basimYili, setBasimYili] = useState<number | ''>('');
  const [kondisyon, setKondisyon] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [vinyls, setVinyls] = useState<Vinyl[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchVinyls = async () => {
    try {
      const { data, error } = await supabase
        .from('vinyls')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError('Liste getirilirken hata oluştu.');
      } else {
        setVinyls(data || []);
      }
    } catch (err) {
      setError('Veri alınırken beklenmedik bir hata oluştu.');
    }
  };

  useEffect(() => {
    fetchVinyls();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Safeguard for press_year and condition being number, not empty string
    const year = typeof basimYili === 'string' ? parseInt(basimYili) : basimYili;
    const cond = typeof kondisyon === 'string' ? parseInt(kondisyon) : kondisyon;

    if (!sanatci || !albumAdi || !year || !cond) {
      setError('Tüm alanları doldurun.');
      setLoading(false);
      return;
    }
    // Optionally further check that condition is between 1-10
    if (cond < 1 || cond > 10) {
      setError('Kondisyon 1 ile 10 arasında olmalı.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.from('vinyls').insert([
        {
          artist: sanatci,
          title: albumAdi,
          press_year: year,
          condition: cond,
        },
      ]);
      if (error) {
        setError('Kayıt sırasında hata oluştu.');
      } else {
        setSanatci('');
        setAlbumAdi('');
        setBasimYili('');
        setKondisyon('');
        await fetchVinyls();
      }
    } catch (err) {
      setError('Kayıt sırasında beklenmedik bir hata oluştu.');
    }
    setLoading(false);
  };

  const gridBg =
    "url('data:image/svg+xml;utf8,<svg width=\"32\" height=\"32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"0\" y=\"0\" width=\"32\" height=\"32\" fill=\"none\"/><rect x=\"0\" y=\"0\" width=\"32\" height=\"32\" stroke=\"%233a3a3a\" stroke-width=\"0.5\"/><line x1=\"16\" y1=\"0\" x2=\"16\" y2=\"32\" stroke=\"%233a3a3a\" stroke-width=\"0.5\"/><line x1=\"0\" y1=\"16\" x2=\"32\" y2=\"16\" stroke=\"%233a3a3a\" stroke-width=\"0.5\"/></svg>')";

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#141315', backgroundImage: gridBg, backgroundSize: '32px 32px', color: AMBER, fontFamily: 'monospace', paddingBottom: 100, letterSpacing: 2.5 }}>
      <div style={{ maxWidth: 420, margin: '0 auto', padding: '72px 12px 36px 12px' }}>
        <h1 style={{ color: AMBER, fontWeight: 900, fontSize: 30, marginBottom: 34, letterSpacing: 6, textTransform: 'uppercase', borderBottom: `2.5px solid ${AMBER}`, paddingBottom: 8, display: 'inline-block' }}>
          PLAK GİRİŞ <span style={{ color: '#FF0B2E' }}>[DESTRUCTIVE]</span>
        </h1>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22, background: 'rgba(25, 18, 18, 0.93)', border: `2.2px solid ${AMBER}`, padding: 32, borderRadius: 14, boxShadow: '0 2px 32px #ff5f0033' }}>
          {/* Form Sırası: Sanatçı, Albüm, Basım Yılı, Kondisyon */}
          <label style={{ fontWeight: 800, letterSpacing: 4, fontSize: 17 }}>
            Sanatçı
            <input
              type="text"
              value={sanatci}
              onChange={e => setSanatci(e.target.value)}
              style={{ width: '100%', marginTop: 14, background: 'transparent', color: AMBER, border: 'none', borderBottom: `2.5px solid ${AMBER}`, padding: '7px 0', fontFamily: 'monospace', fontSize: 18, outline: 'none' }}
              required
              placeholder="..."
            />
          </label>
          <label style={{ fontWeight: 800, letterSpacing: 4, fontSize: 17 }}>
            Albüm
            <input
              type="text"
              value={albumAdi}
              onChange={e => setAlbumAdi(e.target.value)}
              style={{ width: '100%', marginTop: 14, background: 'transparent', color: AMBER, border: 'none', borderBottom: `2.5px solid ${AMBER}`, padding: '7px 0', fontFamily: 'monospace', fontSize: 18, outline: 'none' }}
              required
              placeholder="..."
            />
          </label>
          <label style={{ fontWeight: 800, letterSpacing: 4, fontSize: 17 }}>
            Basım Yılı
            <input
              type="number"
              value={basimYili}
              min={1900}
              max={2100}
              onChange={e => setBasimYili(e.target.value === '' ? '' : Number(e.target.value))}
              style={{ width: '100%', marginTop: 14, background: 'transparent', color: AMBER, border: 'none', borderBottom: `2.5px solid ${AMBER}`, padding: '7px 0', fontFamily: 'monospace', fontSize: 18, outline: 'none', appearance: 'textfield' }}
              required
              placeholder="YYYY"
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </label>
          <label style={{ fontWeight: 800, letterSpacing: 4, fontSize: 17 }}>
            Kondisyon (1-10)
            <input
              type="number"
              value={kondisyon}
              min={1}
              max={10}
              onChange={e => {
                const value = e.target.value;
                setKondisyon(value === '' ? '' : Math.max(1, Math.min(10, Number(value))));
              }}
              style={{ width: '100%', marginTop: 14, background: 'transparent', color: AMBER, border: 'none', borderBottom: `2.5px solid ${AMBER}`, padding: '7px 0', fontFamily: 'monospace', fontSize: 18, outline: 'none', appearance: 'textfield' }}
              required
              placeholder="1-10"
              inputMode="numeric"
              pattern="[1-9]|10"
            />
          </label>

          <button type="submit" disabled={loading} style={{ marginTop: 14, width: '100%', background: loading ? '#333' : '#FF0B2E', color: 'white', fontWeight: 900, border: 'none', borderRadius: 6, fontSize: 21, padding: '13px 0', cursor: 'pointer', letterSpacing: 8 }}>
            {loading ? 'ISLENIYOR...' : 'KAYDET'}
          </button>
          {error && <div style={{ color: ERROR_RED, marginTop: 10, textAlign: 'center' }}>{error}</div>}
        </form>
      </div>

      <div style={{ maxWidth: 900, margin: '48px auto', background: 'rgba(18,17,19,0.91)', border: `2.2px solid ${AMBER}`, borderRadius: 14, padding: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 24, color: '#FF0B2E', letterSpacing: 7, borderBottom: `2px solid #FF0B2E`, display: 'inline-block' }}>STORED_DATA_INDEX</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${AMBER}`, opacity: 0.7 }}>
                <th style={{ padding: 12 }}>ID</th>
                <th style={{ padding: 12 }}>SANATÇI</th>
                <th style={{ padding: 12 }}>ALBÜM</th>
                <th style={{ padding: 12 }}>BASIM YILI</th>
                <th style={{ padding: 12 }}>KONDISYON</th>
                <th style={{ padding: 12 }}>TIMESTAMP</th>
              </tr>
            </thead>
            <tbody>
              {vinyls.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid #333', fontSize: 14 }}>
                  <td style={{ padding: 12, color: '#666' }}>{v.id.split('-')[0]}</td>
                  <td style={{ padding: 12 }}>{v.artist?.toUpperCase()}</td>
                  <td style={{ padding: 12, fontWeight: 'bold' }}>{v.title?.toUpperCase()}</td>
                  <td style={{ padding: 12, color: '#888' }}>{v.press_year}</td>
                  <td style={{ padding: 12, color: '#FF0B2E', fontWeight: 700 }}>{v.condition}</td>
                  <td style={{ padding: 12, color: '#444' }}>{v.created_at?.split('T')[1]?.slice(0, 5)} / {v.created_at?.split('T')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}