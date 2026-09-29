import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getUserProfileWithPartner } from '@/lib/auth';
import { executeQuery } from '@/lib/db';
import { fantasyCatalog } from '@/lib/fantasy-catalog';

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

    // 1. Fetch user's own votes
    const myVotesRows: any = await executeQuery(
      'SELECT fantasy_id, vote, updated_at FROM intimacy_fantasy_votes WHERE user_id = $1',
      [userId]
    );

    const myVotes: Record<string, string> = {};
    (myVotesRows || []).forEach((row: any) => {
      myVotes[row.fantasy_id] = row.vote;
    });

    // 2. Fetch partner's votes if partner exists
    const matches: Array<{
      fantasyId: string;
      matchType: 'double_yes' | 'mutual_interest';
      item: any;
    }> = [];

    let partnerVotedCount = 0;

    if (partnerId) {
      const partnerVotesRows: any = await executeQuery(
        'SELECT fantasy_id, vote, updated_at FROM intimacy_fantasy_votes WHERE user_id = $1',
        [partnerId]
      );

      const partnerVotes: Record<string, string> = {};
      (partnerVotesRows || []).forEach((row: any) => {
        partnerVotes[row.fantasy_id] = row.vote;
      });
      partnerVotedCount = Object.keys(partnerVotes).length;

      // 3. Compare with zero embarrassment:
      // ONLY reveal items where BOTH said 'yes' or 'maybe'!
      fantasyCatalog.forEach((item) => {
        const myVote = myVotes[item.id];
        const partnerVote = partnerVotes[item.id];

        if (!myVote || !partnerVote) return;

        if (myVote === 'yes' && partnerVote === 'yes') {
          matches.push({
            fantasyId: item.id,
            matchType: 'double_yes',
            item,
          });
        } else if (
          (myVote === 'yes' && partnerVote === 'maybe') ||
          (myVote === 'maybe' && partnerVote === 'yes') ||
          (myVote === 'maybe' && partnerVote === 'maybe')
        ) {
          matches.push({
            fantasyId: item.id,
            matchType: 'mutual_interest',
            item,
          });
        }
        // If either partner voted 'no', DO NOT add to matches and NEVER expose partner's vote!
      });
    }

    return NextResponse.json({
      myVotes,
      matches,
      totalCatalogCount: fantasyCatalog.length,
      myVotedCount: Object.keys(myVotes).length,
      partnerVotedCount,
      partnerUsername: userProfile.partner?.username || null,
    });
  } catch (err: any) {
    console.error('Error fetching fantasies:', err);
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
    const { fantasyId, vote } = body;

    if (!fantasyId || !['yes', 'maybe', 'no'].includes(vote)) {
      return NextResponse.json({ error: 'Invalid vote or fantasy ID' }, { status: 400 });
    }

    await executeQuery(
      `INSERT INTO intimacy_fantasy_votes (user_id, fantasy_id, vote, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, fantasy_id) 
       DO UPDATE SET vote = $3, updated_at = CURRENT_TIMESTAMP`,
      [userId, fantasyId, vote]
    );

    return NextResponse.json({
      success: true,
      fantasyId,
      vote,
    });
  } catch (err: any) {
    console.error('Error recording fantasy vote:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(payload.userId);
    await executeQuery('DELETE FROM intimacy_fantasy_votes WHERE user_id = $1', [userId]);

    return NextResponse.json({ success: true, message: 'All fantasy votes reset successfully.' });
  } catch (err: any) {
    console.error('Error resetting fantasy votes:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
