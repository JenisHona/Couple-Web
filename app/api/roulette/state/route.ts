import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getUserProfileWithPartner } from '@/lib/auth';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userProfile = await getUserProfileWithPartner(payload.userId);
    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const coupleCode = userProfile.coupleCode || `USER-${userProfile.id}`;

    const rows: any = await executeQuery(
      'SELECT category, partner1_options, partner2_options, last_winner, last_spun_by, updated_at FROM roulette_sessions WHERE couple_code = $1',
      [coupleCode]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        category: 'food',
        partner1Options: [],
        partner2Options: [],
        lastWinner: null,
      });
    }

    const session = rows[0];
    return NextResponse.json({
      category: session.category || 'food',
      partner1Options: session.partner1_options || [],
      partner2Options: session.partner2_options || [],
      lastWinner: session.last_winner || null,
      updatedAt: session.updated_at,
    });
  } catch (err: any) {
    console.error('Error fetching roulette state:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
