import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getUserProfileWithPartner } from '@/lib/auth';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(payload.userId);
    const userProfile = await getUserProfileWithPartner(userId);
    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const partnerId = userProfile.partner?.id ? Number(userProfile.partner.id) : null;

    // Fetch user's own desire setting
    const myRows: any = await executeQuery(
      'SELECT desire_level, threshold, note, updated_at FROM intimacy_desire_levels WHERE user_id = $1',
      [userId]
    );

    const myDesire = myRows && myRows.length > 0 ? Number(myRows[0].desire_level) : 50;
    const myThreshold = myRows && myRows.length > 0 ? Number(myRows[0].threshold || 60) : 60;
    const myNote = myRows && myRows.length > 0 ? myRows[0].note : '';
    const myUpdatedAt = myRows && myRows.length > 0 ? myRows[0].updated_at : null;

    let partnerDesire = null;
    let partnerThreshold = 60;
    let partnerNote = '';
    let partnerHasSubmitted = false;
    let partnerUpdatedAt = null;

    if (partnerId) {
      const partnerRows: any = await executeQuery(
        'SELECT desire_level, threshold, note, updated_at FROM intimacy_desire_levels WHERE user_id = $1',
        [partnerId]
      );
      if (partnerRows && partnerRows.length > 0) {
        partnerHasSubmitted = true;
        partnerThreshold = Number(partnerRows[0].threshold || 60);
        partnerUpdatedAt = partnerRows[0].updated_at;
        
        const pDesire = Number(partnerRows[0].desire_level);
        const effectiveThreshold = Math.min(myThreshold, partnerThreshold);

        // BLIND MATCH LOGIC:
        // Only reveal partner's desire if BOTH partners are >= effective threshold!
        if (myDesire >= effectiveThreshold && pDesire >= effectiveThreshold) {
          partnerDesire = pDesire;
          partnerNote = partnerRows[0].note || '';
        }
      }
    }

    const isMatched = partnerDesire !== null;

    return NextResponse.json({
      myDesire,
      myThreshold,
      myNote,
      myUpdatedAt,
      partnerHasSubmitted,
      partnerUpdatedAt,
      isMatched,
      partnerDesire, // Will only be a number if matched! Otherwise null.
      partnerNote,
      partnerUsername: userProfile.partner?.username || null,
      effectiveThreshold: myThreshold,
    });
  } catch (err: any) {
    console.error('Error fetching desire data:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(payload.userId);
    const body = await request.json();
    const desireLevel = Math.max(0, Math.min(100, Number(body.desireLevel ?? 50)));
    const threshold = Math.max(10, Math.min(100, Number(body.threshold ?? 60)));
    const note = (body.note || '').trim().slice(0, 300);

    await executeQuery(
      `INSERT INTO intimacy_desire_levels (user_id, desire_level, threshold, note, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) 
       DO UPDATE SET desire_level = $2, threshold = $3, note = $4, updated_at = CURRENT_TIMESTAMP`,
      [userId, desireLevel, threshold, note]
    );

    return NextResponse.json({
      success: true,
      message: 'Desire slider safely saved in secrecy shield.',
      desireLevel,
      threshold,
      note,
    });
  } catch (err: any) {
    console.error('Error saving desire level:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
