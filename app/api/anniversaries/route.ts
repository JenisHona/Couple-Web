import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getCoupleUserIds } from '@/lib/auth';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ anniversaries: [] });
    }

    const coupleIds = await getCoupleUserIds(user.userId);

    const result: any = await executeQuery(
      `SELECT id, user_id, title, description, date, type, reminder, created_at, updated_at
       FROM anniversaries
       WHERE user_id = ANY($1::int[])
       ORDER BY date ASC`,
      [coupleIds]
    );

    return NextResponse.json({ anniversaries: result || [] });
  } catch (error) {
    console.error('Anniversaries fetch error:', error);
    return NextResponse.json({ anniversaries: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, date, type, description, reminder } = await request.json();

    if (!title?.trim() || !date) {
      return NextResponse.json({ error: 'Title and date are required' }, { status: 400 });
    }

    const result: any = await executeQuery(
      `INSERT INTO anniversaries (user_id, title, description, date, type, reminder)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, title, description, date, type, reminder, created_at, updated_at`,
      [
        Number(user.userId),
        title.trim(),
        description?.trim() || null,
        date,
        type || 'anniversary',
        reminder !== undefined ? reminder : true
      ]
    );

    return NextResponse.json({ anniversary: result[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Anniversary create error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create anniversary' }, { status: 500 });
  }
}
