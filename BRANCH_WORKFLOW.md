# Branch Workflow Guide

## Branches Overview

- **`development`**: Your working branch. Uses **localStorage** for data storage (no Supabase needed)
- **`production`**: Deployment branch. Uses **Supabase** for cloud storage and authentication
- **`main`**: Original branch (can be used as backup)

## How It Works

The app automatically detects the environment:
- **Development mode** (`npm run dev`): Uses localStorage with profile system
- **Production mode** (`npm run build`): Uses Supabase with real authentication

## Development Workflow

### Working on Features (Development Branch)

1. **Switch to development branch:**
   ```bash
   git checkout development
   ```

2. **Start dev server:**
   ```bash
   npm run dev
   ```

3. **Work on your changes:**
   - All data is stored in localStorage
   - No Supabase connection needed
   - Password is optional in dev mode (just use email)
   - You'll see "🔧 Dev Mode (localStorage)" badge in the header

4. **Test your changes:**
   - Make changes, test locally
   - Data persists in your browser's localStorage

5. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Your commit message"
   ```

### Deploying to Production

1. **Switch to production branch:**
   ```bash
   git checkout production
   ```

2. **Merge development into production:**
   ```bash
   git merge development
   ```

3. **Build and test production:**
   ```bash
   npm run build
   npm run preview  # Test the production build locally
   ```

4. **Push to GitHub:**
   ```bash
   git push origin production
   ```

5. **Update GitHub Pages to deploy from production branch:**
   - Go to your repo Settings → Pages
   - Change source branch to `production`
   - The GitHub Actions workflow will deploy automatically

## Important Notes

### Environment Variables

- **Development**: No `.env` file needed (uses localStorage)
- **Production**: Requires `.env` file with Supabase credentials (already set up)

### Authentication

- **Development**: 
  - Email acts as profile name
  - Password is optional
  - Creates local profiles in localStorage
  
- **Production**:
  - Real email/password authentication
  - Data stored in Supabase
  - Syncs across all devices

### Data Storage

- **Development**: `localStorage` (browser only, no sync)
- **Production**: Supabase (cloud storage, syncs across devices)

## Quick Commands

```bash
# Switch to development
git checkout development
npm run dev

# Switch to production and deploy
git checkout production
git merge development
git push origin production

# View all branches
git branch

# See what branch you're on
git branch --show-current
```

## Current Setup

- ✅ Development branch created
- ✅ Production branch created  
- ✅ Storage adapter switches automatically
- ✅ Auth component works in both modes
- ✅ GitHub Actions workflow ready for production

## Next Steps

1. Work on `development` branch for all your changes
2. Test thoroughly in dev mode
3. Merge to `production` when ready to deploy
4. Production will automatically use Supabase

