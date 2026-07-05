# Setup and Onboarding Guide

Welcome to Peak Hub! This guide will get you running the application locally in minutes.

## Prerequisites
- Node.js (v20+ recommended)
- npm (v10+ recommended)
- Git
- A Supabase Account (Free tier is sufficient)

## 1. Cloning and Setup
Clone the repository and install the dependencies.

```bash
git clone <your-repo-url>
cd productivity
npm install
```

## 2. Supabase Backend Setup
Because Peak Hub relies entirely on Supabase for the backend, you must configure a project.

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the Supabase Dashboard, navigate to **Project Settings > API**.
3. Copy your **Project URL** and **anon `public` API key**.

## 3. Environment Variables
Create a `.env.local` file in the root directory (this file is ignored by Git to protect your secrets).

```env
# .env.local
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
*Note: Never commit your `.env.local` file. It contains secrets specific to your environment.*

## 4. Database Initialization
You need to apply the schema to your Supabase instance.
*(If you are using the Supabase CLI locally, run `supabase db push`. Otherwise, execute the provided SQL scripts from the `gdocs/DATABASE.md` into your Supabase SQL Editor).*

**Critical Step:** Ensure Row Level Security (RLS) is enabled on all tables in the dashboard, or the application will not function correctly.

## 5. Build and Run
Start the Vite development server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser. The application should load. Create an account to begin testing.

## Local Edge Function Testing (Optional)
If you are developing the workspace invitation feature, you will need to run the Supabase Edge Functions locally.

1. Install the Supabase CLI.
2. Login: `supabase login`
3. Link your project: `supabase link --project-ref your-project-ref`
4. Create a `.env.local` inside the `supabase/` directory with a mock `APP_URL` and your email provider API key.
5. Serve the functions locally:
   ```bash
   supabase functions serve --env-file ./supabase/.env.local
   ```

## Troubleshooting Onboarding
- **App loads to a blank screen or throws console errors:** Verify your `.env.local` variable names match exactly (`VITE_SUPABASE_URL`). Vite requires the `VITE_` prefix to expose them to the client.
- **Can't create tasks or save data:** Check that RLS policies are applied in your Supabase database. If RLS is enabled but policies are missing, all requests will be rejected.
