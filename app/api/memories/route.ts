import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getCoupleUserIds } from '@/lib/auth';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ memories: [] });
    }

    const coupleIds = await getCoupleUserIds(user.userId);

    const result: any = await executeQuery(
      `SELECT id, user_id, title, description, image_url, location, memory_date, is_favorite, created_at, updated_at
       FROM memories
       WHERE user_id = ANY($1::int[])
       ORDER BY memory_date DESC`,
      [coupleIds]
    );

    return NextResponse.json({ memories: result || [] });
  } catch (error) {
    console.error('Memories fetch error:', error);
    return NextResponse.json({ memories: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, imageUrl, location, memoryDate, isFavorite } = await request.json();

    if (!title?.trim() || !memoryDate) {
      return NextResponse.json({ error: 'Title and memory date are required' }, { status: 400 });
    }

    const result: any = await executeQuery(
      `INSERT INTO memories (user_id, title, description, image_url, location, memory_date, is_favorite)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, title, description, image_url, location, memory_date, is_favorite, created_at, updated_at`,
      [
        Number(user.userId),
        title.trim(),
        description?.trim() || null,
        imageUrl?.trim() || null,
        location?.trim() || null,
        memoryDate,
        isFavorite || false
      ]
    );

    return NextResponse.json({ memory: result[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Memory create error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create memory' }, { status: 500 });
  }
}
