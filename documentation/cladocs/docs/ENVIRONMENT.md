# Environment Variables

Peak Hub requires environment variables to connect the frontend to the Supabase backend. Because this is a Vite application, variables exposed to the browser must be prefixed with `VITE_`.

## Required Variables

These must be present for the application to function locally and in production.

### `VITE_SUPABASE_URL`
- **What it is**: The root URL of your Supabase project API.
- **Where to get it**: Supabase Dashboard > Project Settings > API > Project URL.
- **Example**: `https://abcdefghijklmnopqr.supabase.co`
- **Required?**: Yes. The Supabase client will fail to initialize without it.

### `VITE_SUPABASE_ANON_KEY`
- **What it is**: The public, publishable API key used to make requests to Supabase.
- **Where to get it**: Supabase Dashboard > Project Settings > API > Project API Keys > `anon` `public`.
- **Example**: `eyJhbGciOiJIUzI1NiIsInR...`
- **Required?**: Yes.
- **Security Note**: It is *safe* to expose this key in the browser. Supabase secures your data using Row Level Security (RLS) policies on the database itself, not by hiding this key.

## Edge Function Variables (Production Only)

These variables are NOT added to the frontend `.env` file. They are added securely to your Supabase project via the Supabase CLI or Dashboard, and are only accessible by Edge Functions.

### `RESEND_API_KEY`
- **What it is**: API key for the Resend email service (used to send workspace invites).
- **Where to get it**: resend.com dashboard.
- **Required?**: Only if using the workspace invite feature in production.

### `APP_URL`
- **What it is**: The production URL where your frontend is hosted.
- **Where to get it**: Your hosting provider (e.g., `https://peakhub.app`).
- **Why it's needed**: The edge function uses this to generate clickable invite links (e.g., `https://peakhub.app/invite/TOKEN`) in the emails it sends.
- **Required?**: Only if using the workspace invite feature in production.

---

## Example `.env.local`

Create this file in the root directory `c:\projects\productivity\` for local development:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://viwvcevvhxwxkywknvqq.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_-LzBAChNHv__VxHm3COzFg_od3q1wU5
```
*(Note: Replace the example values above with your actual project credentials before deploying.)*
