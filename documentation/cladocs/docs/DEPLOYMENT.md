# Deployment Guide

Deploying Peak Hub involves two separate processes: deploying the static frontend (React SPA) and configuring the backend infrastructure (Supabase).

---

## 1. Deploying the Frontend (Vercel / Netlify)

Because Peak Hub is a Vite SPA, it can be hosted on any static file host. Vercel is recommended for the smoothest experience.

**Steps for Vercel:**
1. Push your code to a GitHub repository.
2. Log in to Vercel and click "Add New Project".
3. Import your GitHub repository.
4. Vercel should automatically detect that it's a Vite project. Confirm the following settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Environment Variables**: Add your Supabase credentials:
   - `VITE_SUPABASE_URL`: (Your production Supabase URL)
   - `VITE_SUPABASE_ANON_KEY`: (Your production Supabase anon key)
6. Click **Deploy**.

*Note on Routing:* Vercel handles SPA routing automatically for Vite projects. If using Netlify, you may need to add a `_redirects` file in the `public` folder containing `/* /index.html 200` to prevent 404s on page refresh.

---

## 2. Setting up Supabase for Production

Do not use your local development Supabase project for production data. Create a new, dedicated production project in the Supabase Dashboard.

### A. Database Schema and RLS
1. Ensure all your local migrations are applied to the production database.
2. **Critical Checklist**:
   - Go to the Authentication settings and disable "Allow unverified email signups" if you require email verification.
   - Go to Database > Tables and ensure **RLS is enabled** on ALL 28 tables. Without this, your production data is publicly readable/writable.

### B. Authentication URLs
1. In the Supabase Dashboard, go to **Authentication > URL Configuration**.
2. Set the **Site URL** to your frontend's production URL (e.g., `https://peakhub.app`).
3. Add any necessary **Redirect URLs** (e.g., `https://peakhub.app/**`).

---

## 3. Deploying Edge Functions

If you are using the workspace invitation feature, you must deploy the `send-project-invite` edge function to your production Supabase project.

1. Ensure the Supabase CLI is installed and you are logged in (`supabase login`).
2. Link your local project to your production Supabase instance:
   ```bash
   supabase link --project-ref your-production-project-ref
   ```
3. Set the required secrets for the edge function:
   ```bash
   supabase secrets set RESEND_API_KEY=your_resend_api_key
   supabase secrets set APP_URL=https://peakhub.app
   ```
4. Deploy the function:
   ```bash
   supabase functions deploy send-project-invite
   ```

---

## 4. SMTP / Email Setup for Production

Supabase provides a default SMTP server for sending auth emails (magic links, confirmations), but it is heavily rate-limited and intended ONLY for development. **You must set up a custom SMTP server for production.**

1. Create an account with Resend, Mailtrap, SendGrid, or AWS SES.
2. Verify your domain with the email provider.
3. In the Supabase Dashboard, go to **Project Settings > Email**.
4. Enable **Custom SMTP**.
5. Enter the SMTP host, port, username, and password provided by your email service.
6. Send a test email to ensure configuration is correct.

---

## 5. Go-Live Pre-Flight Checklist

- [ ] Frontend deployed and accessible via custom domain.
- [ ] `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in the frontend host.
- [ ] Supabase Site URL is updated to the production domain.
- [ ] Custom SMTP is configured in Supabase.
- [ ] RLS is enabled on all tables in production.
- [ ] Edge functions deployed and secrets (`APP_URL`) set.
- [ ] Tested a full sign-up, login, and workspace invite flow on the live domain.
