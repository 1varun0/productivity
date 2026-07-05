<div align="center">
  <h1>Vibecoded Productivity</h1>
  <p>Your entire work life. One place. Tasks, habits, notes, time-blocking, and team collaboration — all connected. Built for people who take their work seriously.</p>

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

## ⚡ Core Modules

### 1. I-01 // Tasks & Spaces
**Capture instantly. Execute deeply.**
Most task managers tell you what to do but abandon you when it's time to actually do it. Tasks & Spaces is different. Organize your life into Spaces, attach files and notes to any task, and launch directly into a Focus session — all without switching apps.
- Unlimited Spaces and tasks
- Priority flagging with smart sorting
- File, image, and link attachments per task
- Screenshot paste with Ctrl+V
- 1-click launch into Focus Mode

### 2. T-02 // Focus Mode
**One task. One timer. Zero distractions.**
The Focus Chamber hides the entire app and locks you into one task. Choose your session length, start the timer, and work. When it ends, your session is logged. Simple. Powerful. Rare.
- 25m, 45m, 90m, or custom session lengths
- Full immersive mode — entire UI disappears
- Every session linked to a specific task
- Session history tracked automatically

### 3. N-03 // Nexus Notes
**A second brain that thinks at your speed.**
Nexus opens instantly, auto-saves every keystroke, and never gets in the way of your thinking. Split the screen to write and reference at the same time. Full version history means you have never lost a word.
- 6 note types — Journal, Checklist, Resource, Idea and more
- Slash commands for instant formatting
- Infinite split-screen panes
- Full version history with 1-click restore
- Secure public note sharing (URL slugs)

### 4. H-04 // Habits
**Don't break the chain. Track habits where you work.**
Click a cell to mark a habit done. That is it. The matrix fills with color, your streak grows, and your consistency becomes a visual record you are genuinely motivated to maintain.
- Single-click logging — no forms or friction
- Live streak counter per habit with visual matrix
- Fire emoji at 3+ day streaks 🔥
- Custom colors per habit
- Drag-and-drop reordering

### 5. C-05 // Timetable
**Where your to-do list meets reality.**
A task list without a schedule is just a wish list. Drag tasks and habits directly onto a 24-hour weekly grid. Built-in conflict detection, category analytics, and a global undo make this the most powerful time-blocking tool you have ever used.
- Drag tasks and habits directly onto the 24-hour weekly grid
- 8 color-coded categories
- Real-time conflict detection
- Global undo — Ctrl+Z / Cmd+Z
- Export full schedule as PNG

### 6. W-06 // Workspace
**Your team. Your projects. One place.**
Create a project, invite your team by email, and start collaborating immediately. Tasks, docs, chat, and files all live in one place. See who is online in real time. Everything syncs live across every member.
- Unlimited projects with Email invitations (7-day expiry)
- Three roles — Owner, Member, Viewer
- Shared tasks synced live across all members
- Real-time project chat
- Full nested collaborative file manager

---

## 🏗️ Architecture & Project Structure

The codebase is organized using a feature-based architecture for optimal scalability:

```text
src/
├── assets/       # Static assets (images, svg icons, fonts)
├── components/   # Global UI components (CommandPalette, Modals, Layout, Landing)
├── features/     # Feature-based modules isolating domain logic
│   ├── habits/         # Habit tracking and visualization
│   ├── nexus/          # Markdown editor and note-taking
│   ├── timetable/      # 24-hour visual scheduling grid
│   ├── workspace/      # Collaborative team projects and chat
│   ├── tasks/          # Task management
│   ├── lists/          # List management
│   ├── timer/          # Focus timer logic
│   ├── inbox/          # Global inbox for captures
│   ├── captures/       # Quick capture system
│   └── focus-chamber/  # Immersive distraction-free environment
├── hooks/        # Global custom React hooks (useAuth, useCapture)
├── lib/          # Core utilities and clients (e.g., Supabase client)
├── pages/        # Root-level route components and legal pages
├── providers/    # React Context providers (AuthProvider)
├── store/        # Global Zustand state stores (CommandPalette, Profile, etc.)
├── types/        # Global TypeScript interfaces and type definitions
└── utils/        # General helper functions and utilities
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
Navigate to the Supabase dashboard and run the SQL migrations located in the `/supabase/migrations` folder to establish the schema, RLS policies, and RPC functions.

### 4. Run Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173` to explore the workspace.

---

## 📚 Documentation
Comprehensive documentation for developers, including architecture diagrams, feature specs, and product briefs, can be found in the `/documentation` and `/gpdocs` directories.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<div align="center">
  <p>Built with precision.</p>
</div>
