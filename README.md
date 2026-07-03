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

### Running Locally

```bash
npm run dev
```

The app will be available at the local address printed in the terminal.

### Building for Production

```bash
npm run build
```
