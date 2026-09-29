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
    const body = await request.json();
    const { title, description, imageUrl, location, memoryDate, isFavorite } = body;

    const existing: any = await executeQuery('SELECT * FROM memories WHERE id = $1', [Number(id)]);
    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    const current = existing[0];
    const newTitle = title !== undefined ? title.trim() : current.title;
    const newDesc = description !== undefined ? description : current.description;
    const newImage = imageUrl !== undefined ? imageUrl : current.image_url;
    const newLoc = location !== undefined ? location : current.location;
    const newDate = memoryDate !== undefined ? memoryDate : current.memory_date;
    const newFav = isFavorite !== undefined ? isFavorite : current.is_favorite;

    const result: any = await executeQuery(
      `UPDATE memories
       SET title = $1, description = $2, image_url = $3, location = $4, memory_date = $5, is_favorite = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING id, user_id, title, description, image_url, location, memory_date, is_favorite, created_at, updated_at`,
      [newTitle, newDesc, newImage, newLoc, newDate, newFav, Number(id)]
    );

    return NextResponse.json({ memory: result[0] });
  } catch (error: any) {
    console.error('Memory update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update memory' }, { status: 500 });
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
      `DELETE FROM memories WHERE id = $1 RETURNING id`,
      [Number(id)]
    );

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Memory deleted', id: Number(id) });
  } catch (error: any) {
    console.error('Memory delete error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete memory' }, { status: 500 });
  }
}
