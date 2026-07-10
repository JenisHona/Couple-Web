# Quick Start Guide - 5 Minutes to Launch

## The 5-Minute Setup

### 1. Install (1 min)
```bash
pnpm install
```

### 2. Configure (2 min)
Create `.env.local` in the root directory:

**For Local Testing (Easiest)**:
```
MONGODB_URI=mongodb://localhost:27017/couples-journal
JWT_SECRET=lovestory-secret-key
```

**For Production (MongoDB Atlas)**:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/couples-journal?retryWrites=true&w=majority
JWT_SECRET=your-random-32-char-key-here
```

### 3. Seed Database (1 min)
```bash
pnpm install -g tsx
tsx scripts/seed.js
```

Output:
```
✅ Created users:
   - couple (couple@lovestory.com)
   - partner (partner@lovestory.com)

📝 Login with username: "couple" and password: "lovestory123"
```

### 4. Start Server (1 min)
```bash
pnpm dev
```

### 5. Login & Explore
Visit `http://localhost:3000` and login with:
- Username: **couple**
- Password: **lovestory123**

---

## First Things To Do

1. **Explore the Dashboard**
   - See all 6 features
   - Check out the design theme

2. **Write a Blog Post**
   - Go to Blog page
   - Click "New Post"
   - Write something romantic

3. **Add a Photo**
   - Go to Gallery
   - Click "Add Photo"
   - Use any image URL (e.g., from Unsplash)

4. **Create a Memory**
   - Go to Timeline
   - Add your first memory together
   - Set a date and location

5. **Add an Anniversary**
   - Go to Anniversaries
   - Add your relationship start date
   - Set a reminder

---

## Next: Add More Features

Pick one from the list and add it. Here's how:

### Want Gratitude Journal?
**Time**: 1-2 hours
**Guide**: See `FEATURE_IDEAS_DETAILED.md` → Section 2

### Want Couple Profile?
**Time**: 1 hour
**Guide**: See `FEATURE_IDEAS_DETAILED.md` → Section 1

### Want Love Questions Quiz?
**Time**: 2-3 hours
**Guide**: See `FEATURE_IDEAS_DETAILED.md` → Section 3

---

## Deploy to Production (10 minutes)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Our couple's website"
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select your GitHub repo
4. Add environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas URL
   - `JWT_SECRET`: A strong random key

That's it! Your site is live!

---

## Customize Look & Feel

### Change Colors (5 min)
Edit `/app/globals.css`, lines 7-20:
```css
--primary: oklch(0.65 0.21 343);    /* Change this! */
--accent: oklch(0.75 0.18 355);
```

Visit [oklch.elukai.net](https://oklch.elukai.net) to pick colors.

### Change Site Name (2 min)
1. Edit `/app/layout.tsx` - metadata title
2. Edit `/components/dashboard-layout.tsx` - brand name
3. Edit `/app/page.tsx` - hero text

### Change Demo Credentials (2 min)
1. Edit `/scripts/seed.js`
2. Run: `tsx scripts/seed.js`

---

## Common Issues & Fixes

### "MongoDB connection failed"
- Make sure MongoDB is running locally, OR
- Check your MongoDB Atlas connection string

### "Can't login"
- Database not seeded? Run: `tsx scripts/seed.js`
- Wrong username/password? Use: couple / lovestory123

### "Port 3000 already in use"
- Use different port: `pnpm dev -p 3001`

### "Module not found errors"
- Run `pnpm install` again
- Clear `.next` folder: `rm -rf .next`

---

## File Organization Guide

```
app/
  ├── page.tsx           → Login page
  ├── layout.tsx         → Root layout (edit metadata here)
  ├── globals.css        → Theme colors (edit these!)
  └── dashboard/         → All features
       ├── page.tsx      → Dashboard main
       ├── blog/
       ├── gallery/
       ├── bucket-list/
       ├── love-letters/
       ├── timeline/
       └── anniversaries/

lib/
  ├── auth.ts           → Login logic
  ├── models.ts         → Database schemas
  ├── db.ts             → MongoDB connection
  └── auth-context.tsx  → React auth state

components/
  ├── dashboard-layout.tsx → Shared nav & layout
  └── ui/                  → Pre-built components
```

---

## Key Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm start                  # Run production build

# Database
tsx scripts/seed.js         # Initialize database
# (add more scripts as needed)

# Code Quality
pnpm lint                   # Check for errors
```

---

## Learning Path

1. **Understand the Structure** (10 min)
   - Read `PROJECT_SUMMARY.md`
   - Explore the `/app` folder

2. **Customize Design** (15 min)
   - Change colors in `globals.css`
   - Modify site name in `layout.tsx`

3. **Add First Feature** (30-60 min)
   - Pick one from `FEATURE_IDEAS_DETAILED.md`
   - Follow the implementation guide
   - Test it out

4. **Deploy** (10 min)
   - Push to GitHub
   - Connect to Vercel
   - Go live!

---

## Useful Resources

- **Next.js Docs**: https://nextjs.org/docs
- **MongoDB Docs**: https://docs.mongodb.com
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Color Picker**: https://oklch.elukai.net

---

## Support

- **Setup Issues?** See `SETUP_AND_FEATURES.md`
- **Feature Ideas?** See `FEATURE_IDEAS_DETAILED.md`
- **Design Help?** See `FEATURES_OVERVIEW.txt`
- **Need More?** See `PROJECT_SUMMARY.md`

---

## You're Ready!

Everything is set up and ready to go. Start using it now and add features as you go!

Happy building your love story! 💕

---

**Pro Tip**: Keep a list of feature ideas you want to add. When you're ready for the next feature, pick one and follow the templates in the feature guide.
