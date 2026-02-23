# Deployment Guide

This guide covers deploying the WB Bot application to free hosting platforms.

## Prerequisites

- GitHub account
- Database credentials (DB_URL and DB_TOKEN from your Turso/LibSQL provider)

## Option 1: Vercel (Recommended - Best Free Tier)

Vercel offers the best free tier for Next.js applications with:
- 100GB bandwidth/month
- Unlimited deployments
- Automatic SSL certificates
- Preview deployments for pull requests

### Steps:

1. **Push code to GitHub**
   ```bash
   git add -A
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with your GitHub account
   - Click "Add New..." → "Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   In Vercel dashboard, add these environment variables:
   - `DB_URL` - Your Turso/LibSQL database URL
   - `DB_TOKEN` - Your database authentication token

4. **Configure Build Settings** (usually auto-detected)
   - Framework Preset: Next.js
   - Build Command: `bun run build`
   - Output Directory: `.next`
   - Install Command: `bun install`

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be available at `https://your-project.vercel.app`

### Database Migrations on Vercel

The migrations run automatically during the build process. If you need to run migrations manually, you can use Vercel CLI:

```bash
vercel env pull .env.local
bun run db:migrate
```

## Option 2: Railway (Already Configured)

Railway offers a free tier with $5 credit monthly.

### Steps:

1. **Push code to GitHub** (same as above)

2. **Connect to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up/Login with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

3. **Configure Environment Variables**
   Add in Railway dashboard:
   - `DB_URL` - Your database URL
   - `DB_TOKEN` - Your database token

4. **Deploy**
   - Railway will automatically detect the `railway.toml` configuration
   - The deployment will run migrations and start the app

## Option 3: Render

Render offers a free tier for web services.

### Steps:

1. **Create `render.yaml`** (already configured via nixpacks)

2. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Sign up/Login with GitHub
   - Create a new Web Service
   - Connect your repository

3. **Configure Settings**
   - Environment: Node
   - Build Command: `bun install && bun run build`
   - Start Command: `bun run db:migrate && bun start`
   - Add environment variables: `DB_URL`, `DB_TOKEN`

4. **Deploy**
   - Click "Create Web Service"

## Option 4: Fly.io

Fly.io offers a free tier with limited resources.

### Steps:

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login and Deploy**
   ```bash
   fly auth login
   fly launch
   ```

3. **Set Environment Variables**
   ```bash
   fly secrets set DB_URL=your_database_url
   fly secrets set DB_TOKEN=your_database_token
   ```

## Environment Variables Summary

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_URL` | Turso/LibSQL database URL | Yes |
| `DB_TOKEN` | Database authentication token | Yes |

## Getting Free Database

If you need a free SQLite/Turso database:

1. **Turso** (Recommended)
   - Go to [turso.tech](https://turso.tech)
   - Sign up for free
   - Create a database
   - Get your `DB_URL` and `DB_TOKEN`

2. **LibSQL locally**
   - For development, the app can use a local SQLite file
   - Set `DB_URL=file:local.db` for local development

## Troubleshooting

### Build Fails
- Ensure all dependencies are in `package.json`
- Check that `bun.lock` is committed
- Verify TypeScript compiles: `bun typecheck`

### Database Connection Fails
- Verify `DB_URL` and `DB_TOKEN` are set correctly
- Check that the database allows connections from your hosting platform

### Migrations Fail
- Ensure migrations folder exists: `src/db/migrations/`
- Check database permissions

## Post-Deployment

After successful deployment:

1. Visit your app URL
2. Configure settings in the Settings page
3. Add your Wildberries API credentials
4. Create answer scenarios
5. Start the bot
