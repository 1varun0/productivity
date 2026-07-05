<div align="center">
  <h1>Vibecoded Productivity</h1>
  <p>A next-generation, glassmorphic productivity suite blending collaborative workspaces, gamified habit tracking, and immersive deep-work chambers.</p>

  [![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-8.x-purple?style=for-the-badge&logo=vite)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
</div>

<br />

## 🪐 Philosophy
Productivity isn't just another task manager. It is a highly opinionated, visually immersive workspace designed to induce flow states. By combining brutalist utility with a premium, cinematic "cyberpunk-glassmorphism" aesthetic, it transforms mundane task management into a high-fidelity experience.

---

## ⚡ Core Features

### 🏢 Workspaces & Collaboration
- **Project Hubs:** Unified spaces containing Real-time Chat, Tasks, Lists, and secure file attachments.
- **Real-Time Synchronicity:** Powered by Supabase Realtime, enabling instant message delivery and collaborative updates.
- **Role-Based Access Control:** Strict PostgreSQL RLS enforcing Owner, Editor, and Member boundaries.

### ⏱️ Dynamic Timetable
- **Visual Scheduling:** A fluid, drag-and-drop enabled time grid.
- **Premade Blocks:** Save and quickly deploy recurring tasks onto your schedule.
- **Precision Metrics:** Tracks exact durations and calculates overlapping schedule logic seamlessly, offering a distraction-free cinematic scheduling experience.

### 🧘 The Nexus (Focus Chamber)
- **Immersive Deep Work:** An isolated, cinematic Markdown editor stripped of all UI distractions.
- **Celestial Controls:** Ritualistic UI elements represented as floating orbital nodes rather than traditional buttons.
- **Public Publishing:** Securely generate public URL slugs to share your Nexus notes with the world.

### 📈 Gamified Habits
- **Streak Tracking:** Mathematical streak calculation with visual completion grids.
- **Metric Analytics:** Weekly and monthly completion charts to visualize discipline.
- **Categorization:** Tag and color-code habits for visual hierarchy.

### ⚡ Global Command & Capture
- **Command Palette:** Press `CMD+K` / `CTRL+K` from anywhere to navigate the app and trigger actions.
- **Quick Capture:** Press `CMD+Space` / `CTRL+Space` to instantly capture thoughts, tasks, and ideas into your Inbox.

---

## 🏗️ Architecture & Project Structure

The codebase is organized using a feature-based architecture for optimal scalability:

```text
src/
├── components/   # Global reusable UI components (Modals, Layouts, Landing)
├── features/     # Feature-specific modules (The core application logic)
│   ├── habits/
│   ├── nexus/
│   ├── timetable/
│   ├── workspace/
│   ├── tasks/
│   ├── lists/
│   ├── timer/
│   ├── inbox/
│   ├── captures/
│   └── focus-chamber/
├── pages/        # Global pages and routing entry points
├── store/        # Global Zustand state stores
├── hooks/        # Shared custom React hooks
└── lib/          # Utilities, API clients (Supabase), and configuration
```

**Technology Stack:**
- **Frontend Core:** React 19, TypeScript, Vite
- **Styling:** TailwindCSS v4 (Custom Glassmorphic & Cyberpunk Design System)
- **State Management:** Zustand (Modular, slice-based stores)
- **Animations:** Framer Motion
- **Editor:** UIW React CodeMirror / React Markdown
- **Routing:** React Router v7 (with route-level code splitting & suspense)

**Backend Infrastructure (Supabase):**
- **Database:** PostgreSQL (Strict typing, comprehensive RLS)
- **Auth:** Magic Link & OAuth integrations
- **Storage:** Secure S3-compatible buckets for project attachments
- **Edge Functions:** Deno-based serverless functions for system actions

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm
- A Supabase Project (Free tier is fully supported)

### 1. Clone & Install
```bash
git clone https://github.com/1varun0/productivity.git
cd productivity
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory and populate it with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Database Migration
Navigate to the Supabase dashboard and run the SQL migrations located in the `/supabase/migrations` folder to establish the schema, RLS policies, and RPC functions. *(Note: Verify your edge functions and DB functions are deployed with `SECURITY INVOKER` where appropriate for maximum security).*

### 4. Run Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173` to explore the workspace.

---

## 🛡️ Security & Performance Notes
This project adheres to strict enterprise-grade security protocols:
- **Strict Row Level Security (RLS):** No data is accessible without cryptographic proof of ownership or project membership.
- **RPC Lockdown:** PostgreSQL functions are strictly evaluated to prevent privilege escalation.
- **Bundle Optimization:** The frontend utilizes aggressive lazy-loading via `React.Suspense` to ensure initial chunks remain under optimal thresholds.

---

## 📚 Documentation
Comprehensive documentation for developers, including architecture diagrams, feature specs, and product briefs, can be found in the `/documentation` and `/gpdocs` directories.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<div align="center">
  <p>Built with precision.</p>
</div>
