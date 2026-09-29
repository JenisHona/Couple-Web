import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { executeQuery } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const isRead = typeof body.is_read === 'boolean' ? body.is_read : true;

    const result: any = await executeQuery(
      `UPDATE love_letters 
       SET is_read = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, from_user_id, to_user_id, sender_name, title, content, is_read, created_at, updated_at`,
      [isRead, Number(id)]
    );

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }

    return NextResponse.json({ letter: result[0] });
  } catch (error: any) {
    console.error('Love letter patch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update letter' }, { status: 500 });
  }
}

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
    const { title, content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 });
    }

    const result: any = await executeQuery(
      `UPDATE love_letters 
       SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, from_user_id, to_user_id, sender_name, title, content, is_read, created_at, updated_at`,
      [title?.trim() || 'A message from the heart', content.trim(), Number(id)]
    );

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }

    return NextResponse.json({ letter: result[0] });
  } catch (error: any) {
    console.error('Love letter update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update letter' }, { status: 500 });
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
      `DELETE FROM love_letters WHERE id = $1 RETURNING id`,
      [Number(id)]
    );

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Letter deleted', id: Number(id) });
  } catch (error: any) {
    console.error('Love letter delete error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete letter' }, { status: 500 });
  }
}
