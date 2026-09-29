import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { executeQuery } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { title, content, images } = await request.json();

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const imagesArray = Array.isArray(images) ? images : [];

    const result: any = await executeQuery(
      `UPDATE blog_posts 
       SET title = $1, content = $2, images = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, title, content, images, created_at, updated_at, user_id`,
      [title.trim(), content.trim(), imagesArray, Number(id)]
    );

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post: result[0] });
  } catch (error: any) {
    console.error('Blog update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const result: any = await executeQuery(
      `DELETE FROM blog_posts WHERE id = $1 RETURNING id`,
      [Number(id)]
    );

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Post deleted successfully', id: Number(id) });
  } catch (error: any) {
    console.error('Blog delete error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete post' }, { status: 500 });
  }
}
