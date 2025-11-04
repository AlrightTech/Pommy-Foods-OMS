# Deployment Guide - Pommy Foods

This guide covers deploying Pommy Foods to **Supabase** (database) and **Vercel** (hosting) with **CI/CD automation**.

> **📚 For CI/CD Pipeline Setup**: See [CICD_SETUP.md](./CICD_SETUP.md) for detailed CI/CD configuration and automation.

## Prerequisites

- Supabase account and project
- Vercel account
- GitHub repository (optional but recommended)

## Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Note your project URL and service role key
3. Copy the **Connection String** from Settings > Database > Connection string > URI

### 1.2 Configure Database Connection

The connection string format for Supabase is:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

Or for direct connection (development):
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

### 1.3 Run Database Migrations

1. Set your `DATABASE_URL` environment variable locally
2. Run migrations:
   ```bash
   npm run db:migrate
   ```
3. Or push schema directly:
   ```bash
   npm run db:push
   ```

### 1.4 Seed Initial Data

```bash
npm run db:seed
```

This creates:
- Admin user: `admin@pommyfoods.com` (password: `admin123` or `ADMIN_PASSWORD` env var)
- System user for auto-generated orders
- Sample store and products

**⚠️ IMPORTANT**: Change the admin password immediately after first login!

## Step 2: Configure Environment Variables

### 2.1 Generate NextAuth Secret

Generate a secure secret for NextAuth:

```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

### 2.2 Required Environment Variables

Create these environment variables in Vercel:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Supabase PostgreSQL connection string | `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres` |
| `NEXTAUTH_SECRET` | Secret for NextAuth session encryption | Generated secret (32+ characters) |
| `NEXTAUTH_URL` | Your app URL (automatically set by Vercel) | `https://your-app.vercel.app` |
| `ADMIN_PASSWORD` | Initial admin password (optional, defaults to `admin123`) | Secure password |
| `SYSTEM_USER_PASSWORD` | System user password (optional) | Secure password |

### 2.3 Optional Environment Variables

Add these if you plan to use these features:

- **File Upload**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`
- **Email**: `SENDGRID_API_KEY` or `RESEND_API_KEY`
- **Payments**: `STRIPE_SECRET_KEY` or `PAYSTACK_SECRET_KEY`
- **Maps**: `GOOGLE_MAPS_API_KEY` or `MAPBOX_ACCESS_TOKEN`
- **Push Notifications**: `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`

## Step 3: Deploy to Vercel

### 3.1 Connect Repository (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Import project in Vercel
3. Vercel will detect Next.js automatically

### 3.2 Configure Build Settings

Vercel should auto-detect:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (includes Prisma generate)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install`

### 3.3 Add Environment Variables

In Vercel project settings:
1. Go to **Settings > Environment Variables**
2. Add all required variables (see Step 2.2)
3. Apply to: **Production**, **Preview**, and **Development**

### 3.4 Deploy

1. Push to your main branch (or trigger manually)
2. Vercel will:
   - Install dependencies
   - Run `postinstall` (generates Prisma client)
   - Build the application
   - Deploy

### 3.5 Post-Deployment Database Migration

If you haven't run migrations locally, add a build command or use Vercel CLI:

```bash
vercel env pull
npm run db:migrate:deploy
```

Or add to Vercel's build command:
```bash
prisma generate && prisma migrate deploy && next build
```

## Step 4: Configure Supabase for Production

### 4.1 Connection Pooling

Use Supabase's connection pooler for better performance:
- Go to Settings > Database > Connection Pooling
- Use the **Transaction** mode connection string (port 6543)

### 4.2 Row Level Security (Optional)

If needed, configure RLS policies in Supabase dashboard.

### 4.3 Database Backups

Enable automatic backups in Supabase dashboard (Settings > Database > Backups)

## Step 5: Verify Deployment

### 5.1 Health Check

Visit: `https://your-app.vercel.app/api/health`

Should return: `{ "status": "ok", "message": "Pommy Foods API is running" }`

### 5.2 Test Login

1. Go to `https://your-app.vercel.app/login`
2. Login with admin credentials
3. Verify dashboard loads correctly

### 5.3 Test Database Connection

Check that:
- Products can be created/listed
- Orders can be created
- Database operations work correctly

## Troubleshooting

### Build Fails: Prisma Client Not Generated

**Solution**: Ensure `postinstall` script runs:
```json
"postinstall": "prisma generate"
```

### Database Connection Errors

**Check**:
1. `DATABASE_URL` is correct
2. Supabase project is active
3. IP restrictions (if any) allow Vercel IPs
4. Connection pooler settings

### NextAuth Session Issues

**Solution**: Ensure `NEXTAUTH_SECRET` is set and `NEXTAUTH_URL` matches your domain

### Build Timeout

**Solution**: 
- Upgrade Vercel plan if needed
- Optimize build (check for large dependencies)
- Consider using Supabase's connection pooler

## Environment-Specific Configurations

### Production

```env
NEXTAUTH_URL=https://your-app.vercel.app
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
NEXTAUTH_SECRET=your-production-secret
```

### Preview/Staging

Use separate Supabase project or database for staging:
```env
NEXTAUTH_URL=https://your-app-git-branch.vercel.app
DATABASE_URL=postgresql://postgres:[STAGING-PASSWORD]@db.[STAGING-PROJECT].supabase.co:5432/postgres
NEXTAUTH_SECRET=your-staging-secret
```

## Monitoring & Maintenance

### Database Migrations

Always test migrations in staging first:
```bash
npm run db:migrate:deploy
```

### Performance Monitoring

- Monitor Supabase dashboard for database performance
- Use Vercel Analytics for app performance
- Set up error tracking (Sentry, etc.)

### Backup Strategy

1. Supabase automatic backups (daily)
2. Export database regularly:
   ```bash
   pg_dump $DATABASE_URL > backup.sql
   ```

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong `NEXTAUTH_SECRET`
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Review Supabase RLS policies
- [ ] Limit API rate limiting
- [ ] Monitor for suspicious activity
- [ ] Regular security updates
- [ ] Database connection string is secure (no public exposure)

## Next Steps

1. Set up custom domain (Vercel Settings > Domains)
2. Configure email notifications
3. Set up payment gateway (if needed)
4. Configure monitoring and alerts
5. Set up CI/CD pipeline
6. Document API endpoints
7. Train users

## Support

For issues:
- Check Vercel deployment logs
- Check Supabase logs
- Review application logs
- Test locally with production environment variables

---

**Last Updated**: 2024
**Version**: 1.0.0

