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
    const { title, imageUrl, description, category, isFavorite } = body;

    const existing: any = await executeQuery('SELECT * FROM gallery_photos WHERE id = $1', [Number(id)]);
    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    const current = existing[0];
    const newTitle = title !== undefined ? title.trim() : current.title;
    const newImage = imageUrl !== undefined ? imageUrl.trim() : current.image_url;
    const newDesc = description !== undefined ? description : current.description;
    const newCat = category !== undefined ? category : current.category;
    const newFav = isFavorite !== undefined ? isFavorite : current.is_favorite;

    const result: any = await executeQuery(
      `UPDATE gallery_photos
       SET title = $1, image_url = $2, description = $3, category = $4, is_favorite = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, user_id, image_url, title, description, category, is_favorite, created_at, updated_at`,
      [newTitle, newImage, newDesc, newCat, newFav, Number(id)]
    );

    return NextResponse.json({ photo: result[0] });
  } catch (error: any) {
    console.error('Gallery update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update photo' }, { status: 500 });
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
      `DELETE FROM gallery_photos WHERE id = $1 RETURNING id`,
      [Number(id)]
    );

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Photo deleted', id: Number(id) });
  } catch (error: any) {
    console.error('Gallery delete error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete photo' }, { status: 500 });
  }
}
