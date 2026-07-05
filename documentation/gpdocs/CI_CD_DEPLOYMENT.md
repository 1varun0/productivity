# CI/CD, Deployment, and Operations

This document outlines the deployment pipeline and operational environment for Peak Hub.

## Environments
Peak Hub operates on two primary environments:
- **Development (Local)**: Vite dev server targeting a local or dedicated dev Supabase instance.
- **Production**: Static files hosted on Vercel/Netlify, communicating with the production Supabase project.

## Deployment Strategy (Frontend)

The frontend is a static Single Page Application (SPA). Deployment is fully automated via continuous deployment platforms (e.g., Vercel).

**Deployment Steps (Automated):**
1. Developer opens a PR to the `main` branch.
2. Vercel automatically detects the PR and provisions a temporary Preview Environment.
3. Reviewers check the Preview URL.
4. Upon merging to `main`, Vercel triggers a production build (`npm run build`).
5. The resulting `dist/` directory is deployed to the edge CDN.

**Rollback Strategy:**
Because Vercel maintains immutable deployments, rolling back is instantaneous. If a bad release hits `main`, navigate to the Vercel dashboard and click "Promote to Production" on the previous successful deployment.

## Deployment Strategy (Backend)

Backend updates (Database schema changes, Edge Functions) require more careful orchestration as they involve state.

**Database Migrations:**
1. Schema changes should be tracked using the Supabase CLI (`supabase migration new ...`).
2. These `.sql` files are committed to Git.
3. Upon deploying to production, migrations are applied using a CI/CD pipeline (e.g., GitHub Actions running `supabase db push`) or manually via the CLI if the pipeline is not yet configured.

**Edge Functions:**
Edge functions are deployed via the Supabase CLI.
```bash
supabase functions deploy send-project-invite --project-ref <prod-ref>
```

## Monitoring and Logging

Because Peak Hub relies heavily on managed services, monitoring focuses on those platforms:

- **Frontend Errors (Sentry / Vercel Analytics)**: Tracks JavaScript exceptions, React render crashes, and Web Vitals (LCP, FID).
- **Backend Metrics (Supabase Dashboard)**: 
  - **Database Health**: Monitor Postgres CPU, RAM, and disk IOPS to ensure queries (especially Timetable and Workspace real-time lookups) aren't bottlenecking.
  - **API Requests**: Monitor PostgREST API request volume and HTTP 5xx error rates.
  - **Realtime Connections**: Track concurrent WebSocket connections to ensure the quota is not exceeded.
- **Edge Function Logs**: Supabase provides an integrated log viewer for Edge Functions to monitor email dispatch failures (e.g., Resend API timeouts).

## Runbook: Database Connection Failures
**Alert**: High volume of HTTP 500s or timeout errors from the frontend.
**Procedure**:
1. Check the Supabase Status Page (`status.supabase.com`) for platform-wide outages.
2. Check the Supabase Dashboard > Database > Health. If CPU is at 100%, a recent migration may have dropped an index, causing full table scans.
3. Run `SELECT * FROM pg_stat_activity` to identify long-running or deadlocked queries.
4. If on the Free Tier, check if the project has been paused due to 7 days of inactivity. Click "Restore" if necessary.
