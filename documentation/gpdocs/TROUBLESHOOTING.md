# Troubleshooting & Runbook

This guide contains common issues and operational procedures for Peak Hub.

## Common Issues and Fixes

### 1. Data Not Loading (Silent Failures)
**Symptom**: The UI loads but lists (tasks, projects) are empty, even though you know data exists. No errors in the console.
**Cause**: Row Level Security (RLS) is rejecting the query. Supabase returns `200 OK` with an empty array `[]` when RLS filters out all rows, rather than throwing a `403 Forbidden`.
**Fix**: Verify your `auth.uid()` matches the `user_id` on the records you are trying to query. Check the specific table's RLS policies in the Supabase Dashboard.

### 2. Workspace Chat Not Updating Live
**Symptom**: Chat messages require a manual page refresh to appear.
**Cause**: Supabase Realtime is not enabled for the `project_messages` table.
**Fix**: Go to Supabase Dashboard > Database > Replication > Source: `supabase_realtime` and toggle on `project_messages`.

### 3. Edge Function Fails to Send Email
**Symptom**: Inviting a workspace member fails silently.
**Cause**: Missing secrets in the Edge Function environment.
**Fix**: Run `supabase secrets set RESEND_API_KEY=your_key` and `supabase secrets set APP_URL=https://yourdomain.com`.

### 4. Application Pauses (Free Tier)
**Symptom**: API calls timeout entirely.
**Cause**: Supabase pauses free-tier projects after 7 days of inactivity to save resources.
**Fix**: Log into the Supabase Dashboard and click "Restore Project". 

---

## Operational Runbook

### Incident: Database Connection Spikes / High Latency
1. **Acknowledge Alert**: Check Supabase Dashboard > Database > Health metrics.
2. **Diagnose**: Look at CPU usage. If it's near 100%, check for missing indexes causing sequential scans. Run `SELECT * FROM pg_stat_activity` in the SQL editor to find long-running queries.
3. **Mitigate**: If a specific query is deadlocked, terminate the backend PID. If traffic is legitimately high, consider upgrading the compute size in Supabase.

### Incident: Bad Deployment (Frontend)
1. **Acknowledge**: Users report UI crashes on a new release.
2. **Mitigate**: Go to the Vercel (or hosting provider) dashboard. Select the previous successful deployment and click "Promote to Production" or "Rollback". This takes < 5 seconds.
3. **Diagnose**: Pull the commit locally, reproduce the error, and fix.

### Incident: Accidental Data Deletion
1. **Acknowledge**: A user or bug wiped out critical workspace data.
2. **Mitigate**: Supabase performs daily automated backups (on Pro tiers). Go to Database > Backups. Select a Point-in-Time Recovery (PITR) or daily snapshot to restore. *Warning: Restoration causes temporary downtime.*
