# User Flows and Features

This document outlines the major user journeys and feature acceptance criteria within Peak Hub.

## Major User Flows

### 1. Authentication and Profile Creation
1. User arrives at `/login` and enters email/password or uses Google OAuth.
2. User is redirected to the `/` Dashboard.
3. If the user's `profiles` record is missing (first-time login), the client automatically inserts a default profile row to establish UI preferences.
4. User clicks their avatar to open `SettingsModal` and customizes their `display_name` and `accent_color`.

### 2. Deep Work (Focus Chamber)
1. User navigates to the Tasks view and selects "Start Focus" on a specific task.
2. The `AppLayout` detects `isFocusing = true` from the global store and transitions out standard UI elements.
3. The celestial orb animation dominates the screen, and a timer begins counting down.
4. If distracted, the user hits `⌘+Space` to open the Capture Modal, logs a stray thought to the `mental_inbox`, and immediately returns to focus.
5. Upon timer completion, the user is prompted for a reflection note, which is saved to `session_memories` in the Nexus.

### 3. Workspace Collaboration
1. User navigates to Workspaces and clicks "Create Project".
2. User invites a colleague via email. An Edge Function sends a unique token.
3. Colleague clicks the email link, authenticates, and is routed to `/invite/:token`. The app accepts the invite and adds them to `project_members`.
4. Both users navigate to the project chat and exchange real-time messages via Supabase WebSockets.

---

## Feature List & Acceptance Criteria

### Task Management
- **Description**: Creation, organization, and completion of to-dos.
- **Acceptance Criteria**:
  - *Given* I am on the Tasks page, *When* I enter a title and press Enter, *Then* a new task is created and appears at the top of the list.
  - *Given* I click the completion checkbox, *Then* the task is marked complete in the UI instantly and moved to the completed section.

### Habit Tracking
- **Description**: Daily tracking of recurring goals with streak calculation.
- **Acceptance Criteria**:
  - *Given* a habit exists, *When* I click its grid square for today, *Then* it visually fills with color and a record is inserted into `habit_entries`.
  - *Given* I click an already filled square, *Then* it clears the color and deletes the `habit_entries` record.

### Timetable
- **Description**: A 24/7 weekly drag-and-drop grid planner.
- **Acceptance Criteria**:
  - *Given* I drag a block to a new time slot, *Then* the UI updates instantly.
  - *Given* I release the drag, *Then* a debounced API call persists the new time coordinates to the database.

### Nexus (Notes)
- **Description**: Markdown editor for knowledge management.
- **Acceptance Criteria**:
  - *Given* I am editing a note, *When* I stop typing for 1 second, *Then* the content is automatically saved without manual intervention.
  - *Given* I click "Share Publicly", *Then* a unique URL slug is generated and the note is accessible by unauthenticated users.

### Workspace (Projects)
- **Description**: Shared environments for team collaboration.
- **Acceptance Criteria**:
  - *Given* I am not a member of project X, *When* I attempt to query its tasks, *Then* the database returns an empty array (RLS enforced).
  - *Given* two users are viewing the same project chat, *When* User A sends a message, *Then* User B sees it appear instantly without refreshing.
