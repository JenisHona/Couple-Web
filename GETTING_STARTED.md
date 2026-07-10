# Couple's Love Story Website - Getting Started

## What's Built

A beautiful, private website just for you and your girlfriend with:

✨ **Features:**
- **Blog** - Share thoughts and moments together
- **Photo Gallery** - Organize and favorite photos
- **Bucket List** - Track dreams and goals as a couple
- **Love Letters** - Send private messages to each other
- **Memory Timeline** - Visual journey of your relationship
- **Anniversary Tracker** - Never forget important dates

🎨 **Design:**
- Cute pinkish luxury theme with rose gold accents
- Fully responsive (mobile, tablet, desktop)
- Smooth animations and elegant UI
- Secure authentication with JWT

## Quick Start (No Database)

The app works immediately with **demo mode**:

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Run the development server:**
   ```bash
   pnpm dev
   ```

3. **Open in browser:**
   - Go to http://localhost:3000
   - Login with: `username: couple` / `password: lovestory123`
   - Explore all features!

That's it! Everything works locally without needing a database.

## Setup with Neon PostgreSQL (Optional)

For persistent data storage, connect a Neon database:

### Step 1: Create Neon Project
1. Go to https://console.neon.tech
2. Create a new project
3. Copy your connection string (looks like `postgresql://...`)

### Step 2: Configure Database URL
1. In v0, click Settings (top right)
2. Go to Vars section
3. Add variable `DATABASE_URL` with your Neon connection string

### Step 3: Initialize Database
1. Run the SQL schema:
   ```bash
   # Copy the SQL from scripts/init-db.sql
   # Execute it in your Neon dashboard SQL editor
   ```

That's it! Your database is now connected and all data will persist.

## Demo Credentials

Default login (works without database):
- **Username:** couple
- **Password:** lovestory123

## File Structure

```
app/
├── page.tsx           # Login page
├── api/
│   └── auth/         # Authentication endpoints
└── dashboard/        # All feature pages
    ├── blog/
    ├── gallery/
    ├── bucket-list/
    ├── love-letters/
    ├── timeline/
    └── anniversaries/

lib/
├── auth.ts           # Auth utilities (JWT, bcrypt)
├── auth-context.tsx  # React auth state
└── db.ts            # Database connection

scripts/
└── init-db.sql      # Database schema
```

## Future Feature Ideas

Check out `FEATURE_IDEAS_DETAILED.md` for 12+ ideas including:
- Couple Profile & Stats
- Gratitude Journal
- Couple Quiz/Love Questions
- Wishlist & Gift Ideas
- Date Ideas Generator
- Mood Tracker
- Video Messages
- Anniversary Book Export

## Troubleshooting

**Login not working?**
- Make sure you're using `couple` / `lovestory123`
- Clear browser cache and cookies
- Try in an incognito window

**Database connection issues?**
- Double-check your `DATABASE_URL` is correct
- Make sure the SQL schema was executed
- Check Neon dashboard for connection status

**Need help?**
- All pages are in `/app/dashboard` - customize freely
- Styling uses Tailwind CSS + shadcn/ui components
- API routes are in `/app/api` - extend with your own endpoints

---

**Made with ❤️ for you two. Have fun creating memories!**
