# Security and Performance

## Security Considerations

Because Peak Hub uses a thick-client architecture that communicates directly with the database, security is a primary concern.

### Authentication & Authorization
- **Identity**: Managed by Supabase Auth. Users receive a JWT upon login.
- **Authorization (RLS)**: This is the most critical security layer. Row Level Security policies in Postgres ensure that even if a malicious user manipulates the client-side API requests, the database will reject queries for data they do not own. 
  - *Example Policy*: `CREATE POLICY "Users can only see their own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);`
- **Secrets Management**: Never commit `.env.local`. Ensure Vercel/Netlify environment variables only contain the public `anon` key. Server-side secrets (like Resend API keys) must only exist within Supabase Edge Functions secrets management.

### Data Validation
While the UI performs form validation (e.g., ensuring a task title isn't empty), the database enforces strict integrity using `CHECK` constraints.
- *Example*: `timetable_blocks_start_hour_check CHECK (start_hour >= 0 AND start_hour <= 23)` prevents the client from inserting invalid schedule data.

### Vulnerability Scanning
Regularly run `npm audit` to check for compromised third-party dependencies. Update libraries proactively.

---

## Performance and Scalability

Peak Hub is designed to feel instantaneous.

### Caching and State
- **Server State Cache**: `TanStack React Query` handles caching API responses. If a user navigates between the Dashboard and the Tasks page, React Query serves the data from memory instantly while verifying it in the background, preventing unnecessary loading spinners.
- **Optimistic Updates**: When mutating data (e.g., checking off a task), the UI updates immediately before the database confirms the write. This hides network latency.

### Scalability Strategy
- **Frontend**: The static SPA architecture scales infinitely via Edge CDNs (Vercel).
- **Backend**: Supabase runs on AWS infrastructure.
  - **Connection Pooling**: Supabase uses PgBouncer to manage database connections, preventing the Postgres instance from being overwhelmed by many idle WebSocket connections.
  - **Realtime**: The Realtime service (built on Elixir/Phoenix) handles workspace chat scaling seamlessly.

### Known Bottlenecks
- **Timetable Drag-and-Drop**: Emitting a database `UPDATE` on every mouse movement during a drag operation will instantly rate-limit the client and overwhelm the DB. 
  - *Mitigation*: The `useWeeklyTimetableStore` debounces sync operations. Local state updates instantly at 60fps, but the DB is only synced when the drag operation completes or after a 500ms pause.
