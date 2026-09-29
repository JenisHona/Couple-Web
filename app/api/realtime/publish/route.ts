import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getUserProfileWithPartner } from '@/lib/auth';
import { realtimeHub } from '@/lib/realtime-hub';
import { executeQuery } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userProfile = await getUserProfileWithPartner(payload.userId);
    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { event, data } = body;

    if (!event) {
      return NextResponse.json({ error: 'Event name is required' }, { status: 400 });
    }

    const coupleCode = userProfile.coupleCode || `USER-${userProfile.id}`;
    const channel = `couple:${coupleCode}`;

    // If it's a roulette state sync, optionally persist to db
    if (event === 'ROULETTE_SYNC' && data) {
      try {
        await executeQuery(
          `INSERT INTO roulette_sessions (couple_code, category, partner1_options, partner2_options, last_winner, last_spun_by, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
           ON CONFLICT (couple_code)
           DO UPDATE SET category = $2, partner1_options = $3, partner2_options = $4, last_winner = $5, last_spun_by = $6, updated_at = CURRENT_TIMESTAMP`,
          [
            coupleCode,
            data.category || 'food',
            JSON.stringify(data.partner1Options || []),
            JSON.stringify(data.partner2Options || []),
            data.lastWinner || null,
            Number(userProfile.id),
          ]
        );
      } catch (dbErr) {
        console.warn('Roulette DB persist warning:', dbErr);
      }
    }

    // Broadcast event to partner in the couple channel
    realtimeHub.broadcast(channel, event, data, {
      id: String(userProfile.id),
      username: userProfile.username,
    });

    return NextResponse.json({
      success: true,
      channel,
      event,
      subscriberCount: realtimeHub.getChannelSubscriberCount(channel),
    });
  } catch (err: any) {
    console.error('Realtime publish error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
