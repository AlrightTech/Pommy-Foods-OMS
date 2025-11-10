# Deployment Troubleshooting Guide

## Issue: URL Keeps Loading / Deployment Not Working

### Common Causes and Solutions

#### 1. Build Failing Silently
**Symptoms**: Deployment appears to complete but URL keeps loading

**Solution**:
1. Check Vercel deployment logs:
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on the latest deployment
   - Check "Build Logs" for errors

2. Common build issues:
   - Missing environment variables (DATABASE_URL, NEXTAUTH_SECRET)
   - Prisma generation failing
   - TypeScript errors
   - Missing dependencies

#### 2. Environment Variables Not Set
**Symptoms**: App loads but API calls fail, authentication doesn't work

**Required Variables**:
```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-app.vercel.app
```

**How to Set**:
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add each variable for "Production" environment
3. Redeploy after adding variables

#### 3. NextAuth Configuration Issues
**Symptoms**: Infinite loading on homepage, authentication not working

**Solution**:
1. Verify `NEXTAUTH_URL` matches your exact deployment URL (no trailing slash)
2. Verify `NEXTAUTH_SECRET` is set (32+ characters)
3. Check that `trustHost: true` is set in `lib/auth.ts`

#### 4. Database Connection Issues
**Symptoms**: API endpoints return 500 errors, database queries fail

**Solution**:
1. Verify `DATABASE_URL` is correct
2. Check Supabase project is active
3. Verify IP restrictions allow Vercel IPs
4. Test connection: `npm run db:check-env`

#### 5. Build Timeout
**Symptoms**: Build takes too long and times out

**Solution**:
1. Optimize build:
   - Remove unused dependencies
   - Check for large files in public/
   - Optimize images

2. Increase build timeout (Vercel Pro plan)

#### 6. Infinite Loading on Homepage
**Symptoms**: Homepage shows loading spinner indefinitely

**Possible Causes**:
- NextAuth session check failing
- Missing NEXTAUTH_URL
- API routes not responding

**Solution**:
1. Check browser console for errors
2. Check Network tab for failed requests
3. Verify `/api/auth/providers` endpoint works
4. Check that middleware allows `/api/auth` routes

## Step-by-Step Debugging

### Step 1: Check Deployment Status
1. Go to Vercel Dashboard
2. Check latest deployment status
3. If "Building" - wait for completion
4. If "Error" - check build logs
5. If "Ready" - check function logs

### Step 2: Test Health Endpoint
```bash
curl https://your-app.vercel.app/api/health
```
Should return: `{"status":"ok","message":"Pommy Foods API is running"}`

### Step 3: Test NextAuth Endpoint
```bash
curl https://your-app.vercel.app/api/auth/providers
```
Should return available providers (Credentials)

### Step 4: Check Browser Console
1. Open deployed URL
2. Open DevTools (F12)
3. Check Console tab for errors
4. Check Network tab for failed requests

### Step 5: Check Function Logs
1. Go to Vercel Dashboard → Your Project → Functions
2. Check for runtime errors
3. Look for timeout errors
4. Check memory usage

## Quick Fixes

### Fix 1: Force Redeploy
1. Go to Vercel Dashboard → Deployments
2. Click "..." on latest deployment
3. Select "Redeploy"

### Fix 2: Clear Build Cache
1. Go to Vercel Dashboard → Project Settings → General
2. Scroll to "Build & Development Settings"
3. Click "Clear Build Cache"
4. Redeploy

### Fix 3: Check Environment Variables
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Verify all required variables are set
3. Check they're set for "Production" environment
4. Redeploy after changes

### Fix 4: Verify Build Locally
```bash
# Test build locally
npm run build

# If build fails, fix errors before deploying
```

## Common Error Messages

### "Module not found"
- Missing dependency in package.json
- Run `npm install` and redeploy

### "Cannot find module '@prisma/client'"
- Prisma client not generated
- Check `postinstall` script includes `prisma generate`

### "Environment variable not found"
- Variable not set in Vercel
- Add to Environment Variables and redeploy

### "Database connection failed"
- DATABASE_URL incorrect
- Database not accessible from Vercel IPs
- Check Supabase connection settings

### "NextAuth configuration error"
- NEXTAUTH_URL not set or incorrect
- NEXTAUTH_SECRET not set
- Check auth configuration

## Prevention Checklist

Before deploying:
- [ ] All environment variables set in Vercel
- [ ] Build succeeds locally (`npm run build`)
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Database migrations ready
- [ ] NEXTAUTH_URL matches deployment URL exactly
- [ ] NEXTAUTH_SECRET is 32+ characters
- [ ] DATABASE_URL is correct and accessible

## Getting Help

If issues persist:
1. Check Vercel deployment logs
2. Check browser console errors
3. Test API endpoints directly
4. Verify environment variables
5. Check Vercel status page for outages

## Useful Commands

```bash
# Test build locally
npm run build

# Check environment variables
npm run db:check-env

# Generate Prisma client
npm run db:generate

# Test database connection
npm run db:push
```

