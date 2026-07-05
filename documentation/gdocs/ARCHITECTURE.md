# ARCHITECTURE.md — System Architecture

> C4 Model representation of the Peak Hub productivity application.
> Levels 1 (System Context) and 2 (Container) diagrams.

---

## 1. System Context (C4 Level 1)

Shows how Peak Hub fits into its broader ecosystem of users and external services.

```mermaid
C4Context
    title System Context — Peak Hub Productivity App

    Person(user, "User", "Student or knowledge worker managing tasks, habits, notes, timetables, and focus sessions")

    System(peakhub, "Peak Hub", "Single-page productivity application with task management, habit tracking, note-taking, timetable planning, focus timer, and collaborative workspaces")

    System_Ext(supabase, "Supabase Platform", "Managed Postgres database, Auth, Storage, Edge Functions, and Realtime")
    System_Ext(google_auth, "Google OAuth", "Social sign-in provider")
    System_Ext(google_fonts, "Google Fonts CDN", "Inter, JetBrains Mono, Material Symbols")
    System_Ext(resend, "Resend Email", "Transactional email delivery for project invites")

    Rel(user, peakhub, "Uses", "HTTPS / Browser")
    Rel(peakhub, supabase, "Reads/Writes data, authenticates", "HTTPS / WebSocket")
    Rel(supabase, google_auth, "Delegates OAuth", "HTTPS")
    Rel(supabase, resend, "Sends invite emails via Edge Function", "HTTPS")
    Rel(peakhub, google_fonts, "Loads fonts", "HTTPS")
```

---

## 2. Container Diagram (C4 Level 2)

Shows the major runtime containers and how they communicate.

```mermaid
C4Container
    title Container Diagram — Peak Hub

    Person(user, "User", "Browser-based user")

    Container_Boundary(spa, "Browser SPA") {
        Container(react_app, "React SPA", "React 19 + Vite 8 + TypeScript", "Single-page application with routing, state management, and UI rendering")
        Container(zustand_stores, "Zustand Stores", "Zustand 5", "Client-side state management: useStore, useProfileStore, useTimetableStore, useWeeklyTimetableStore, useNexusStore, useWorkspaceStore, useCommandPaletteStore")
        Container(react_query, "React Query Cache", "TanStack Query 5", "Server-state caching and synchronization")
    }

    Container_Boundary(supabase_platform, "Supabase Platform") {
        ContainerDb(postgres, "PostgreSQL Database", "Supabase Postgres", "28 tables with RLS: profiles, tasks, habits, notes, timetable_blocks, projects, and more")
        Container(auth, "Supabase Auth", "GoTrue", "Google OAuth + Magic Link authentication, JWT issuance")
        Container(storage, "Supabase Storage", "S3-compatible", "File storage for note attachments, project files, and chat attachments")
        Container(realtime, "Supabase Realtime", "Phoenix Channels", "WebSocket subscriptions for chat messages and presence")
        Container(edge_fn, "Edge Functions", "Deno Deploy", "send-project-invite: sends email invites via Resend")
    }

    System_Ext(google_oauth, "Google OAuth Provider", "Social identity provider")
    System_Ext(resend_api, "Resend API", "Email delivery")

    Rel(user, react_app, "Interacts with", "HTTPS")
    Rel(react_app, zustand_stores, "Reads/writes state")
    Rel(react_app, react_query, "Queries/mutations")
    Rel(zustand_stores, postgres, "CRUD via supabase-js", "HTTPS")
    Rel(react_query, postgres, "Queries", "HTTPS")
    Rel(react_app, auth, "Sign in/out, session", "HTTPS")
    Rel(react_app, storage, "Upload/download files", "HTTPS")
    Rel(react_app, realtime, "Subscribe to messages", "WebSocket")
    Rel(auth, google_oauth, "OAuth flow", "HTTPS")
    Rel(edge_fn, resend_api, "Send email", "HTTPS")
    Rel(react_app, edge_fn, "Invoke invite function", "HTTPS")
```

---

## 3. Data Model Overview

