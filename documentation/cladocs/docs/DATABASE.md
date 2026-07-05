# Database Documentation

This document outlines the PostgreSQL schema managed via Supabase. All 28 tables have Row Level Security (RLS) enabled.

## ASCII Entity Relationship Diagram

```text
  [PROFILES] 1-------* [TASKS] *-------1 [LISTS]
      |                   |
      |                   *-------* [PROJECT_FOLDERS]
      |
      +------1-------* [HABITS] 1-------* [HABIT_ENTRIES]
      |
      +------1-------* [NOTES] 1-------* [NOTE_VERSIONS]
      |                   |
      |                   1-------* [NOTE_ATTACHMENTS]
      |
      +------1-------* [FOCUS_SESSIONS] 1-------1 [SESSION_MEMORIES]
      |
      +------1-------* [TIMETABLE_BLOCKS]
      |
      +------1-------* [PROJECTS] 1-------* [PROJECT_MEMBERS]
                                  |
                                  +-------* [PROJECT_MESSAGES]
                                  |
                                  +-------* [PROJECT_INVITES]
```

## Tables & Columns

### 1. `profiles`
Purpose: Stores user preferences and identity.
- `id` (uuid, PK): Matches `auth.users.id`.
- `display_name` (text): User's chosen name.
- `username` (text, Unique): Unique handle.
- `accent_color` (text): Hex code for UI theme.
- `compact_mode` (boolean): UI density preference.
- `theme` (text): 'dark', 'light', or 'system'.

### 2. `tasks`
Purpose: Represents a to-do item.
- `id` (uuid, PK)
- `user_id` (uuid, FK): Owner of the task.
- `title` (text): Task title.
- `description` (text): Markdown description.
- `completed` (boolean): Status.
- `due_date` (timestamptz): Deadline.
- `list_id` (uuid, FK): The space/list it belongs to.
- `project_id` (uuid, FK): Workspace it belongs to (if collaborative).
- `folder_id` (uuid, FK): Project folder organization.

### 3. `habits` & `habit_entries`
Purpose: Track recurring activities.
- `habits.id` (uuid, PK)
- `habits.name` (text): Habit name.
- `habit_entries.habit_id` (uuid, FK)
- `habit_entries.completed_date` (date): When it was done.

### 4. `notes`
Purpose: Markdown documents for the Nexus feature.
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `title` (text)
- `content` (text): Markdown content.
- `type` (text): e.g., 'standard', 'daily'.
- `tags` (text[]): Array of tag strings.
- `linked_session_id` (uuid, FK): Focus session that generated this note.

### 5. `focus_sessions` & `session_memories`
Purpose: Track deep work sessions.
- `focus_sessions.id` (uuid, PK)
- `focus_sessions.duration_minutes` (integer)
- `focus_sessions.completion_state` (text): 'completed' or 'interrupted'.
- `session_memories.focus_session_id` (uuid, FK): Links a note to a completed session.

### 6. `timetable_blocks`
Purpose: Schedule blocks for the weekly planner.
- `id` (uuid, PK)
- `day` (integer): 0-6 (Monday-Sunday).
- `start_hour` (integer): 0-23.
- `duration` (integer): Length in hours.
- `category` (text): Used for color coding.

### 7. `projects` (Workspaces)
Purpose: Collaborative environments.
- `id` (uuid, PK)
- `name` (text)
- `owner_id` (uuid, FK): The creator.
- `invite_code` (text, Unique): Shareable link code.

### 8. `project_members`, `project_messages`, `project_files`
Purpose: Workspace relations.
- `project_members`: Maps `auth.users.id` to `projects.id` with a `role` ('owner', 'member', 'viewer').
- `project_messages`: Chat logs linked to a project.
- `project_files`: Metadata for files in Supabase Storage.

*(Note: Legacy tables like `template_blocks` and `scheduled_entries` exist but are superseded by `timetable_blocks`)*

## Row Level Security (RLS) Policies

RLS is strictly enforced. The policies generally follow these plain-English rules:

1. **Personal Data (Tasks, Habits, Notes, Timetable)**:
   - *Rule*: "Users can only read, insert, update, or delete rows where the `user_id` column matches their own `auth.uid()`."
   - *Why*: Ensures total privacy for personal productivity data.

2. **Workspace Data (Projects)**:
   - *Rule*: "Users can view a project if they are the owner OR if they exist in the `project_members` table for that project."
   - *Rule*: "Only the owner can update the project details."

3. **Workspace Collaboration (Messages, Files, Tasks in Projects)**:
   - *Rule*: "Users can view messages/files if they are a member of the parent project."
   - *Rule*: "Users can insert messages/files if they are an 'owner' or 'member' (viewers are read-only)."
   - *Rule*: "Users can only delete their *own* messages."

4. **Profiles**:
   - *Rule*: "Users can update their own profile."
   - *Rule*: "Users can view other profiles ONLY if they share a workspace (project) with them, or have a pending invite from them." (Prevents scraping the entire user base).

## Indexes

Indexes are applied to foreign keys and commonly queried columns to ensure fast lookups as tables grow:

- **Foreign Key Indexes**: Created on columns like `project_id`, `user_id`, `assigned_to` to speed up joins and filtering (e.g., `idx_tasks_project_id`, `idx_project_members_user_id`).
- **Composite Indexes**: Used for specific query patterns. For example, `idx_timetable_blocks_day` indexes `(user_id, day)` because the app frequently queries blocks for a specific user on a specific day.
- **Unique Indexes (Constraints)**:
  - `profiles_username_key`: Ensures no two users claim the same @handle.
  - `habit_entries_habit_id_completed_date_key`: Prevents a user from marking the same habit complete twice on the same day.
  - `project_members_project_id_user_id_key`: Ensures a user can only be added to a project once.

## Triggers and Functions

While complex logic is mostly in Edge Functions or client-side, the database relies on Postgres defaults and simple functions:
- `get_my_project_ids()`: A Postgres function often used in RLS policies to quickly return an array of project IDs the current user is a member of, simplifying complex policy checks.
- Auto-updating `updated_at` timestamps are typically handled by the client passing the current timestamp, though some tables may have standard Postgres triggers to set `updated_at = now()` on update.
