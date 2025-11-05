# Environment Variables Setup Guide

## Quick Setup

### Step 1: Create `.env.local` file

Create a `.env.local` file in the project root with the following variables:

```env
# Database Connection (Required)
DATABASE_URL="postgresql://postgres:password@localhost:5432/pommy_foods"

# NextAuth Configuration (Required)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Admin Password for seeding
ADMIN_PASSWORD="admin123"
SYSTEM_USER_PASSWORD="system-password-change-me"
```

### Step 2: Get Your Database URL

#### Option A: Local PostgreSQL
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/pommy_foods"
```

#### Option B: Supabase (Recommended for Production)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Database**
4. Copy the **Connection String** (URI format)

**For Production (Connection Pooling):**
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**For Development (Direct Connection):**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

### Step 3: Generate NextAuth Secret

#### On Windows (PowerShell):
```powershell
# Generate a random secret
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (New-Guid).ToString()))
```

#### On Mac/Linux:
```bash
openssl rand -base64 32
```

#### Online Generator:
Visit: https://generate-secret.vercel.app/32

### Step 4: Set Environment Variables

#### Windows PowerShell:
```powershell
# Set for current session
$env:DATABASE_URL="postgresql://postgres:password@localhost:5432/pommy_foods"
$env:NEXTAUTH_SECRET="your-generated-secret"
$env:NEXTAUTH_URL="http://localhost:3000"

# Or create .env.local file (recommended)
```

#### Mac/Linux:
```bash
# Set for current session
export DATABASE_URL="postgresql://postgres:password@localhost:5432/pommy_foods"
export NEXTAUTH_SECRET="your-generated-secret"
export NEXTAUTH_URL="http://localhost:3000"
```

### Step 5: Create `.env.local` File (Recommended)

Create a file named `.env.local` in the project root:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/pommy_foods"
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_PASSWORD="admin123"
SYSTEM_USER_PASSWORD="system-password-change-me"
```

**Note:** `.env.local` is already in `.gitignore` and won't be committed to git.

## Required Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:pass@localhost:5432/db` | ✅ Yes |
| `NEXTAUTH_SECRET` | Secret for session encryption | `generated-secret-32+chars` | ✅ Yes |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` | ✅ Yes |

## Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ADMIN_PASSWORD` | Initial admin password | `admin123` |
| `SYSTEM_USER_PASSWORD` | System user password | `system-password-change-me` |

## Verify Setup

After setting up environment variables, verify:

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (if database exists)
npm run db:migrate:deploy

# Or push schema directly (development)
npm run db:push

# Seed database
npm run db:seed
```

## Troubleshooting

### Error: "Environment variable not found: DATABASE_URL"

**Solution:**
1. Create `.env.local` file in project root
2. Add `DATABASE_URL` with your connection string
3. Restart your terminal/IDE
4. Try the command again

### Error: "Connection refused" or "Connection timeout"

**Solution:**
1. Verify database is running
2. Check connection string format
3. Verify username/password are correct
4. Check firewall/network settings
5. For Supabase: Ensure IP allowlist allows your IP

### Error: "Invalid DATABASE_URL"

**Solution:**
1. Ensure connection string is in quotes: `DATABASE_URL="postgresql://..."`
2. Check for special characters in password (may need URL encoding)
3. Verify PostgreSQL is accessible from your location

## Next Steps

1. ✅ Set up environment variables
2. ✅ Run database migrations: `npm run db:migrate:deploy`
3. ✅ Seed initial data: `npm run db:seed`
4. ✅ Start development server: `npm run dev`
