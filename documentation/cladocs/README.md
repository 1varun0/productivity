# Peak Hub

Peak Hub is a premium, dark-mode productivity application designed to help knowledge workers and students manage their tasks, track habits, plan their week, take markdown-based notes, and collaborate in dedicated project workspaces. It features an immersive "Focus Chamber" for distraction-free deep work.

The application is designed with a "celestial" aesthetic, utilizing glassmorphism, micro-animations, and a highly polished UI.

## Tech Stack

This project is built using a modern frontend stack paired with a Backend-as-a-Service:

- **Framework**: React 19 (Single Page Application)
- **Language**: TypeScript (Strict mode)
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS v4 (with `@tailwindcss/vite`)
- **State Management**: Zustand 5 (for global/feature UI state)
- **Server State / Caching**: TanStack React Query 5
- **Animations**: Framer Motion 12
- **Routing**: React Router DOM 7
- **Backend / Database**: Supabase (Postgres, Auth, Storage, Realtime, Edge Functions)
- **Icons**: Lucide React
- **Date Utilities**: date-fns

## Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v20 or higher recommended)
- npm (v10 or higher)
- A [Supabase](https://supabase.com/) account and project (the free tier is sufficient for development)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd productivity
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Environment Variables

You need to connect the frontend to your Supabase instance. Create a `.env.local` file in the root of the project:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these values in your Supabase Dashboard under **Project Settings > API**.

### Setting up Supabase

1. Apply the database migrations to your Supabase Postgres instance to create the necessary tables and Row Level Security (RLS) policies. (Refer to the Database documentation).
2. Enable **Google OAuth** and **Email (Magic Link)** authentication providers in the Supabase Auth settings.
3. If you plan to test workspace invitations, deploy the `send-project-invite` edge function (see Deployment documentation).

### Running Locally

Start the Vite development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`. Any changes to the code will hot-reload automatically.

## Project Structure Overview

The codebase is organized using a feature-sliced architecture to keep related code collocated:

```text
productivity/
├── public/                 # Static assets
├── src/
│   ├── components/         # Shared, reusable UI components (layout, modals, etc.)
│   ├── features/           # Feature-specific modules (the core app logic)
│   │   ├── focus-chamber/  # Deep work timer environment
│   │   ├── habits/         # Habit tracking
│   │   ├── nexus/          # Markdown note editor and collections
│   │   ├── tasks/          # Task management
│   │   ├── timetable/      # Weekly planner
│   │   └── workspace/      # Collaborative projects
│   ├── hooks/              # Global custom React hooks
│   ├── lib/                # Third-party service initialization (Supabase client)
│   ├── pages/              # Top-level route components
│   ├── store/              # Global Zustand stores (UI state, user profile)
│   ├── types/              # Global TypeScript definitions
│   ├── index.css           # Global CSS and Tailwind design tokens
│   └── App.tsx             # Routing definition
├── supabase/               # Supabase edge functions and config
└── cladocs/                # Project documentation (you are here)
```

## How to Deploy

The application consists of a static frontend (React/Vite) and a managed backend (Supabase).

1. **Frontend Deployment (e.g., Vercel, Netlify):**
   - Connect your repository to your hosting provider.
   - Set the build command to `npm run build`.
   - Set the publish directory to `dist`.
   - Add the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in your hosting provider's dashboard.

2. **Backend Deployment:**
   - Your Supabase project is already hosted by Supabase.
   - Ensure your production database has all migrations applied and RLS policies are strictly enforced.
   - Deploy any Edge Functions using the Supabase CLI: `supabase functions deploy`.

For detailed deployment instructions, including setting up production emails and URLs, refer to `docs/DEPLOYMENT.md`.