### Core Entity Groups

```mermaid
erDiagram
    profiles ||--o{ tasks : "owns"
    profiles ||--o{ habits : "owns"
    profiles ||--o{ notes : "owns"
    profiles ||--o{ timetable_blocks : "owns"
    profiles ||--o{ lists : "owns"
    profiles ||--o{ captures : "owns"
    profiles ||--o{ mental_inbox : "owns"
    profiles ||--o{ focus_sessions : "owns"
    profiles ||--o{ deadlines : "owns"

    tasks ||--o{ task_attachments : "has"
    tasks }o--o| lists : "belongs to"
    tasks }o--o| projects : "scoped to"

    habits ||--o{ habit_entries : "tracked by"

    notes ||--o{ note_attachments : "has"
    notes ||--o{ note_versions : "versioned by"
    notes }o--o| note_collections : "grouped in"
    notes ||--o| public_note_shares : "shared via"

    focus_sessions ||--o{ session_memories : "produces"
    focus_sessions }o--o| notes : "linked to"

    projects ||--o{ project_members : "has"
    projects ||--o{ project_invites : "has"
    projects ||--o{ project_messages : "has"
    projects ||--o{ project_docs : "has"
    projects ||--o{ project_folders : "has"
    projects ||--o{ project_files : "has"
    projects ||--o{ tasks : "contains"
```

### Database Tables (28 total, all with RLS enabled)

| Domain | Tables |
|---|---|
| **User** | `profiles` |
| **Tasks** | `tasks`, `task_attachments`, `lists` |
| **Habits** | `habits`, `habit_entries` |
| **Notes (Nexus)** | `notes`, `note_attachments`, `note_versions`, `note_templates`, `note_collections`, `note_collection_items`, `nexus_tags`, `public_note_shares` |
| **Focus** | `focus_sessions`, `session_memories`, `mental_inbox`, `captures` |
| **Timetable** | `timetable_blocks`, `template_blocks` (legacy), `scheduled_entries` (legacy), `deadlines` |
| **Workspace** | `projects`, `project_members`, `project_invites`, `project_messages`, `project_docs`, `project_folders`, `project_files` |

---

## 4. Feature ↔ Route Mapping

| Route | Feature Module | Page Component | Key Stores |
|---|---|---|---|
| `/` | tasks, lists, inbox, timer | `TodayPage` | `useStore` |
| `/habits` | habits | `HabitsPage` | feature store |
| `/timetable` | timetable | `TimetablePage` | `useTimetableStore`, `useWeeklyTimetableStore` |
| `/nexus` | nexus | `NexusView` | `useNexusStore` |
| `/workspace` | workspace | `WorkspacePage` | `useWorkspaceStore` |
| `/workspace/:id` | workspace | `WorkspacePage` | `useWorkspaceStore` |
| `/login` | — | `LoginPage` | `useAuth` |
| `/share/:slug` | nexus | `PublicNotePage` | — |
| `/invite/:token` | workspace | `InviteAcceptPage` | `useWorkspaceStore` |

---

## 5. State Management Architecture

```mermaid
flowchart LR
    subgraph "Global (Zustand)"
        A["useStore\n(UI state, focus session)"]
        B["useProfileStore\n(user profile, appearance)"]
        C["useCommandPaletteStore\n(⌘K palette)"]
    end

    subgraph "Feature Stores (Zustand)"
        D["useTimetableStore"]
        E["useWeeklyTimetableStore"]
        F["useNexusStore"]
        G["useWorkspaceStore"]
    end

    subgraph "Context"
        H["AuthContext\n(session, user)"]
    end

    subgraph "Server State"
        I["React Query\n(staleTime: 5min)"]
    end

    A --> |persist to localStorage| A
    B --> |sync to Supabase| B
    D --> |Supabase CRUD| D
    E --> |Supabase CRUD| E
    F --> |Supabase CRUD| F
    G --> |Supabase CRUD| G
    H --> |Supabase Auth| H
```

All Zustand stores that interact with Supabase implement **optimistic updates with rollback**.
