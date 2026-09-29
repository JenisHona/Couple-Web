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
    const { title, description, category, priority, completed, targetDate } = body;

    // Fetch existing item
    const existing: any = await executeQuery('SELECT * FROM bucket_list_items WHERE id = $1', [Number(id)]);
    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const current = existing[0];
    const newTitle = title !== undefined ? title.trim() : current.title;
    const newDesc = description !== undefined ? description : current.description;
    const newCat = category !== undefined ? category : current.category;
    const newPri = priority !== undefined ? priority : current.priority;
    const newCompleted = completed !== undefined ? completed : current.completed;
    const newTargetDate = targetDate !== undefined ? targetDate : current.target_date;

    const result: any = await executeQuery(
      `UPDATE bucket_list_items
       SET title = $1, description = $2, category = $3, priority = $4, completed = $5, target_date = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING id, user_id, title, description, category, priority, completed, target_date, created_at, updated_at`,
      [newTitle, newDesc, newCat, newPri, newCompleted, newTargetDate, Number(id)]
    );

    return NextResponse.json({ item: result[0] });
  } catch (error: any) {
    console.error('Bucket list update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update item' }, { status: 500 });
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
      `DELETE FROM bucket_list_items WHERE id = $1 RETURNING id`,
      [Number(id)]
    );

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Item deleted', id: Number(id) });
  } catch (error: any) {
    console.error('Bucket list delete error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete item' }, { status: 500 });
  }
}
