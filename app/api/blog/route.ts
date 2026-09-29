import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getCoupleUserIds } from '@/lib/auth';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ posts: [] });
    }

    const user = getUserFromRequest(request);
    let coupleIds: number[] = [];
    if (user) {
      coupleIds = await getCoupleUserIds(user.userId);
    }

    let query = `
      SELECT bp.id, bp.title, bp.content, bp.images, bp.created_at, bp.updated_at,
             bp.user_id, COALESCE(u.username, 'Anonymous') as author 
      FROM blog_posts bp 
      LEFT JOIN users u ON bp.user_id = u.id 
    `;
    let params: any[] = [];

    if (coupleIds.length > 0) {
      query += ` WHERE bp.user_id = ANY($1::int[]) `;
      params.push(coupleIds);
    }

    query += ` ORDER BY bp.created_at DESC `;

    const result: any = await executeQuery(query, params);
    return NextResponse.json({ posts: result || [] });
  } catch (error) {
    console.error('Blog fetch error:', error);
    return NextResponse.json({ posts: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to write a blog post' }, { status: 401 });
    }

    const { title, content, images } = await request.json();

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const imagesArray = Array.isArray(images) ? images : [];

    const result: any = await executeQuery(
      `INSERT INTO blog_posts (user_id, title, content, images) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, title, content, images, created_at, updated_at`,
      [Number(user.userId), title.trim(), content.trim(), imagesArray]
    );

    const post = {
      ...result[0],
      author: user.username,
      user_id: Number(user.userId),
    };

    return NextResponse.json({ post }, { status: 201 });
  } catch (error: any) {
    console.error('Blog create error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create post' }, { status: 500 });
  }
}
