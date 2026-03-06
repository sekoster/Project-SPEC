'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- STİLLER VE RENKLER ---
const AMBER = '#FF5F00';
const CYBER_GREEN = '#00ff64';
const CYBER_RED = '#ff3131';
const CYBER_BG = '#141315';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

interface Vinyl {
  id: string;
  title: string;
  artist: string;
  press_year: number;
  condition: number;
  image_url?: string;
  created_at?: string;
}

export default function VinylFormPage() {
  const [user, setUser] = useState<any>(null);
  const [sanatci, setSanatci] = useState('');
  const [albumAdi, setAlbumAdi] = useState('');
  const [basimYili, setBasimYili] = useState<number | ''>('');
  const [kondisyon, setKondisyon] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [vinyls, setVinyls] = useState<Vinyl[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- AUTH TAKİBİ ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // --- VERİ ÇEKME ---
  const fetchVinyls = async () => {
    const { data, error } = await supabase
      .from('vinyls')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setVinyls(data || []);
  };

  useEffect(() => { if (user) fetchVinyls(); }, [user]);

  // --- DISCOGS GÖRSEL ÇEKME ---
  const fetchDiscogsImage = async (artist: string, album: string) => {
    const key = process.env.NEXT_PUBLIC_DISCOGS_KEY;
    const secret = process.env.NEXT_PUBLIC_DISCOGS_SECRET;
    // Aramayı daha spesifik hale getirelim:
    const query = encodeURIComponent(`${artist} ${album}`);
    
    try {
      const response = await fetch(
        `https://api.discogs.com/database/search?release_title=${encodeURIComponent(album)}&artist=${encodeURIComponent(artist)}&key=${key}&secret=${secret}&per_page=1`,
        { headers: { 'User-Agent': 'VinylVaultApp/1.0' } } // Discogs User-Agent isteyebilir
      );
      const data = await response.json();
      return data.results?.[0]?.cover_image || null;
    } catch (err) {
      console.error("Discogs Hatası:", err);
      return null;
    }
  };

  // --- AUTH İŞLEMLERİ ---
  const handleLogin = () => supabase.auth.signInWithOAuth({ 
    provider: 'google', 
    options: { queryParams: { prompt: 'select_account' }, redirectTo: window.location.origin } 
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  // --- CRUD İŞLEMLERİ ---
  const deleteVinyl = async (id: string) => {
    if (!confirm('SİSTEMDEN KALDIRILSIN MI?')) return;
    await supabase.from('vinyls').delete().eq('id', id);
    fetchVinyls();
  };

  const startEdit = (v: Vinyl) => {
    setEditingId(v.id);
    setSanatci(v.artist);
    setAlbumAdi(v.title);
    setBasimYili(v.press_year);
    setKondisyon(v.condition);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Otomatik Görsel Çek (Sadece yeni kayıt veya düzenleme yapılıyorsa)
    const autoImage = await fetchDiscogsImage(sanatci, albumAdi);

    const payload = { 
      artist: sanatci.toUpperCase(), 
      title: albumAdi.toUpperCase(), 
      press_year: Number(basimYili), 
      condition: Number(kondisyon), 
      user_id: user.id,
      image_url: autoImage 
    };
    
    const { error: resError } = editingId 
      ? await supabase.from('vinyls').update(payload).eq('id', editingId)
      : await supabase.from('vinyls').insert([payload]);

    if (!resError) {
      setSanatci(''); setAlbumAdi(''); setBasimYili(''); setKondisyon(''); setEditingId(null);
      fetchVinyls();
    } else {
      setError("İŞLEM BAŞARISIZ OLDU.");
    }
    setLoading(false);
  };

  const gridBg = "linear-gradient(rgba(0,0,0,0.36), rgba(0,0,0,0.37)), url('data:image/svg+xml;utf8,<svg width=\"32\" height=\"32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"0\" y=\"0\" width=\"32\" height=\"32\" fill=\"none\"/><rect x=\"0\" y=\"0\" width=\"32\" height=\"32\" stroke=\"%23433\" stroke-width=\"0.7\"/><line x1=\"16\" y1=\"0\" x2=\"16\" y2=\"32\" stroke=\"%23766efb\" stroke-width=\"0.5\" opacity=\"0.2\"/><line x1=\"0\" y1=\"16\" x2=\"32\" y2=\"16\" stroke=\"%23ff5f00\" stroke-width=\"0.7\" opacity=\"0.19\"/></svg>')";

  // --- LOGIN EKRANI ---
  if (!user) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${gridBg} ${CYBER_BG}`, fontFamily: 'monospace' }}>
        <button onClick={handleLogin} style={{ padding: '20px 40px', background: AMBER, color: '#000', border: 'none', borderRadius: 8, fontSize: 20, fontWeight: 900, cursor: 'pointer', boxShadow: `0 0 30px ${AMBER}66`, textTransform: 'uppercase' }}>
          ACCESS_GRANTED_VIA_GOOGLE
        </button>
      </main>
    );
  }

  // --- ANA UYGULAMA EKRANI ---
  return (
    <main style={{ minHeight: '100vh', width: '100%', background: `${gridBg} ${CYBER_BG}`, backgroundSize: '32px 32px', color: AMBER, fontFamily: 'monospace', position: 'relative' }}>
      <button onClick={handleLogout} style={{ position: 'fixed', top: 20, right: 20, background: 'rgba(20,20,20,0.8)', color: CYBER_RED, border: `1px solid ${CYBER_RED}`, padding: '8px 15px', fontSize: 12, cursor: 'pointer', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
        [LOGOUT]
      </button>

      {/* FORM SEKTÖRÜ */}
      <section style={{ minHeight: '80svh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '50px 0' }}>
        <div style={{ width: '100%', maxWidth: 500, padding: '0 20px' }}>
          <h1 style={{ textAlign: 'center', letterSpacing: 5, marginBottom: 30, textShadow: '0 0 10px #ff5f00AA' }}>
            {editingId ? 'EDIT_ENTRY' : 'VINYL_VAULT'} [SYS]
          </h1>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15, background: 'rgba(25,25,30,0.7)', padding: 25, borderRadius: 15, border: `1px solid ${AMBER}`, backdropFilter: 'blur(10px)', boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}>
            <input type="text" value={sanatci} onChange={e => setSanatci(e.target.value)} placeholder="SANATÇI" style={inputStyle} required />
            <input type="text" value={albumAdi} onChange={e => setAlbumAdi(e.target.value)} placeholder="ALBÜM ADI" style={inputStyle} required />
            <input type="number" value={basimYili} onChange={e => setBasimYili(e.target.value === '' ? '' : Number(e.target.value))} placeholder="BASIM YILI" style={inputStyle} required />
            <input type="number" value={kondisyon} min="1" max="10" onChange={e => setKondisyon(e.target.value === '' ? '' : Number(e.target.value))} placeholder="KONDİSYON (1-10)" style={inputStyle} required />
            <button type="submit" disabled={loading} style={{ background: editingId ? CYBER_GREEN : AMBER, color: '#000', padding: 15, border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: 5, letterSpacing: 2 }}>
              {loading ? 'PROCESSING...' : editingId ? 'UPDATE_RECORD' : 'SAVE_TO_VAULT'}
            </button>
            {editingId && <button type="button" onClick={() => {setEditingId(null); setSanatci(''); setAlbumAdi('');}} style={{ color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', fontSize: 10 }}>CANCEL_EDIT</button>}
            {error && <div style={{ color: CYBER_RED, fontSize: 12, textAlign: 'center' }}>{error}</div>}
          </form>
        </div>
      </section>

      {/* PLAK LİSTESİ */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 100px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
          {vinyls.map((v) => {
            const barClr = v.condition >= 8 ? CYBER_GREEN : v.condition <= 3 ? CYBER_RED : AMBER;
            return (
              <div key={v.id} style={{ background: 'rgba(30,30,35,0.75)', border: `1px solid ${barClr}`, borderRadius: 20, padding: 20, display: 'flex', gap: 20, alignItems: 'center', backdropFilter: 'blur(5px)' }}>
                {/* PLAK GÖRSELİ VEYA PLACEHOLDER */}
                <div style={{ 
                  width: 90, height: 90, borderRadius: '50%', 
                  backgroundImage: v.image_url ? `url(${v.image_url})` : `radial-gradient(circle, #222 30%, #000 100%)`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  border: `2px solid ${barClr}`, position: 'relative', flexShrink: 0, overflow: 'hidden' 
                }}>
                  {!v.image_url && <div style={{ width: 12, height: 12, borderRadius: '50%', background: CYBER_BG, border: `1px solid ${barClr}`, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ color: CYBER_GREEN, fontSize: 11, fontWeight: 'bold', letterSpacing: 2 }}>{v.artist}</div>
                  <div style={{ color: '#fff', fontSize: 17, fontWeight: 900, margin: '2px 0 5px 0' }}>{v.title}</div>
                  <div style={{ fontSize: 10, opacity: 0.6, letterSpacing: 1 }}>YIL: {v.press_year} | KONDİSYON: {v.condition}/10</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <button onClick={() => startEdit(v)} style={actionBtn(CYBER_GREEN)}>[EDIT]</button>
                    <button onClick={() => deleteVinyl(v.id)} style={actionBtn(CYBER_RED)}>[DELETE]</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

const inputStyle = { width: '100%', background: '#000', color: AMBER, border: `1px solid ${AMBER}`, padding: 12, borderRadius: 5, fontFamily: 'monospace', outline: 'none', fontSize: 14 };
const actionBtn = (clr: string) => ({ background: 'none', color: clr, border: `1px solid ${clr}`, padding: '4px 10px', fontSize: 10, cursor: 'pointer', fontWeight: 'bold' as const, textTransform: 'uppercase' as const });