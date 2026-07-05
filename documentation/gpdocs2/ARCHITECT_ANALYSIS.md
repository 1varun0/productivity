# Technical Architecture Analysis & Feature Inventory

**Role:** Staff Software Engineer / Solutions Architect
**Objective:** Comprehensive reverse-engineering of application capabilities, implementation logic, and structural gap analysis.

---

## 1. Authentication & Identity Management

### Macro Feature
**User Authentication & Authorization**: Secures the application, manages user identity, and ensures strict data isolation. It integrates directly with Supabase Auth and leverages Postgres Row Level Security (RLS) to prevent unauthorized cross-tenant data access.

### Micro Features
- Magic Link (Passwordless) Login
- Google OAuth Integration
- JWT Session Persistence & Auto-Refresh
- Protected Route Guarding
- Global UI Profile Settings (Theme, Color, Density)

### Implementation Details
1. **Login Flow**: The user enters their email on `src/pages/LoginPage.tsx`. The component invokes `supabase.auth.signInWithOtp()`.
2. **Session Verification**: `src/hooks/useAuth.tsx` listens for the `onAuthStateChange` event. When the JWT is validated, the session state is updated.
3. **Route Guarding**: In `src/App.tsx`, the `<ProtectedRoute>` component intercepts routing. If no session exists, it forces a redirect to `/login`.
4. **Data Flow**: Upon successful auth, the Supabase client automatically attaches the JWT to all subsequent PostgREST database queries. RLS policies in the database read `auth.uid()` from the JWT to filter data automatically (e.g., `SELECT * FROM tasks` only returns the authenticated user's tasks).
5. **Profile State**: `src/store/useProfileStore.ts` fetches the user's row from the `profiles` table and injects the `accent_color` and `theme` preferences into the DOM via CSS variables on the `:root` element.

### Current State & Gap Analysis
- **Strengths**: Highly secure; relies on robust JWT and database-level RLS rather than vulnerable client-side filtering.
- **Edge Cases Handled**: Handles missing profiles by automatically upserting default values if a user somehow bypasses the initial profile creation trigger.
- **Gaps/Missing Logic**: There is no Multi-Factor Authentication (MFA) implementation. Furthermore, if a user's session expires while the application is backgrounded for days, the optimistic UI mutations might fail silently before the redirect to login occurs.

---

## 2. Deep Work Engine (Focus Chamber)

### Macro Feature
**Focus Chamber**: An immersive, full-screen timer environment designed to eliminate visual distractions and enforce "deep work" principles. It integrates with a "Mental Inbox" to capture stray thoughts without breaking context.

### Micro Features
- Celestial Orb Breathing Animation (Framer Motion)
- Custom Duration Timer
- Hidden Interface (Hover-to-reveal controls)
- Mental Inbox Quick Capture (Global Keyboard Shortcut)
- Session Memory Logging & Reflection

### Implementation Details
1. **Initialization**: User selects a duration and intention in `src/features/focus-chamber/FocusChamber.tsx`.
2. **State Transition**: `useStore.ts` sets `isFocusing = true`. The `AppLayout` component reacts to this by unmounting the standard sidebar and mounting the `FocusEnvironment` overlay.
3. **Timer Logic**: A `setInterval` runs, but rather than blindly decrementing a counter (which drifts when tabs are throttled), it calculates the exact difference between `started_at` and `Date.now()`.
4. **Persistence**: The Zustand store uses the `persist` middleware. The entire timer state is serialized to `localStorage`. If the user accidentally hits F5, the timer instantly resumes upon hydration.
5. **Quick Capture**: Pressing `Ctrl+Space` triggers a global event listener, opening the `CaptureModal.tsx`. Submitting text inserts a row into the `mental_inbox` table.
6. **Completion**: Upon finishing, the user submits a reflection string. The app creates a `focus_sessions` record and a linked `session_memories` record in Supabase.

### Current State & Gap Analysis
- **Strengths**: The `localStorage` persistence and timestamp-based interval logic ensure the timer is extremely resilient to accidental refreshes and browser throttling.
- **Edge Cases Handled**: The celestial animation is disabled if the user's OS has "Prefers Reduced Motion" enabled, ensuring accessibility.
- **Gaps/Missing Logic**: The application cannot prevent OS-level distractions (like desktop notifications). A future integration with native OS APIs (e.g., via Tauri or Electron) to toggle macOS "Do Not Disturb" would significantly elevate this feature.

---

## 3. Weekly Grid Planner (Timetable)

### Macro Feature
**Timetable**: A visual, drag-and-drop 24-hour, 7-day scheduling interface allowing users to time-block their week into specific categories (Sleep, Work, Deep Work).

### Micro Features
- CSS Grid 24/7 Visualization
- Drag-and-Drop Creation and Modification
- Top/Bottom Resize Handles
- Undo/Redo Stack
- Conflict/Overlap Visual Warnings

### Implementation Details
1. **Rendering**: `src/features/timetable/components/WeeklyGrid.tsx` uses a CSS grid layout where rows equal hours and columns equal days. Blocks are absolutely positioned based on start time and duration.
2. **Interaction Logic**: Pointer events track dragging. As the user drags, `src/store/useWeeklyTimetableStore.ts` updates the local state array of blocks instantly at 60fps, recalculating the `day` and `start_hour`.
3. **Debounced Sync**: To prevent rate-limiting the Supabase PostgREST API with hundreds of `UPDATE` queries during a single drag gesture, the store utilizes a debounced `syncToDatabase` function. The API call is only dispatched 500ms after the mouse is released.
4. **Data Integrity**: The database enforces integrity via CHECK constraints on `timetable_blocks` (`day` must be 0-6, `start_hour` 0-23, `duration` 1-24).

### Current State & Gap Analysis
- **Strengths**: The debouncing and optimistic UI updates make the heavy drag-and-drop interactions feel native and instantaneous.
- **Edge Cases Handled**: Dragging a block past midnight (Sunday 11:59 PM) stops at the boundary, preventing impossible time constraints.
- **Gaps/Missing Logic**: There is no integration with external calendar providers (Google Calendar, Outlook). The Timetable exists in a silo. Additionally, the database contains legacy tables (`template_blocks`) from an older iteration of this feature that are currently dead code and need to be purged.

---

## 4. Collaborative Workspaces

### Macro Feature
**Workspaces & Real-Time Chat**: Allows users to create isolated "projects", invite other users, and collaborate via shared tasks, document storage, and real-time messaging.

### Micro Features
- Project Creation
- Secure Email Invitations (Role-based)
- Real-time WebSocket Chat
- Chat Message Soft-Deletion
- Shared File Storage

### Implementation Details
1. **Invitations**: When an owner invites an email, the app inserts a row into `project_invites` with a unique UUID token. A database trigger or client call hits the `send-project-invite` Supabase Edge Function (Deno), which uses the Resend API to dispatch an email containing a secure join link (`APP_URL/invite/<token>`).
2. **Acceptance**: The invitee clicks the link, hits `App.tsx`, and the component verifies the token against the database, ultimately inserting them into `project_members`.
3. **Real-time Chat**: `src/features/workspace/components/ChatWindow.tsx` uses `supabase.channel()` to subscribe to Postgres changes. 
4. **Chat Data Flow**: When User A types a message, it is optimistically added to the local array and sent to the database via `INSERT`. Supabase broadcasts this `INSERT` over WebSockets to User B, whose local channel subscription receives the payload and appends it to their chat window.

### Current State & Gap Analysis
- **Strengths**: Extremely secure. Row Level Security ensures that even if a user tries to brute-force the API to read messages from another workspace, the query is rejected because they lack a `project_members` mapping.
- **Edge Cases Handled**: Chat supports soft-deletion. If a message is deleted, the content is hidden, but the row remains so that the UI doesn't break historical threading.
- **Gaps/Missing Logic**: The chat interface lacks pagination (infinite scroll). It only fetches the last N messages upon load. Furthermore, file attachments in chat are currently stored as metadata in JSONB; deep integration with Supabase Storage for actual file hosting needs refinement to handle very large uploads gracefully.

---

## 5. Knowledge Management (Nexus)

### Macro Feature
**Nexus Notes**: A markdown-based document editor allowing users to create, tag, and organize knowledge, link it to focus sessions, and share it publicly.

### Micro Features
- Live Markdown Formatting
- Folder/Collection Organization
- Version Snapshotting
- Public URL Sharing (Bypass RLS)

### Implementation Details
1. **Editor**: `src/features/nexus/components/MarkdownEditor.tsx` handles text input.
2. **Autosave**: Like the Timetable, keystrokes update local state instantly, but a debounced effect waits for typing to pause for 1.5 seconds before firing a database `UPDATE` to the `notes` table.
3. **Public Sharing**: When a user clicks "Share", the client generates a secure slug and inserts it into `public_note_shares`.
4. **Public Routing**: Unauthenticated users visiting `src/pages/PublicNotePage.tsx` use a special Supabase query that reads from a view or relies on RLS policies that specifically allow `SELECT` on `notes` joined with `public_note_shares` where the slug matches.

### Current State & Gap Analysis
- **Strengths**: Seamless integration with the Focus Chamber. When a deep work session ends, the reflection is automatically stored as a note in the Nexus, creating an automatic diary of work.
- **Gaps/Missing Logic**: The markdown editor is functional but lacks block-based editing (like Notion) or collaborative cursors (like Google Docs). Simultaneous editing of a shared document in a Workspace will result in a "last-write-wins" conflict, overriding the other user's changes.
