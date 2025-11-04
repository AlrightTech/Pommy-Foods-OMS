# CI/CD Pipeline Setup Guide

This guide explains how to set up and use the CI/CD pipeline for deploying Pommy Foods to Vercel.

## Overview

The CI/CD pipeline includes:
- **CI Pipeline**: Runs on every push and PR (linting, type checking, build verification)
- **Deploy Pipeline**: Automatically deploys to Vercel production on push to `main`
- **Preview Deployments**: Creates preview deployments for pull requests
- **Database Migrations**: Manual workflow for running database migrations

## Prerequisites

1. **GitHub Repository**: Your code must be in a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Vercel Project**: Create a project in Vercel dashboard

## Step 1: Set Up Vercel Project

### 1.1 Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js configuration

### 1.2 Get Vercel Credentials

1. Go to [Vercel Settings → Tokens](https://vercel.com/account/tokens)
2. Create a new token with full access
3. Copy the token (you'll need it for GitHub secrets)

4. Get your Organization ID and Project ID:
   - Go to your project settings
   - Organization ID: Found in the URL or project settings
   - Project ID: Found in project settings → General

## Step 2: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

### Required Secrets

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `VERCEL_TOKEN` | Vercel API token | Create at [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel Organization ID | Found in project settings |
| `VERCEL_PROJECT_ID` | Vercel Project ID | Found in project settings → General |
| `DATABASE_URL` | Supabase connection string | From Supabase dashboard |
| `NEXTAUTH_SECRET` | NextAuth secret key | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your production URL | Your Vercel app URL (e.g., `https://your-app.vercel.app`) |

### Optional Secrets (for seeding)

- `ADMIN_PASSWORD` - Admin user password for seeding
- `SYSTEM_USER_PASSWORD` - System user password for seeding

## Step 3: Configure Vercel Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

Add the same environment variables as GitHub secrets:

1. `DATABASE_URL` - Your Supabase connection string
2. `NEXTAUTH_SECRET` - Your NextAuth secret
3. `NEXTAUTH_URL` - Your app URL (Vercel auto-sets this, but you can override)
4. `ADMIN_PASSWORD` (optional)
5. `SYSTEM_USER_PASSWORD` (optional)

**Apply to**: Production, Preview, and Development

## Step 4: Push Code to GitHub

```bash
# Initialize git if not already done
git init

# Add remote
git remote add origin https://github.com/your-username/your-repo.git

# Add all files
git add .

# Commit
git commit -m "Initial commit: CI/CD setup"

# Push to main branch
git push -u origin main
```

## Step 5: Verify CI/CD Pipeline

### 5.1 Check CI Pipeline

After pushing, go to:
- GitHub → Your Repo → Actions tab
- You should see the "CI Pipeline" workflow running
- It will run:
  - ✅ Lint check
  - ✅ Type check
  - ✅ Build verification

### 5.2 Check Deployment

1. Go to GitHub → Actions
2. Look for "Deploy to Vercel" workflow
3. It should automatically deploy to production

### 5.3 Check Preview Deployments

1. Create a pull request
2. The "Deploy Preview to Vercel" workflow will run
3. A preview URL will be commented on the PR

## Step 6: Run Initial Database Migration

### Option 1: Via Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run migrations
npm run db:migrate:deploy
```

### Option 2: Via GitHub Actions

1. Go to GitHub → Actions
2. Click "Database Migration" workflow
3. Click "Run workflow"
4. Select environment: `production`
5. Click "Run workflow"

### Option 3: Via Supabase Dashboard

1. Go to Supabase Dashboard → SQL Editor
2. Run the migration SQL manually (from `prisma/migrations`)

## Step 7: Seed Initial Data

After migrations are complete:

```bash
# Pull environment variables
vercel env pull .env.local

# Run seed script
npm run db:seed
```

Or set `ADMIN_PASSWORD` and `SYSTEM_USER_PASSWORD` in Vercel environment variables and run via GitHub Actions.

## Workflow Details

### CI Pipeline (`ci.yml`)

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

**Jobs:**
1. **Lint**: Runs ESLint to check code quality
2. **Type Check**: Runs TypeScript compiler to verify types
3. **Build**: Verifies the application builds successfully

### Deploy Pipeline (`deploy.yml`)

**Triggers:**
- Push to `main` branch
- Manual trigger via workflow_dispatch

**Jobs:**
1. Builds the application
2. Deploys to Vercel production
3. Includes database migration reminder

### Preview Deployments (`deploy-preview.yml`)

**Triggers:**
- Pull requests to `main` or `develop`

**Jobs:**
1. Creates a preview deployment
2. Comments on PR with preview URL

### Database Migrations (`database-migration.yml`)

**Triggers:**
- Manual trigger only (workflow_dispatch)

**Jobs:**
1. Pulls environment variables from Vercel
2. Generates Prisma client
3. Runs database migrations

## Branch Strategy

### Main Branch
- Production deployments
- Protected branch (recommended)
- Requires pull requests for changes

### Develop Branch
- Development/staging deployments
- Preview deployments for PRs

### Feature Branches
- Preview deployments via PRs
- No automatic production deployment

## Monitoring Deployments

### Vercel Dashboard
- View deployments at: `https://vercel.com/your-project/deployments`
- See build logs and deployment status
- Monitor deployment metrics

### GitHub Actions
- View workflow runs at: `https://github.com/your-repo/actions`
- See detailed logs for each step
- Debug failed deployments

## Troubleshooting

### Build Fails in CI

**Issue**: Build passes locally but fails in CI

**Solutions:**
1. Check environment variables are set in GitHub secrets
2. Verify `DATABASE_URL` is accessible from GitHub Actions
3. Check Node.js version matches (should be 20)
4. Review build logs for specific errors

### Deployment Fails

**Issue**: Deployment workflow fails

**Solutions:**
1. Verify `VERCEL_TOKEN` is correct and has proper permissions
2. Check `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are correct
3. Ensure project is linked correctly in Vercel
4. Check Vercel project settings

### Database Migration Fails

**Issue**: Migration workflow fails

**Solutions:**
1. Verify `DATABASE_URL` is correct in secrets
2. Check database is accessible
3. Ensure Prisma schema is up to date
4. Review migration files for errors

### Preview Deployment Not Working

**Issue**: Preview deployments not created for PRs

**Solutions:**
1. Check workflow file is in `.github/workflows/`
2. Verify branch name matches workflow trigger
3. Check GitHub Actions permissions
4. Review workflow logs

## Best Practices

1. **Always test locally first**: Run `npm run lint`, `npm run build` before pushing
2. **Use feature branches**: Create PRs for review before merging to main
3. **Monitor deployments**: Check Vercel dashboard after each deployment
4. **Run migrations carefully**: Test migrations in preview/staging first
5. **Keep secrets secure**: Never commit secrets to repository
6. **Review PR previews**: Always test preview deployments before merging

## Security Considerations

- ✅ Secrets are stored securely in GitHub Secrets
- ✅ Environment variables are not exposed in logs
- ✅ Database credentials are encrypted
- ✅ Vercel tokens have limited scope
- ⚠️ Never commit `.env.local` files
- ⚠️ Rotate tokens periodically
- ⚠️ Use different passwords for production vs development

## Next Steps

1. ✅ Set up GitHub repository
2. ✅ Configure Vercel project
3. ✅ Add GitHub secrets
4. ✅ Configure Vercel environment variables
5. ✅ Push code to trigger first deployment
6. ✅ Run initial database migration
7. ✅ Seed initial data
8. ✅ Test production deployment
9. ✅ Set up branch protection rules (recommended)

## Support

For issues:
- Check GitHub Actions logs
- Check Vercel deployment logs
- Review error messages
- Consult Vercel documentation: https://vercel.com/docs

---

**Last Updated**: Ready for deployment
**Status**: ✅ CI/CD Pipeline configured

