'use client';

import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export const CONDITION_GRADES = ['M', 'NM', 'VG+', 'VG', 'G+', 'G', 'F', 'P'] as const;
export type ConditionGrade = typeof CONDITION_GRADES[number];
export const GRADE_SCORE: Record<ConditionGrade, number> = {
  'M': 10, 'NM': 9, 'VG+': 7, 'VG': 5, 'G+': 3, 'G': 2, 'F': 1, 'P': 0,
};

export interface Vinyl {
  id: string;
  title: string;
  artist: string;
  press_year: number;
  condition?: number;
  condition_grade?: string;
  label?: string;
  catalog_number?: string;
  size?: string;
  color?: string;
  genre?: string;
  style?: string;
  image_url?: string;
  created_at?: string;
}

export type VinylFields = Omit<Vinyl, 'id' | 'created_at' | 'image_url'>;

export interface DiscogsResult {
  artist: string;
  title: string;
  year: string;
  thumb: string;
  image_url: string;
  label: string;
  catalog_number: string;
  size: string;
  genre: string;
  style: string;
}

export async function searchDiscogs(query: string): Promise<DiscogsResult[]> {
  const key = process.env.NEXT_PUBLIC_DISCOGS_KEY;
  const secret = process.env.NEXT_PUBLIC_DISCOGS_SECRET;
  try {
    const res = await fetch(
      `https://api.discogs.com/database/search?q=${encodeURIComponent(query)}&type=release&key=${key}&secret=${secret}&per_page=6`,
      { headers: { 'User-Agent': 'VinylVaultApp/1.0' } }
    );
    const data = await res.json();
    return (data.results || []).map((r: {
      title: string; year?: string; thumb?: string; cover_image?: string;
      label?: string[]; catno?: string; format?: string[]; genre?: string[]; style?: string[];
    }) => {
      const dashIdx = r.title.indexOf(' - ');
      const artist = dashIdx !== -1 ? r.title.slice(0, dashIdx) : '';
      const title  = dashIdx !== -1 ? r.title.slice(dashIdx + 3) : r.title;
      const sizes = ['7"', '10"', '12"'];
      const size = r.format?.find(f => sizes.includes(f)) ?? '12"';
      return {
        artist, title, year: r.year || '',
        thumb: r.thumb || '', image_url: r.cover_image || r.thumb || '',
        label: r.label?.[0] || '', catalog_number: r.catno || '', size,
        genre: r.genre?.join(', ') || '',
        style: r.style?.join(', ') || '',
      };
    });
  } catch {
    return [];
  }
}

async function getDiscogsImage(artist: string, album: string): Promise<string | null> {
  const results = await searchDiscogs(`${artist} ${album}`);
  return results[0]?.image_url ?? null;
}

export function useVinyls(user: User | null) {
  const [vinyls, setVinyls] = useState<Vinyl[]>([]);

  const loadVinyls = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('vinyls')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error) setVinyls(data || []);
  }, [user]);

  useEffect(() => {
    loadVinyls();
  }, [loadVinyls]);

  const save = useCallback(async (
    fields: VinylFields,
    editingId: string | null,
    existingImageUrl?: string
  ): Promise<string | null> => {
    const image_url = existingImageUrl ?? await getDiscogsImage(fields.artist, fields.title);
    const payload = { ...fields, user_id: user!.id, image_url };
    const { error } = editingId
      ? await supabase.from('vinyls').update(payload).eq('id', editingId)
      : await supabase.from('vinyls').insert([payload]);
    if (error) return 'İŞLEM BAŞARISIZ OLDU.';
    await loadVinyls();
    return null;
  }, [user, loadVinyls]);

  const remove = useCallback(async (id: string) => {
    await supabase.from('vinyls').delete().eq('id', id);
    await loadVinyls();
  }, [loadVinyls]);

  const enrichAll = useCallback(async (): Promise<void> => {
    const { data } = await supabase
      .from('vinyls')
      .select('*')
      .eq('user_id', user!.id)
      .or('label.is.null,genre.is.null,style.is.null');
    if (!data || data.length === 0) return;
    for (const vinyl of data) {
      const results = await searchDiscogs(`${vinyl.artist} ${vinyl.title}`);
      const match = results[0];
      if (!match) continue;
      await supabase.from('vinyls').update({
        label: match.label || null,
        catalog_number: match.catalog_number || null,
        size: match.size || null,
        genre: match.genre || null,
        style: match.style || null,
        image_url: vinyl.image_url || match.image_url || null,
      }).eq('id', vinyl.id);
      await new Promise(r => setTimeout(r, 1200));
    }
    await loadVinyls();
  }, [user, loadVinyls]);

  return { vinyls, save, remove, enrichAll };
}
