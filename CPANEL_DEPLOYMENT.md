# cPanel Deployment Guide

## ⚠️ Important Note

**Next.js requires Node.js to run**, which most traditional cPanel shared hosting plans **do not support**. 

### Options:
1. **Use Vercel/Netlify** (Recommended) - Free, built for Next.js
2. **Use a VPS with Node.js** (DigitalOcean, AWS, etc.)
3. **Check if your cPanel has Node.js support** (some hosts offer this)

---

## How to Find Your cPanel Deploy Path

### Method 1: Check File Manager
1. Log into cPanel
2. Go to **File Manager**
3. Look for one of these folders:
   - `public_html/` - Main domain root
   - `public_html/yourdomain.com/` - Subdomain or addon domain
   - `domains/yourdomain.com/public_html/` - Alternative structure

### Method 2: Check Home Directory
1. In cPanel, go to **File Manager**
2. Click **Settings** (top right)
3. Enable **Show Hidden Files**
4. Your home directory path is usually shown at the top
5. Common paths:
   - `/home/username/public_html/`
   - `/home/username/domains/yourdomain.com/public_html/`

### Method 3: Check via SSH (if available)
```bash
# SSH into your server
ssh username@yourdomain.com

# Check current directory
pwd

# List files
ls -la

# Look for public_html
ls -la public_html
```

### Method 4: Check Domain Settings
1. In cPanel, go to **Domains** or **Subdomains**
2. Check the **Document Root** path for your domain
3. This is your deployment path

---

## Checking if Your cPanel Supports Node.js

### Step 1: Check for Node.js Selector
1. Log into cPanel
2. Look for **Node.js** or **Node.js Selector** in the software section
3. If you see it, your host supports Node.js!

### Step 2: Check Node.js Version
1. Open **Node.js Selector**
2. Check available Node.js versions
3. You need **Node.js 18+** for Next.js 14

### Step 3: Check Application Manager
1. Look for **Application Manager** or **Setup Node.js App**
2. This allows you to create Node.js applications

---

## If Your cPanel HAS Node.js Support

### Deployment Steps:

#### 1. Build Your Application Locally
```bash
# Install dependencies
npm install

# Build for production
npm run build

# This creates a .next folder with optimized files
```

#### 2. Upload Files to cPanel

**Files to Upload:**
- `.next/` folder (entire folder)
- `public/` folder (if you have static files)
- `package.json`
- `package-lock.json`
- `node_modules/` (or install on server)
- `prisma/` folder
- `.env` file (create on server, don't upload from local)

**Files NOT to Upload:**
- `.git/` folder
- `node_modules/` (better to install on server)
- `.env.local` (create new `.env` on server)

#### 3. Create Node.js App in cPanel
1. Go to **Node.js Selector** or **Setup Node.js App**
2. Click **Create Application**
3. Configure:
   - **Node.js Version**: 18.x or 20.x
   - **Application Root**: `/home/username/your-app-name`
   - **Application URL**: Your domain or subdomain
   - **Application Startup File**: `server.js` (we'll create this)
   - **Application Mode**: Production

#### 4. Create server.js File
Create a `server.js` file in your app root:

```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
```

#### 5. Update package.json
Add a start script:

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

#### 6. Set Environment Variables
In cPanel Node.js app settings:
- Add `DATABASE_URL`
- Add `NEXTAUTH_SECRET`
- Add `NEXTAUTH_URL` (your domain URL)
- Add any other required variables

#### 7. Install Dependencies on Server
Via SSH or cPanel Terminal:
```bash
cd /home/username/your-app-name
npm install --production
npm run db:generate
```

#### 8. Run Database Migrations
```bash
npm run db:migrate:deploy
```

#### 9. Start the Application
In cPanel Node.js app:
1. Click **Restart** or **Start**
2. Check logs for errors

---

## If Your cPanel DOES NOT Support Node.js

### Option 1: Use Static Export (Limited Functionality)
⚠️ **Warning**: This will break API routes, authentication, and server-side features.

1. Update `next.config.js`:
```javascript
const nextConfig = {
  output: 'export',
  // ... rest of config
}
```

2. Build:
```bash
npm run build
```

3. Upload `out/` folder contents to `public_html/`

**Limitations:**
- No API routes
- No server-side rendering
- No authentication
- No database connections

### Option 2: Use Vercel (Recommended)
1. Push code to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy (automatic)

**Benefits:**
- Free tier available
- Built for Next.js
- Automatic deployments
- CDN included
- SSL certificates

### Option 3: Use a VPS
1. Get a VPS (DigitalOcean, AWS, etc.)
2. Install Node.js
3. Use PM2 to run the app
4. Set up Nginx as reverse proxy

---

## Troubleshooting

### Files Not Uploading
1. **Check file permissions**: Files should be 644, folders 755
2. **Check file size limits**: Some hosts limit upload size
3. **Use FTP/SFTP**: More reliable than File Manager for large files
4. **Compress and extract**: Upload as ZIP, extract on server

### Application Not Starting
1. Check Node.js version (need 18+)
2. Check logs in cPanel
3. Verify environment variables are set
4. Check if port is available
5. Verify `package.json` has correct start script

### Database Connection Issues
1. Verify `DATABASE_URL` is correct
2. Check if database host allows external connections
3. Verify database credentials
4. Check firewall settings

### 404 Errors
1. Verify files are in correct directory
2. Check `.htaccess` file (if using static export)
3. Verify Node.js app is running
4. Check application URL configuration

---

## Quick Checklist

- [ ] Verified cPanel has Node.js support
- [ ] Built application locally (`npm run build`)
- [ ] Uploaded all necessary files
- [ ] Created Node.js app in cPanel
- [ ] Set environment variables
- [ ] Installed dependencies on server
- [ ] Generated Prisma client
- [ ] Ran database migrations
- [ ] Started application
- [ ] Tested the application

---

## Recommended Hosting for Next.js

1. **Vercel** - Best for Next.js (free tier)
2. **Netlify** - Good alternative
3. **Railway** - Easy deployment
4. **Render** - Free tier available
5. **DigitalOcean App Platform** - Simple setup
6. **AWS Amplify** - Enterprise option

---

## Need Help?

If your cPanel doesn't support Node.js, I **strongly recommend using Vercel** instead. It's:
- Free for personal projects
- Optimized for Next.js
- Automatic deployments
- Better performance
- Easier to manage


