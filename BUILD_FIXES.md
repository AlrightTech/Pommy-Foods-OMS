# Build Fixes - Complete Solution

## Issues Fixed

### 1. Environment Variable Loading
**Problem**: `DATABASE_URL` not found when running `npm run db:seed`

**Solution**: 
- Installed `dotenv` package
- Updated `prisma/seed.ts` to automatically load `.env.local` and `.env` files
- Environment variables now load before Prisma Client initialization

### 2. Seed Script Enhancement
**Changes**:
- Added automatic environment variable loading in seed script
- Created `scripts/check-env.js` to validate environment variables
- Added `db:check-env` script to verify environment setup

## Files Modified

1. **`prisma/seed.ts`**
   - Added `dotenv` import and configuration
   - Automatically loads `.env.local` and `.env` files

2. **`package.json`**
   - Installed `dotenv` and `@dotenvx/dotenvx` as dev dependencies
   - Added `db:check-env` script

3. **`scripts/check-env.js`** (new)
   - Utility script to check if required environment variables are set
   - Provides helpful error messages if variables are missing

## Usage

### Check Environment Variables
```bash
npm run db:check-env
```

### Seed Database
```bash
# Make sure .env.local exists with DATABASE_URL
npm run db:seed
```

### Build Project
```bash
npm run build
```

## Environment Variables Required

Create `.env.local` file with:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/pommy_foods"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_PASSWORD="admin123"  # Optional
SYSTEM_USER_PASSWORD="system-password-change-me"  # Optional
```

## Verification Steps

1. ✅ Check environment variables: `npm run db:check-env`
2. ✅ Generate Prisma client: `npm run db:generate`
3. ✅ Push database schema: `npm run db:push`
4. ✅ Seed database: `npm run db:seed`
5. ✅ Build project: `npm run build`

## Notes

- `.env.local` takes priority over `.env`
- Next.js automatically loads `.env.local` for `next dev` and `next build`
- Seed script now explicitly loads environment variables for standalone execution
- All environment variables are validated before database operations

## Troubleshooting

### Still getting "DATABASE_URL not found"?
1. Verify `.env.local` exists in project root
2. Check that `DATABASE_URL` is set (no typos)
3. Run `npm run db:check-env` to verify
4. Restart terminal/IDE after creating `.env.local`

### Build fails?
1. Ensure all environment variables are set
2. Run `npm run db:generate` first
3. Check that database is accessible
4. Verify connection string format

