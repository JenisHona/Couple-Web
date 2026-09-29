import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { executeQuery } from '@/lib/db';

export async function GET() {
  try {
    const result: any = await executeQuery('SELECT * FROM couple_profile LIMIT 1');
    if (!result || result.length === 0) {
      return NextResponse.json({ profile: null });
    }
    return NextResponse.json({ profile: result[0] });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ profile: null }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { partner1Name, partner2Name, relationshipStart, story } = await request.json();

    const existing: any = await executeQuery('SELECT id FROM couple_profile LIMIT 1');
    let result: any;

    if (!existing || existing.length === 0) {
      result = await executeQuery(
        `INSERT INTO couple_profile (partner1_name, partner2_name, relationship_start, story)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [partner1Name || '', partner2Name || '', relationshipStart || null, story || '']
      );
    } else {
      result = await executeQuery(
        `UPDATE couple_profile
         SET partner1_name = $1, partner2_name = $2, relationship_start = $3, story = $4, updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
        [partner1Name || '', partner2Name || '', relationshipStart || null, story || '', existing[0].id]
      );
    }

    return NextResponse.json({ profile: result[0] });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update couple profile' }, { status: 500 });
  }
}
