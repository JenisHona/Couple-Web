import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getCoupleUserIds } from '@/lib/auth';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ photos: [] });
    }

    const coupleIds = await getCoupleUserIds(user.userId);

    const result: any = await executeQuery(
      `SELECT id, user_id, image_url, title, description, category, is_favorite, created_at, updated_at
       FROM gallery_photos
       WHERE user_id = ANY($1::int[])
       ORDER BY created_at DESC`,
      [coupleIds]
    );

    return NextResponse.json({ photos: result || [] });
  } catch (error) {
    console.error('Gallery fetch error:', error);
    return NextResponse.json({ photos: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, imageUrl, description, category, isFavorite } = await request.json();

    if (!imageUrl?.trim()) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const result: any = await executeQuery(
      `INSERT INTO gallery_photos (user_id, image_url, title, description, category, is_favorite)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, image_url, title, description, category, is_favorite, created_at, updated_at`,
      [
        Number(user.userId),
        imageUrl.trim(),
        title?.trim() || 'Our Memory',
        description?.trim() || null,
        category || 'Moments',
        isFavorite || false
      ]
    );

    return NextResponse.json({ photo: result[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Gallery create error:', error);
    return NextResponse.json({ error: error.message || 'Failed to add photo' }, { status: 500 });
  }
}
