# System Architecture

Peak Hub uses a modern decoupled architecture, separating the client-side Single Page Application (SPA) from a managed Backend-as-a-Service (BaaS).

## Full System Explanation

The system is designed for high interactivity, optimistic UI updates, and offline resilience where possible. The heavy lifting of authentication, data persistence, and real-time syncing is offloaded to Supabase, allowing the React frontend to act as a thick client.

Because there is no custom backend API server (like Express or NestJS), the frontend communicates directly with the Supabase PostgreSQL database. Security is enforced entirely at the database layer using Postgres Row Level Security (RLS) policies.

## Data Flow Diagram

```text
+-------------------+        +-----------------------------------+
|                   |        |           React SPA               |
|  User (Browser)   | <====> |  (Vite + React 19 + Tailwind 4)   |
|                   |        |                                   |
+-------------------+        +--------+---------------+----------+
                                      |               |
                                      v               v
                             +----------------+ +---------------+
                             | Zustand Stores | |  React Query  |
                             | (Client State) | |(Server Cache) |
                             +--------+-------+ +-------+-------+
                                      |                 |
                                      +--------+--------+
                                               |
                                        (Supabase Client)
                                               |
===============================================|=====================================
SUPABASE PLATFORM                              |
                                               v
+-----------------+   +------------------+   +----------------+   +-----------------+
|      Auth       |   |    Database      |   |    Storage     |   |    Realtime     |
| (GoTrue/OAuth)  |   | (PostgreSQL+RLS) |   | (S3-compatible)|   | (WebSockets)    |
+-----------------+   +--------+---------+   +----------------+   +-----------------+
                               |
                      +--------v---------+
                      |  Edge Functions  | ----> External APIs (e.g., Resend Email)
                      |   (Deno Deploy)  |
                      +------------------+
```

## Frontend Structure

The frontend is organized using a **feature-sliced architecture**. This prevents the codebase from becoming a tangled mess of generic `components` and `hooks` folders.

1. **Features (`src/features/`)**: The app is divided into distinct business domains (e.g., `tasks`, `habits`, `timetable`, `workspace`, `focus-chamber`). Each feature folder contains its own:
   - `components/`: UI pieces specific to this feature.
   - `hooks/`: Custom logic for this feature.
   - `store/`: Zustand stores that only this feature cares about.
   - `types.ts`: Type definitions for this domain.
2. **Shared Components (`src/components/`)**: Only components that are used across *multiple* features (like buttons, standard modals, or the main layout wrappers) live here.
3. **Global Stores (`src/store/`)**: Zustand stores that manage application-wide state, such as the user's profile settings, active theme, or global modal visibility.
4. **Pages (`src/pages/`)**: Top-level route components. These are mostly thin wrappers that compose feature components together.

## How Supabase is Used

Supabase acts as the entire backend infrastructure:

- **Auth**: Manages user signups, logins (Google OAuth and Magic Links), and session tokens (JWTs). The JWT is automatically attached to all database requests.
- **Database (Postgres)**: The primary data store. Contains 28 tables. Security is managed via RLS, ensuring users can only read/write their own data or data belonging to workspaces they are members of.
- **Realtime**: Uses Postgres changes and WebSocket channels to sync chat messages (`project_messages`) instantly to all connected clients in a workspace.
- **Storage**: Used for storing user-uploaded files, such as note attachments in Nexus and project files in workspaces.
- **Edge Functions**: Small serverless functions written in TypeScript/Deno. Used for operations that require secure server-side logic, such as sending emails (`send-project-invite`) via a third-party SMTP/API service, ensuring API keys are never exposed to the client.

## Zustand Store Organization

State management is handled by Zustand. The stores are highly modularized:

- **Who owns what?**
  - `useStore` (Global): Owns global UI state (is the command palette open? is the focus session active?).
  - `useProfileStore` (Global): Owns user preferences (accent color, theme, compact mode) and syncs them to the `profiles` table.
  - `useTimetableStore` / `useWeeklyTimetableStore` (Feature): Owns the complex grid state, drag-and-drop logic, and optimistic updates for the timetable.
  - `useWorkspaceStore` (Feature): Owns the state of collaborative projects, active channels, and member lists.
  - `useNexusStore` (Feature): Owns the state of the note editor, open files, and folder trees.

Zustand is used primarily for **client-side state** and **optimistic UI updates**. For purely fetching and caching server data without complex client-side mutations, TanStack React Query is utilized.

## Key Design Decisions

1. **Why Vite instead of Next.js?**
   - *Decision*: Build a standard SPA with Vite.
   - *Reason*: The application is deeply interactive and fully auth-gated. SEO is not a concern for the main application features. A pure SPA offers a faster development loop, simpler deployment (static files), and less mental overhead than managing SSR/Server Components for a highly stateful dashboard.

2. **Why Supabase + RLS?**
   - *Decision*: Direct client-to-database communication secured by RLS.
   - *Reason*: Writing a custom Node.js/Express API to simply proxy CRUD operations to a database is redundant for solo/small teams. RLS pushes authorization down to the data layer, making it extremely secure while drastically accelerating frontend feature development.

3. **Why Zustand?**
   - *Decision*: Use Zustand instead of Redux.
   - *Reason*: Zustand requires significantly less boilerplate. Its API is simple, and it supports middleware like `persist` out of the box, which is critical for saving the user's focus timer state to `localStorage` in case they accidentally refresh the page.

4. **Why Tailwind CSS?**
   - *Decision*: Tailwind v4 for all styling.
   - *Reason*: Enables rapid UI iteration. Using Tailwind's `@theme` allows us to define the "Celestial" design system tokens (colors, spacing) in one CSS file and use them as utility classes everywhere, avoiding the specificity wars of traditional CSS.
