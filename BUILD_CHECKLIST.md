# Production Build Checklist

## Pre-Deployment Checklist

### ✅ Configuration Files
- [x] `.env.example` created with all required variables
- [x] `vercel.json` configured for deployment
- [x] `.gitignore` properly configured
- [x] `next.config.js` optimized for production
- [x] `package.json` scripts updated with Prisma generation

### ✅ Database Configuration
- [x] Prisma schema configured for PostgreSQL (Supabase)
- [x] Database seed script created (`prisma/seed.ts`)
- [x] Migration scripts ready (`db:migrate`, `db:migrate:deploy`)
- [x] Postinstall hook configured for Prisma client generation

### ✅ Authentication & Security
- [x] NextAuth.js configured with secret
- [x] Session management configured (JWT, 30 days)
- [x] Middleware updated for route protection
- [x] Environment variables documented

### ✅ Code Quality
- [x] All ESLint errors fixed
- [x] All TypeScript errors resolved
- [x] All imports validated
- [x] Missing components checked (DollarSign, Separator, etc.)

### ✅ Build Configuration
- [x] Build command includes Prisma generation
- [x] Postinstall script configured
- [x] Production optimizations enabled (SWC minify, console removal)
- [x] Image optimization configured

### ✅ Documentation
- [x] `README.md` created with setup instructions
- [x] `DEPLOYMENT.md` created with deployment guide
- [x] Environment variables documented
- [x] Default credentials documented

## Deployment Steps

### 1. Supabase Setup
```bash
# 1. Create Supabase project
# 2. Get connection string
# 3. Run migrations (locally or via Vercel)
npm run db:migrate:deploy

# 4. Seed initial data
npm run db:seed
```

### 2. Vercel Deployment
```bash
# 1. Push code to GitHub
git push origin main

# 2. Import project in Vercel
# 3. Add environment variables:
#    - DATABASE_URL
#    - NEXTAUTH_SECRET
#    - NEXTAUTH_URL (auto-set by Vercel)
#    - ADMIN_PASSWORD (optional)

# 4. Deploy (automatic on push)
```

### 3. Post-Deployment
- [ ] Verify health check endpoint: `/api/health`
- [ ] Test login with admin credentials
- [ ] Change default admin password
- [ ] Verify database connection
- [ ] Test order creation flow
- [ ] Verify all API endpoints work

## Environment Variables Required

### Production (Vercel)
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
NEXTAUTH_SECRET=[32+ character secret]
NEXTAUTH_URL=https://your-app.vercel.app
ADMIN_PASSWORD=[secure password]
SYSTEM_USER_PASSWORD=[secure password]
```

## Build Verification

Run locally to verify:
```bash
# Generate Prisma client
npm run db:generate

# Run linter
npm run lint

# Build production
npm run build

# Should complete without errors
```

## Known Issues / Notes

1. **Database Migrations**: Run `db:migrate:deploy` in production (not `db:migrate`)
2. **NextAuth Secret**: Must be at least 32 characters
3. **Admin Password**: Change immediately after first deployment
4. **Connection Pooling**: Use Supabase connection pooler for better performance
5. **Build Time**: First build may take longer due to Prisma generation

## Troubleshooting

### Build Fails: Prisma Client
- Ensure `postinstall` script includes `prisma generate`
- Check that `DATABASE_URL` is set during build

### Database Connection Errors
- Verify connection string format
- Check Supabase project is active
- Ensure IP restrictions allow Vercel IPs

### NextAuth Errors
- Verify `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches deployment URL
- Check middleware configuration

## Success Criteria

✅ Build completes without errors
✅ No ESLint warnings
✅ All environment variables set
✅ Database migrations run successfully
✅ Health check endpoint responds
✅ Login works with admin credentials
✅ Can create/view orders
✅ API endpoints accessible

---

**Last Verified**: Ready for deployment
**Status**: ✅ All checks passed

