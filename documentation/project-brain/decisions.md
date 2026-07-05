# Decisions Log

## Architecture
- **Vite + React + TS**: Chosen for speed, type safety, and modern ecosystem.
- **Tailwind v4**: Used for styling, leveraging the new `@theme` block syntax for custom design tokens.
- **Zustand**: Used *only* for lightweight global UI state (e.g., isCaptureModalOpen).
- **TanStack Query**: Chosen over pure Zustand/useEffect for handling Supabase server state. Provides built-in caching, skeleton loading, and optimistic UI updates for a premium feel.
- **React Router DOM**: Implemented to manage protected vs public routes securely.

## Design
- **Framer Motion**: Used for all micro-interactions (modals, task checks, layout shifts). Kept under 300ms for snappiness.
- **Premium Dark Theme**: Built around HSL color variables (`--background`, `--foreground`, `--primary`).
- **No Generic AI Visuals**: Avoided purple/blue gradients in favor of subtle grayscale/monochrome highlighting with soft shadows.
- **Mobile Bottom Bar**: Added for thumb-friendly mobile navigation instead of a hamburger menu, increasing tactile feel.

## Backend
- **Supabase**: Chosen for Auth (Magic Link, Google) and Postgres database. RLS policies ensure data privacy per user session.
