# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Vinyl Vault** — a vinyl record collection manager. Users sign in with Google, then add/edit/delete records in their personal collection. Album art is auto-fetched from the Discogs API.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
npm run start    # Start production server
```

No test runner is configured.

## Environment Variables

Requires a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_DISCOGS_KEY
NEXT_PUBLIC_DISCOGS_SECRET
```

## Architecture

**Stack**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + Supabase (auth + PostgreSQL) + Discogs API.

**Data layer**: No ORM. All database access uses the Supabase JS client (`@supabase/supabase-js`) with direct table queries against the `vinyls` table (`id`, `title`, `artist`, `press_year`, `condition` 1–10, `image_url`, `user_id`, `created_at`).

**Auth**: Google OAuth via Supabase Auth. Session is tracked in React state; the Supabase client is instantiated once in module scope using `NEXT_PUBLIC_*` env vars.

**Component structure**: Nearly all application logic lives in a single client component at [app/page.tsx](app/page.tsx). There is no separate API layer — Supabase queries are called directly from event handlers in that component.

**Styling**: Tailwind CSS 4 for layout and utilities, with inline `style` objects for the cyberpunk theme (amber/cyan/red palette, SVG grid background). The UI is in Turkish.

**Discogs integration**: When a user submits a record, the app searches the Discogs API for a matching release and sets `image_url` from the first result before saving to Supabase.

## Path Alias

`@/*` maps to the project root (configured in `tsconfig.json`).