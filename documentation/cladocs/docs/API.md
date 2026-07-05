# API Documentation

Peak Hub does not have a traditional REST or GraphQL API backend (like Express or NestJS). Instead, the frontend communicates directly with the Supabase Postgres database using the `supabase-js` client, relying on Row Level Security (RLS) for authorization.

However, certain secure operations are offloaded to **Supabase Edge Functions**.

## Edge Functions

Edge Functions are serverless functions written in TypeScript/Deno, deployed globally on Supabase's infrastructure.

### `send-project-invite`

**Purpose**: 
When a user invites someone to a workspace, the frontend inserts a row into the `project_invites` table. A database trigger (or direct client invocation) calls this Edge Function to send an actual email to the invitee with a unique join link. This prevents the frontend from needing SMTP credentials or third-party API keys.

**Inputs (Payload)**:
```json
{
  "email": "user@example.com",
  "projectName": "Marketing Campaign",
  "inviterName": "Alice",
  "inviteToken": "uuid-v4-string"
}
```

**Outputs**:
- `200 OK`: Email dispatched successfully.
- `400 Bad Request`: Missing required payload fields.
- `500 Internal Error`: Failure communicating with the email provider.

**Environment Variables Required (in Supabase)**:
To run this function in production, the Supabase project requires:
- `RESEND_API_KEY`: API key for the Resend email service (or Mailtrap/SendGrid depending on configuration).
- `APP_URL`: The production URL of the frontend (e.g., `https://peakhub.app`) to construct the invite link correctly (`APP_URL/invite/TOKEN`).

---

## Major Supabase Query Patterns

Since the frontend queries the DB directly, certain patterns are used repeatedly throughout the app.

### 1. The "Current User" Filter
Because RLS protects data, the client rarely needs to explicitly filter by `user_id`. RLS does this automatically.
```typescript
// Good: RLS ensures you only get your tasks
const { data } = await supabase.from('tasks').select('*');

// Unnecessary (but harmless):
const { data } = await supabase.from('tasks').select('*').eq('user_id', user.id);
```

### 2. Optimistic Updates
When mutating data (e.g., completing a task), the app updates the Zustand store *before* the Supabase call finishes.
```typescript
// 1. Update UI immediately
setTaskCompleted(taskId, true);

// 2. Perform DB update in background
const { error } = await supabase
  .from('tasks')
  .update({ completed: true })
  .eq('id', taskId);

// 3. Rollback if DB fails
if (error) {
  setTaskCompleted(taskId, false); // Revert
  toast.error("Failed to update task");
}
```

### 3. Realtime Subscriptions
Used in Workspace Chat to listen for new messages instantly.
```typescript
const channel = supabase
  .channel(`project_messages:${projectId}`)
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'project_messages', filter: `project_id=eq.${projectId}` },
    (payload) => {
      // Add new message to local state
      addMessageToStore(payload.new);
    }
  )
  .subscribe();
```

### 4. Relational Queries (Joins)
Supabase allows joining related tables in a single query using PostgREST syntax.
```typescript
// Fetch projects and include the owner's profile data
const { data } = await supabase
  .from('projects')
  .select(`
    *,
    owner:owner_id(display_name, username, accent_color)
  `);
```
