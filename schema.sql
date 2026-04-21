-- Vinyl Vault schema
-- Apply changes here AND run in Supabase SQL Editor to keep in sync.

create table if not exists vinyls (
  id               uuid default uuid_generate_v4() primary key,
  created_at       timestamp with time zone default timezone('utc', now()) not null,
  user_id          uuid references auth.users not null,
  artist           text not null,
  title            text not null,
  press_year       int4,
  condition        int4,              -- legacy 1-10 scale
  condition_grade  text,              -- Discogs standard: M / NM / VG+ / VG / G+ / G / F / P
  label            text,
  catalog_number   text,
  size             text,              -- 7" / 10" / 12"
  color            text,
  genre            text,              -- comma-separated: "Electronic, Rock"
  style            text,              -- comma-separated: "Dub, Reggae-Pop"
  image_url        text
);

-- Row-level security: users can only access their own records
alter table vinyls enable row level security;

create policy "Users see own vinyls" on vinyls
  for select using (auth.uid() = user_id);

create policy "Users insert own vinyls" on vinyls
  for insert with check (auth.uid() = user_id);

create policy "Users update own vinyls" on vinyls
  for update using (auth.uid() = user_id);

create policy "Users delete own vinyls" on vinyls
  for delete using (auth.uid() = user_id);
