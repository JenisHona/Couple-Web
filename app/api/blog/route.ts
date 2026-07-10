import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { executeQuery } from '@/lib/db';

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ posts: [] });
    }

    const result = await executeQuery(
      `SELECT bp.id, bp.title, bp.content, bp.images, bp.created_at, 
              u.username as author 
       FROM blog_posts bp 
       JOIN users u ON bp.user_id = u.id 
       ORDER BY bp.created_at DESC LIMIT 50`
    );

    return NextResponse.json({ posts: result });
  } catch (error) {
    console.error('Blog fetch error:', error);
    return NextResponse.json({ posts: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { title, content, images } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const result = await executeQuery(
      `INSERT INTO blog_posts (user_id, title, content, images) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, title, content, images, created_at`,
      [payload.userId, title, content, images || null]
    );

    return NextResponse.json({ post: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Blog create error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
