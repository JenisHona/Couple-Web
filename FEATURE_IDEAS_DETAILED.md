# Detailed Feature Ideas & Implementation Guide

## Top Recommended Features to Add

### 1. Couple Profile Page
**Why**: Creates a home base for your relationship with a beautiful summary
**Effort**: Low (1-2 hours)
**Implementation**:
```tsx
// app/dashboard/profile/page.tsx
- Display relationship start date
- Show "Together for X days"
- Couple photo upload
- Shared bio/story
- Edit mode for both users
```
**Database Changes**: Add `CoupleProfile` model (already in schema)

---

### 2. Gratitude Journal
**Why**: Daily practice strengthens your bond and reminds you what you love
**Effort**: Medium (2-3 hours)
**Implementation**:
```tsx
// app/dashboard/gratitude/page.tsx
- Date picker for entries
- One entry per day limit
- Beautiful card layout
- Monthly/yearly view
- Search by keyword
```
**Database Model**:
```typescript
GratitudeEntry {
  id: ObjectId
  author: UserId
  content: string
  date: Date
  createdAt: Date
  updatedAt: Date
}
```
**API Routes**:
- `POST /api/gratitude` - Create entry
- `GET /api/gratitude` - List entries
- `GET /api/gratitude?month=2024-03` - Monthly view

---

### 3. Couple Quiz / Love Questions
**Why**: Fun way to learn more about each other and track growth
**Effort**: Medium (2-4 hours)
**Implementation**:
```tsx
// app/dashboard/quiz/page.tsx
- Pre-loaded romantic questions
- Answer together or separately
- Compare answers side-by-side
- Track how answers change over time
- Share results
```
**Questions Database**:
```typescript
PreloadedQuestion {
  id: ObjectId
  category: 'fun' | 'serious' | 'romantic' | 'dreams'
  question: string
  createdAt: Date
}

QuizResponse {
  id: ObjectId
  userId: UserId
  questionId: ObjectId
  answer: string
  respondedAt: Date
  sharedWith: 'partner' | 'private'
}
```

---

### 4. Wishlist / Gift Ideas
**Why**: Never forget thoughtful gift ideas and track purchase history
**Effort**: Low (1-2 hours)
**Implementation**:
```tsx
// app/dashboard/wishlist/page.tsx
- Add gift ideas with descriptions
- Link to product (optional URL)
- Price range
- Priority level
- Mark as purchased with date
- View purchase history
```
**Model**:
```typescript
WishlistItem {
  id: ObjectId
  userId: UserId
  title: string
  description: string
  productUrl?: string
  price?: number
  category: string
  priority: 'low' | 'medium' | 'high'
  isPurchased: boolean
  purchasedDate?: Date
  purchasedBy?: UserId
  createdAt: Date
}
```

---

### 5. Date Ideas Generator
**Why**: Combat the "what should we do?" paralysis
**Effort**: Medium (2-3 hours)
**Implementation**:
```tsx
// app/dashboard/date-ideas/page.tsx
- Filter by budget: free, budget, standard, splurge
- Filter by season/weather
- Filter by type: outdoor, indoor, dining, adventure
- "Spin" for random idea
- Save favorites
- Mark as "done" with date
```
**Features**:
- Pre-seeded 50+ date ideas
- User can add custom ideas
- Favorites system
- History of completed dates

---

### 6. Milestone Tracker
**Why**: Celebrate relationship achievements automatically
**Effort**: Low (1-2 hours)
**Implementation**:
```tsx
// Add to dashboard or separate page
- Auto-calculate milestones from relationship start date
- Display: 1 month, 6 months, 1 year, 2 years, etc.
- Show "Coming up next" milestone
- Special badge/animation for current milestone
- Option to add custom milestones
```
**Calculation**:
```typescript
function calculateMilestones(startDate: Date) {
  const milestones = [30, 180, 365, 730, 1095, 1825];
  return milestones.map(days => ({
    label: `${Math.floor(days/365)} year${days > 365 ? 's' : ''}`,
    daysUntil: Math.ceil((startDate.getTime() + days * 86400000 - Date.now()) / 86400000)
  }));
}
```

---

