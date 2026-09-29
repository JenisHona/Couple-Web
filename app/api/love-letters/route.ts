import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getCoupleUserIds } from '@/lib/auth';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ letters: [] });
    }

    const coupleIds = await getCoupleUserIds(user.userId);

    const result: any = await executeQuery(
      `SELECT ll.id, ll.from_user_id, ll.to_user_id, ll.sender_name, ll.title, ll.content, 
              ll.is_read, ll.created_at, ll.updated_at,
              COALESCE(ll.sender_name, u.username, 'My Love') as sender
       FROM love_letters ll
       LEFT JOIN users u ON ll.from_user_id = u.id
       WHERE ll.from_user_id = ANY($1::int[]) OR ll.to_user_id = ANY($1::int[])
       ORDER BY ll.created_at DESC`,
      [coupleIds]
    );

    return NextResponse.json({ letters: result || [] });
  } catch (error) {
    console.error('Love letters fetch error:', error);
    return NextResponse.json({ letters: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, senderName, toUserId } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Letter content is required' }, { status: 400 });
    }

    const sender = senderName?.trim() || user.username;
    const letterTitle = title?.trim() || 'A message from the heart';

    const result: any = await executeQuery(
      `INSERT INTO love_letters (from_user_id, to_user_id, sender_name, title, content, is_read) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, from_user_id, to_user_id, sender_name, title, content, is_read, created_at, updated_at`,
      [Number(user.userId), toUserId ? Number(toUserId) : null, sender, letterTitle, content.trim(), false]
    );

    const letter = {
      ...result[0],
      sender,
    };

    return NextResponse.json({ letter }, { status: 201 });
  } catch (error: any) {
    console.error('Love letter create error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send love letter' }, { status: 500 });
  }
}
