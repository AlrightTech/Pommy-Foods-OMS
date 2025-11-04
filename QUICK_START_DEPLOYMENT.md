# Quick Start: Deploy to Vercel with CI/CD

This is a quick guide to get your Pommy Foods application deployed on Vercel with automated CI/CD.

## Prerequisites Checklist

- [ ] GitHub repository created
- [ ] Vercel account created
- [ ] Supabase project created
- [ ] Supabase database password obtained

## Step 1: Set Up Supabase (5 minutes)

1. Go to [Supabase](https://supabase.com) and create a project
2. Copy your **Connection String** from Settings → Database
3. Save it - you'll need it for Vercel

## Step 2: Set Up Vercel Project (5 minutes)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Click "Import" (don't configure yet)

## Step 3: Get Vercel Credentials (2 minutes)

1. Go to [Vercel Tokens](https://vercel.com/account/tokens)
2. Create token → Copy token
3. In your project settings, note:
   - **Organization ID** (from URL or settings)
   - **Project ID** (from General settings)

## Step 4: Configure GitHub Secrets (3 minutes)

Go to: **GitHub Repo → Settings → Secrets and variables → Actions**

Add these secrets:

```
VERCEL_TOKEN = [your-vercel-token]
VERCEL_ORG_ID = [your-org-id]
VERCEL_PROJECT_ID = [your-project-id]
DATABASE_URL = [supabase-connection-string]
NEXTAUTH_SECRET = [generate with: openssl rand -base64 32]
NEXTAUTH_URL = https://your-app.vercel.app
```

## Step 5: Configure Vercel Environment Variables (3 minutes)

Go to: **Vercel Project → Settings → Environment Variables**

Add the same variables (except VERCEL_* tokens):
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `ADMIN_PASSWORD` (optional)
- `SYSTEM_USER_PASSWORD` (optional)

**Apply to**: Production, Preview, Development

## Step 6: Push Code to GitHub (2 minutes)

```bash
git add .
git commit -m "Setup CI/CD pipeline"
git push origin main
```

## Step 7: Verify Deployment (1 minute)

1. Go to **GitHub → Actions** tab
2. Watch the workflows run
3. Go to **Vercel Dashboard** → See your deployment

## Step 8: Run Database Migration (5 minutes)

### Option A: Via Vercel CLI (Recommended)

```bash
npm install -g vercel
vercel login
vercel link
vercel env pull .env.local
npm run db:migrate:deploy
```

### Option B: Via GitHub Actions

1. Go to **GitHub → Actions**
2. Click **"Database Migration"** workflow
3. Click **"Run workflow"**
4. Select environment: `production`
5. Click **"Run workflow"**

## Step 9: Seed Initial Data (2 minutes)

```bash
vercel env pull .env.local
npm run db:seed
```

Or set `ADMIN_PASSWORD` in Vercel and run seed manually.

## Step 10: Test Your Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Test health endpoint: `https://your-app.vercel.app/api/health`
3. Login with: `admin@pommyfoods.com` / `admin123` (or your `ADMIN_PASSWORD`)

## What Happens Next?

### Automatic Deployments

✅ **Push to `main`** → Auto-deploys to production  
✅ **Create PR** → Auto-creates preview deployment  
✅ **Every push** → Runs CI (lint, type-check, build)

### Manual Actions

- **Database migrations**: Run via GitHub Actions workflow
- **Preview deployments**: Created automatically for PRs
- **Production deployments**: Automatic on merge to main

## Troubleshooting

### "Build failed"
- Check environment variables are set in Vercel
- Verify `DATABASE_URL` is correct
- Check GitHub Actions logs

### "Deployment failed"
- Verify `VERCEL_TOKEN` is correct
- Check `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`
- Review Vercel deployment logs

### "Database connection failed"
- Verify Supabase project is active
- Check connection string format
- Ensure IP restrictions allow Vercel IPs

## Need More Details?

- **Full CI/CD Setup**: See [CICD_SETUP.md](./CICD_SETUP.md)
- **Deployment Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Environment Setup**: See [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)

## Quick Commands Reference

```bash
# Generate NextAuth secret
openssl rand -base64 32

# Pull Vercel env vars locally
vercel env pull .env.local

# Run migrations
npm run db:migrate:deploy

# Seed database
npm run db:seed

# Build locally
npm run build

# Test locally
npm run dev
```

---

**Total Setup Time**: ~20 minutes  
**Status**: ✅ Ready to deploy

