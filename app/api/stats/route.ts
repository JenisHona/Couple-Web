import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getCoupleUserIds } from '@/lib/auth';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    let coupleIds: number[] = [];
    if (user) {
      coupleIds = await getCoupleUserIds(user.userId);
    }

    const [
      postsCount,
      lettersCount,
      bucketCount,
      completedBucketCount,
      memoriesCount,
      photosCount,
      upcomingAnniversaries,
      profileResult
    ]: any = await Promise.all([
      coupleIds.length > 0 
        ? executeQuery('SELECT COUNT(*)::int as count FROM blog_posts WHERE user_id = ANY($1::int[])', [coupleIds])
        : executeQuery('SELECT COUNT(*)::int as count FROM blog_posts'),
      coupleIds.length > 0
        ? executeQuery('SELECT COUNT(*)::int as count FROM love_letters WHERE from_user_id = ANY($1::int[]) OR to_user_id = ANY($1::int[])', [coupleIds])
        : executeQuery('SELECT COUNT(*)::int as count FROM love_letters'),
      coupleIds.length > 0
        ? executeQuery('SELECT COUNT(*)::int as count FROM bucket_list_items WHERE user_id = ANY($1::int[])', [coupleIds])
        : executeQuery('SELECT COUNT(*)::int as count FROM bucket_list_items'),
      coupleIds.length > 0
        ? executeQuery('SELECT COUNT(*)::int as count FROM bucket_list_items WHERE completed = true AND user_id = ANY($1::int[])', [coupleIds])
        : executeQuery('SELECT COUNT(*)::int as count FROM bucket_list_items WHERE completed = true'),
      coupleIds.length > 0
        ? executeQuery('SELECT COUNT(*)::int as count FROM memories WHERE user_id = ANY($1::int[])', [coupleIds])
        : executeQuery('SELECT COUNT(*)::int as count FROM memories'),
      coupleIds.length > 0
        ? executeQuery('SELECT COUNT(*)::int as count FROM gallery_photos WHERE user_id = ANY($1::int[])', [coupleIds])
        : executeQuery('SELECT COUNT(*)::int as count FROM gallery_photos'),
      coupleIds.length > 0
        ? executeQuery('SELECT id, title, date, type FROM anniversaries WHERE user_id = ANY($1::int[]) ORDER BY date ASC LIMIT 4', [coupleIds])
        : executeQuery('SELECT id, title, date, type FROM anniversaries ORDER BY date ASC LIMIT 4'),
      executeQuery('SELECT * FROM couple_profile LIMIT 1'),
    ]);

    return NextResponse.json({
      stats: {
        posts: postsCount?.[0]?.count || 0,
        letters: lettersCount?.[0]?.count || 0,
        bucketTotal: bucketCount?.[0]?.count || 0,
        bucketCompleted: completedBucketCount?.[0]?.count || 0,
        memories: memoriesCount?.[0]?.count || 0,
        photos: photosCount?.[0]?.count || 0,
        upcomingEvents: upcomingAnniversaries || [],
        profile: profileResult?.[0] || null,
      }
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({
      stats: {
        posts: 0,
        letters: 0,
        bucketTotal: 0,
        bucketCompleted: 0,
        memories: 0,
        photos: 0,
        upcomingEvents: [],
        profile: null,
      }
    });
  }
}
