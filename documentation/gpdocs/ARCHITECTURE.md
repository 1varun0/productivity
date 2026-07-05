# Architecture Diagrams

This document visualizes the high-level system architecture and the module-level frontend architecture of Peak Hub.

## 1. High-Level System Architecture

Peak Hub operates on a BaaS (Backend-as-a-Service) model, where the React frontend communicates directly with Supabase services. There is no traditional middle-tier API server (like Node/Express) for CRUD operations.

```mermaid
graph TD
    subgraph Client Tier
        Browser[User Browser<br/>(React SPA)]
    end

    subgraph Supabase Ecosystem
        Auth[Supabase Auth<br/>(GoTrue)]
        DB[(PostgreSQL Database<br/>+ PostgREST API)]
        Realtime[Supabase Realtime<br/>(WebSockets)]
        Storage[Supabase Storage<br/>(S3 Compatible)]
        Functions[Supabase Edge Functions<br/>(Deno Deploy)]
    end

    subgraph External Services
        Email[Email Provider<br/>(e.g., Resend / Mailtrap)]
        OAuth[OAuth Providers<br/>(Google, etc.)]
    end

    %% Client Interactions
    Browser -- "1. Authenticates (JWT)" --> Auth
    Browser -- "2. REST over HTTPS" --> DB
    Browser -- "3. WebSockets" --> Realtime
    Browser -- "4. File Uploads" --> Storage
    Browser -- "5. Triggers Webhooks" --> Functions

    %% Supabase Internal Routing
    Auth -- "Validates Access" --> DB
    DB -. "Row Level Security (RLS)" .-> DB
    DB -- "DB Triggers/Webhooks" --> Functions
    
    %% External Integrations
    Auth -. "OAuth Flow" .-> OAuth
    Functions -- "Sends Invite Emails" --> Email
    
    classDef client fill:#3b82f6,stroke:#2563eb,stroke-width:2px,color:white;
    classDef supabase fill:#10b981,stroke:#059669,stroke-width:2px,color:white;
    classDef external fill:#6366f1,stroke:#4f46e5,stroke-width:2px,color:white;
    
    class Browser client;
    class Auth,DB,Realtime,Storage,Functions supabase;
    class Email,OAuth external;
```

### Key Architectural Decisions
- **Direct-to-Database**: The frontend uses `@supabase/supabase-js` to execute queries directly against Postgres.
- **Row Level Security (RLS)**: Because the client queries the database directly, security is pushed to the database layer. Postgres RLS policies ensure users can only access their own data or data shared in their workspaces.
- **Edge Functions**: Used sparingly for tasks that require secure secrets (like sending emails) that cannot be exposed to the client.

---

## 2. Module-Level Frontend Architecture

The frontend uses a feature-sliced architecture. Code is organized by business domain rather than technical type (e.g., all task-related components, hooks, and stores are co-located in `src/features/tasks/`).

```mermaid
graph LR
    subgraph App Shell
        Router[React Router]
        AppLayout[AppLayout & Sidebar]
        GlobalStore[(Global Zustand Stores<br/>useStore, useProfile)]
    end

    subgraph Feature Modules
        Tasks[Tasks & Lists]
        Habits[Habits]
        Timetable[Timetable]
        Focus[Focus Chamber]
        Nexus[Nexus Notes]
        Workspace[Workspace & Chat]
    end

    subgraph Data Access Layer
        ReactQuery[TanStack React Query<br/>(Server State Cache)]
        SupabaseClient[Supabase JS Client]
    end

    Router --> AppLayout
    AppLayout --> Tasks & Habits & Timetable & Focus & Nexus & Workspace
    
    Tasks & Habits & Timetable & Focus & Nexus & Workspace --> ReactQuery
    Tasks & Habits & Timetable & Focus & Nexus & Workspace -. "Read/Write Global State" .-> GlobalStore
    
    ReactQuery --> SupabaseClient
    
    classDef shell fill:#1f2937,stroke:#374151,stroke-width:2px,color:white;
    classDef feature fill:#4f46e5,stroke:#4338ca,stroke-width:2px,color:white;
    classDef data fill:#059669,stroke:#047857,stroke-width:2px,color:white;
    
    class Router,AppLayout,GlobalStore shell;
    class Tasks,Habits,Timetable,Focus,Nexus,Workspace feature;
    class ReactQuery,SupabaseClient data;
```

### Data Flow Example (Optimistic Update)
When a user completes a task:
1. The Task Component dispatches a mutation via React Query or updates a local Zustand store directly.
2. The UI re-renders immediately to show the task as complete (Optimistic Update).
3. In the background, the Supabase Client sends an `UPDATE` request to the database.
4. If the database request fails, the UI rolls back to the previous state and an error toast is displayed.
