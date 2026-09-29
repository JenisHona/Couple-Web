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
    const { title, description, date, type, reminder } = body;

    const existing: any = await executeQuery('SELECT * FROM anniversaries WHERE id = $1', [Number(id)]);
    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const current = existing[0];
    const newTitle = title !== undefined ? title.trim() : current.title;
    const newDesc = description !== undefined ? description : current.description;
    const newDate = date !== undefined ? date : current.date;
    const newType = type !== undefined ? type : current.type;
    const newReminder = reminder !== undefined ? reminder : current.reminder;

    const result: any = await executeQuery(
      `UPDATE anniversaries
       SET title = $1, description = $2, date = $3, type = $4, reminder = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, user_id, title, description, date, type, reminder, created_at, updated_at`,
      [newTitle, newDesc, newDate, newType, newReminder, Number(id)]
    );

    return NextResponse.json({ anniversary: result[0] });
  } catch (error: any) {
    console.error('Anniversary update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update event' }, { status: 500 });
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
      `DELETE FROM anniversaries WHERE id = $1 RETURNING id`,
      [Number(id)]
    );

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Event deleted', id: Number(id) });
  } catch (error: any) {
    console.error('Anniversary delete error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete event' }, { status: 500 });
  }
}
