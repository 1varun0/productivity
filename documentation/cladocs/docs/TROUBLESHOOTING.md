# Troubleshooting Guide

This document covers common issues you might encounter while developing or deploying Peak Hub, and how to resolve them.

---

## 1. Data Not Loading / "Empty State" Everywhere

**Symptom**: The app loads, you are logged in, but tasks, habits, and projects are empty. Creating new items seems to succeed, but they disappear on refresh.
**Cause**: Row Level Security (RLS) conflicts.
**Fix**: 
1. Check the browser console. If you see Supabase returning `[]` with no error, RLS is silently filtering out the data.
2. Ensure your user ID in Supabase Auth matches the `user_id` column in your tables.
3. If you manually inserted data into Supabase via the dashboard, ensure you assigned the correct `user_id`.
4. Run `supabase db lint` (if using local CLI) or check the RLS policies in the dashboard to ensure `auth.uid() = user_id` is applied correctly.

---

## 2. Workspace Chat Realtime Not Working

**Symptom**: Messages are sent and saved to the database, but they do not appear on other users' screens without refreshing the page.
**Cause**: Realtime is not enabled for the `project_messages` table.
**Fix**:
1. Go to your Supabase Dashboard > Database > Replication.
2. Ensure that "Source" is set to `supabase_realtime`.
3. Toggle Realtime **ON** for the `project_messages` table. (By default, Supabase does not enable realtime for all tables to save resources).

---

## 3. Auth Redirect Issues (Magic Links Not Working)

**Symptom**: Clicking a magic link in an email opens the app, but you are not logged in, or you get redirected back to the login page.
**Cause**: Mismatched Site URL or Redirect URIs in Supabase settings.
**Fix**:
1. Go to Supabase Dashboard > Authentication > URL Configuration.
2. Ensure your **Site URL** matches exactly where you are testing (e.g., `http://localhost:5173` for dev, `https://peakhub.app` for production).
3. If testing locally on a different port, add `http://localhost:3000/**` to the **Redirect URLs** list.

---

## 4. Invite Emails Not Sending (Edge Function Errors)

**Symptom**: Inviting a user to a project fails silently or throws a 500 error in the console.
**Cause**: The `send-project-invite` edge function is failing, likely due to missing secrets or SMTP issues.
**Fix**:
1. Go to Supabase Dashboard > Edge Functions > `send-project-invite` > Logs.
2. If you see `Missing environment variable: APP_URL` or `RESEND_API_KEY`, you need to set them via the Supabase CLI:
   `supabase secrets set APP_URL=https://peakhub.app`
3. If testing locally, ensure you are serving the functions using `supabase functions serve --env-file ./supabase/.env.local`.

---

## 5. Auth Emails Going to Spam

**Symptom**: Signup confirmations or magic links are landing in user spam folders.
**Cause**: You are using the default Supabase SMTP server in production, which is heavily rate-limited and often flagged by spam filters.
**Fix**:
1. Set up a Custom SMTP provider (Resend, SendGrid, Mailgun).
2. Configure SPF, DKIM, and DMARC records on your domain's DNS settings to authenticate your outgoing mail.
3. Update the SMTP settings in Supabase Dashboard > Project Settings > Email.

---

## 6. Project Pausing (Supabase Free Tier)

**Symptom**: The application suddenly fails to connect to the database. Console shows connection timeouts.
**Cause**: Supabase pauses free-tier projects after 7 days of inactivity.
**Fix**:
1. Log in to the Supabase Dashboard.
2. Click "Restore Project". The restoration process typically takes 1-2 minutes.
3. *Prevention*: Make sure the app receives at least one API request per week, or upgrade to the Supabase Pro plan ($25/mo) to prevent automatic pausing.
