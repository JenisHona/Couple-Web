# Our Love Story - Couples Website

A beautiful, intimate web platform designed exclusively for you and your partner to share memories, dreams, and love in a secure, private space.

## Quick Start

### 1. Prerequisites
- Node.js 16+ installed
- MongoDB connection (cloud or local)
- pnpm package manager

### 2. Setup Instructions

```bash
# Install dependencies
pnpm install

# Set up environment variables
# Create a .env.local file in the root with:
MONGODB_URI=mongodb://localhost:27017/couples-journal
JWT_SECRET=your-super-secret-key-change-this

# For MongoDB Atlas (cloud):
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/couples-journal
```

### 3. Seed Database

```bash
# Run the seed script to create default users
pnpm install -g tsx
tsx scripts/seed.js

# This creates two users:
# Username: couple
# Password: lovestory123
```

### 4. Start Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` and login with the credentials above.

---

## Current Features

### Core Pages

1. **Dashboard** - Hub for all couple features with quick access cards
2. **Blog** - Share thoughts and moments together with rich text posts
3. **Gallery** - Collect and organize your favorite photos (with favorites)
4. **Bucket List** - Track dreams and goals with priority levels and categories
5. **Love Letters** - Send private, intimate messages to each other
6. **Timeline** - Visual journey of your relationship with dates and locations
7. **Anniversaries** - Track special dates with reminders and countdowns

### Current Theme
- **Color Palette**: Pink, Rose, and Blush tones with rose gold accents
- **Typography**: Clean, elegant fonts with romantic aesthetic
- **Design**: Luxury feel with soft gradients and card-based layouts

---

## Recommended Feature Ideas to Add Next

### Tier 1 - High Impact, Medium Effort

1. **Couple Profile**
   - Shared profile with relationship start date
   - Combined photo for the couple
   - "About Us" bio visible when logging in
   - *Implementation*: Create `/dashboard/profile` page

2. **Gratitude Journal**
   - Daily gratitude entries (one entry per day limit)
   - Track what you appreciate about each other
   - View gratitude history by month/year
   - *Implementation*: Add `GratitudeEntry` model to MongoDB

3. **Favorite Memories Gallery**
   - Flag favorite photos from the gallery
   - Create a separate "Favorites" section
   - Heart animation when marking as favorite
   - *Implementation*: Already partially done in timeline

4. **Couple Quiz / Love Questions**
   - Pre-made romantic questions to answer together
   - Track answers over time to see how you've grown
   - Share scores or results
   - *Implementation*: Add `QuizResponse` model with timestamp tracking

### Tier 2 - Medium Impact, Lower Effort

5. **Wishlist/Gift Ideas**
   - Track gift ideas for each other
   - Link to products (Amazon, Etsy)
   - Mark as "purchased" with date
   - *Implementation*: Add `WishlistItem` model

6. **Date Ideas Generator**
   - Random date idea suggestions based on budget/season
   - Save favorite date ideas
   - Track which dates you've done
   - *Implementation*: Create `/dashboard/date-ideas` page

7. **Milestone Celebrations**
   - Mark relationship milestones (1 month, 6 months, 1 year, etc.)
   - Auto-calculate from relationship start date
   - Display with special badges
   - *Implementation*: Calculate dynamically on profile page

8. **Couple Playlist**
   - Spotify integration or link to shared playlists
   - Add "our songs" with memories
   - Play history with dates
   - *Implementation*: Store Spotify URLs or YouTube links

### Tier 3 - Fun Additions, Minimal Effort

9. **Couple Stats Dashboard**
   - Total days together
   - Blog posts written
   - Photos in gallery
   - Bucket list completion %
   - *Implementation*: Add stats component to main dashboard

10. **Mood/Feeling Tracker**
    - Daily mood tracking (1-5 scale with emoji)
    - View moods over time
    - Share with partner optionally
    - *Implementation*: Add `MoodEntry` model

11. **Love Quotes Collection**
    - Save romantic quotes
    - Add to favorites
    - Share on anniversaries
    - *Implementation*: Add `Quote` model

12. **Private Notes**
    - Quick personal thoughts not shared initially
    - Option to share later
    - Pin important notes
    - *Implementation*: Add `PrivateNote` model

### Tier 4 - Advanced Features

13. **Photo Uploads & Vercel Blob Integration**
    - Replace URL-based photos with direct uploads
    - Automatic compression and optimization
    - Gallery organization by date/album
    - *Implementation*: Use `@vercel/blob` package

14. **Video Messages**
    - Record short video messages
    - Store and play back
    - Add to timeline
    - *Implementation*: Use browser MediaRecorder API

15. **Notifications & Email Reminders**
    - Email reminders for anniversaries
    - Browser notifications for unread letters
    - Scheduled reminder for love letters
    - *Implementation*: Add Nodemailer or SendGrid integration

16. **Export & Archive**
    - Download all content as PDF or ZIP
    - Create anniversary books
    - Backup functionality
    - *Implementation*: Use `jspdf` and `jszip` libraries

---

## Architecture Overview

### Stack
- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Auth**: JWT with HTTP-only cookies
- **UI Components**: shadcn/ui

### Database Models
```
User - username, password, email, role
BlogPost - title, content, author, images, createdAt
LoveLetter - from, to, content, isRead, createdAt
BucketListItem - title, description, completed, priority, category
Anniversary - title, date, type, reminder
Memory - title, description, date, location, isFavorite, images
CoupleProfile - user1Id, user2Id, relationshipStartDate, bio, coupleImage
```

### Key Files
```
/lib/
  - auth.ts (JWT, password hashing)
  - auth-context.tsx (React context for auth state)
  - db.ts (MongoDB connection)
  - models.ts (Mongoose schemas)

/app/
  - /api/auth/ (login, logout, me endpoints)
  - /api/blog/ (CRUD operations)
  - /dashboard/ (all couple features)

/components/
  - dashboard-layout.tsx (shared navigation and layout)
```

---

## Customization Tips

### Colors
Edit `/app/globals.css` to change the theme:
```css
--primary: oklch(0.65 0.21 343); /* Rose/Pink */
--accent: oklch(0.75 0.18 355);  /* Lighter Pink */
```

### Adding New Features
1. Create API routes in `/app/api/[feature]/route.ts`
2. Add MongoDB models in `/lib/models.ts`
3. Create UI page in `/app/dashboard/[feature]/page.tsx`
4. Add navigation link in `DashboardLayout` component

### Database Scaling
For production:
- Use MongoDB Atlas (cloud)
- Add indexes to frequently queried fields
- Implement pagination for large datasets
- Add rate limiting on API routes

---

## Future Deployment

### Deploy to Vercel
```bash
# Push to GitHub first
git add .
git commit -m "Initial commit"
git push origin main

# Then connect to Vercel and set env variables:
# MONGODB_URI
# JWT_SECRET
```

### Production Checklist
- [ ] Change JWT_SECRET to a strong random value
- [ ] Use MongoDB Atlas connection string
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS only
- [ ] Add proper error logging
- [ ] Set up database backups
- [ ] Add rate limiting
- [ ] Implement CSRF protection

---

## Support & Notes

- All data is private and stored securely
- Default theme is optimized for romantic aesthetic
- Empty states guide you to add content
- Mobile responsive design for all devices
- Dark mode ready (can be added via next-themes)

Enjoy your private space together!