### 7. Mood Tracker
**Why**: Simple way to track emotional connection and patterns
**Effort**: Low (1-2 hours)
**Implementation**:
```tsx
// app/dashboard/mood/page.tsx
- Daily mood 1-5 scale with emojis
- Optional note
- Calendar view showing mood history
- Share mood with partner or keep private
- Month/year statistics
```
**Model**:
```typescript
MoodEntry {
  id: ObjectId
  userId: UserId
  mood: 1 | 2 | 3 | 4 | 5
  note?: string
  isShared: boolean
  date: Date
  createdAt: Date
}
```

---

### 8. Video Messages
**Why**: Add intimacy with recorded messages
**Effort**: High (4-6 hours)
**Implementation**:
```tsx
// app/dashboard/video-messages/page.tsx
- Use browser MediaRecorder API
- Record, preview, send
- Store on Vercel Blob
- Play back with date/time
```
**Key Libraries**:
```json
{
  "@vercel/blob": "^0.16.0"
}
```
**Implementation Steps**:
1. Create recording UI with MediaRecorder
2. Convert to blob
3. Upload to Vercel Blob storage
4. Store URL in MongoDB
5. Display in gallery

---

### 9. Email Reminders
**Why**: Never forget an anniversary or important date
**Effort**: Medium (2-3 hours)
**Implementation**:
- Use Nodemailer or SendGrid
- Cron job to check upcoming dates
- Send email 1 day before
- Beautiful HTML email templates
```bash
npm install nodemailer
# or
npm install @sendgrid/mail
```

---

### 10. Export & Archive
**Why**: Preserve memories as backup or create anniversary books
**Effort**: Medium (2-3 hours)
**Implementation**:
```tsx
// Add to settings or profile page
- Export all data as JSON
- Generate PDF yearbook
- Create ZIP of photos
- Scheduled backups
```
**Libraries**:
```json
{
  "jspdf": "^2.5.1",
  "html2canvas": "^1.4.1",
  "jszip": "^3.10.1"
}
```

---

## Implementation Priority Roadmap

### Phase 1 (Week 1-2) - Core Features
1. Couple Profile Page ✓
2. Gratitude Journal
3. Mood Tracker

### Phase 2 (Week 3-4) - Engagement Features
4. Couple Quiz / Love Questions
5. Wishlist
6. Milestone Tracker

### Phase 3 (Month 2) - Fun Features
7. Date Ideas Generator
8. Love Quotes Collection
9. Playlist Integration

### Phase 4 (Month 3) - Advanced Features
10. Video Messages
11. Email Reminders
12. Export & Archive

---

## Quick Code Examples

### Adding a New Feature Checklist

1. **Create the Model** in `/lib/models.ts`:
```typescript
const newFeatureSchema = new Schema<INewFeature>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const NewFeature = mongoose.models.NewFeature || 
  mongoose.model<INewFeature>('NewFeature', newFeatureSchema);
```

2. **Create API Routes** in `/app/api/new-feature/route.ts`:
```typescript
export async function GET(request: NextRequest) {
  await connectDB();
  const items = await NewFeature.find().lean();
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const payload = verifyToken(token);
  // Create new item with userId
}
```

3. **Create UI Page** in `/app/dashboard/new-feature/page.tsx`:
```typescript
'use client';
import { DashboardLayout } from '@/components/dashboard-layout';

export default function NewFeaturePage() {
  return (
    <DashboardLayout title="Feature Title">
      {/* Your feature UI */}
    </DashboardLayout>
  );
}
```

4. **Add Navigation** in `/components/dashboard-layout.tsx`:
```typescript
const navItems = [
  // ... existing items
  { label: 'New Feature', icon: IconName, href: '/dashboard/new-feature' },
];
```

---

## Spotify Integration Example (Bonus)

```typescript
// app/api/spotify/auth/route.ts
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_URL}/api/spotify/callback`;

export async function GET() {
  const scopes = ['playlist-modify-public', 'playlist-modify-private'];
  const authUrl = new URL('https://accounts.spotify.com/authorize');
  
  authUrl.searchParams.append('client_id', CLIENT_ID);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.append('scope', scopes.join(' '));
  
  return NextResponse.redirect(authUrl);
}
```

---

## Performance Tips

- **Pagination**: Implement for Blog and Gallery when > 100 items
- **Lazy Loading**: Load images only when visible
- **Caching**: Use SWR for frequently accessed data
- **Indexes**: Add MongoDB indexes on frequently queried fields
- **CDN**: Store images on Vercel Blob (auto-CDN)

Happy building!
