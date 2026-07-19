# Setty

Setty is a curated marketplace for digital assets that solves the Frankenstein effect for solo developers and indie studios, the problem of mismatched art styles created when assets are sourced from unrelated packs.

Setty enforces strict stylistic curation, so every asset in a collection is guaranteed to be visually compatible with the rest. Developers buy exactly what they need through a la carte purchases, without paying for oversized bundles full of unused content. When a specific asset is missing from a collection, developers can post a bounty, a micro task that pays 2D and 3D artists to create the missing piece in the required style.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- React Router DOM
- lucide-react

## Design System

Setty follows a strict, Vercel native design system. These rules are enforced across the entire codebase:

- Absolute minimalism, no visual clutter, no drop shadows
- Light theme only, pure white backgrounds (`bg-white`)
- Monochrome and one accent color, pure black text and a single accent blue (`#0000FF`)
- Sharp geometry only, `rounded-none` on all structural elements, cards, inputs, and buttons
- Typography restricted to the Space Grotesk font
- Zero emojis anywhere in the UI or codebase
- Icons sourced exclusively from `lucide-react`

## Getting Started

### Prerequisites

- Node.js
- A Supabase project (URL and anon key)

### Installation

```bash
npm install
```

### Environment Variables

Copy the example environment file and fill in your own Supabase credentials:

```bash
cp .env.example .env
```

Set the following variables in `.env`:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The `.env` file is required for Supabase authentication and data access to function. It is git ignored and must never be committed.

### Database security (Row Level Security)

All SQL migrations live in `supabase/migrations/` and must be applied in
filename order. To apply one:

1. Open your project in the [Supabase dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor**, paste the contents of the migration file
   (start with `supabase/migrations/0001_enable_rls.sql`) and click **Run**.
3. Verify under **Authentication → Policies** that RLS is enabled on
   `assets`, `profiles`, `purchases` and `bounties` and the policies are listed.

`0001_enable_rls.sql` is mandatory: without it the anon key exposed in the
browser can read and write any row in the database.

### Running Locally

```bash
npm run dev
```

The app will be available at the local address printed in the terminal.

### Demo Seed Data

A fresh Supabase project looks empty. To make the marketplace look alive for
reviewers, run the seed script (server-side only, never commit the key):

```bash
SUPABASE_URL=https://<project-ref>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
npm run seed
```

It idempotently creates 4 collections' worth of assets (~40, with generated
geometric preview images), 3 demo seller accounts (marked with the
&quot;(demo)&quot; suffix), 6 open bounties and a handful of purchases and
reviews. Installing `sharp` (`npm i -D sharp`) upgrades previews from SVG to
PNG. Re-running the script is safe: existing rows are skipped or upserted.

### Building for Production

```bash
npm run build
```
