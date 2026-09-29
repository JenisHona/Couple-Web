import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getCoupleUserIds } from '@/lib/auth';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ items: [] });
    }

    const coupleIds = await getCoupleUserIds(user.userId);

    const result: any = await executeQuery(
      `SELECT id, user_id, title, description, category, priority, completed, 
              target_date, created_at, updated_at
       FROM bucket_list_items
       WHERE user_id = ANY($1::int[])
       ORDER BY created_at DESC`,
      [coupleIds]
    );

    return NextResponse.json({ items: result || [] });
  } catch (error) {
    console.error('Bucket list fetch error:', error);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, category, priority, targetDate } = await request.json();

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const result: any = await executeQuery(
      `INSERT INTO bucket_list_items (user_id, title, description, category, priority, completed, target_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, title, description, category, priority, completed, target_date, created_at, updated_at`,
      [
        Number(user.userId),
        title.trim(),
        description?.trim() || null,
        category || 'experiences',
        priority || 'medium',
        false,
        targetDate || null
      ]
    );

    return NextResponse.json({ item: result[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Bucket list create error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create bucket item' }, { status: 500 });
  }
}
