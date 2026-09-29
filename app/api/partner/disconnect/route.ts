import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getUserProfileWithPartner } from '@/lib/auth';
import { executeQuery } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserId = Number(payload.userId);
    const userProfile = await getUserProfileWithPartner(currentUserId);
    if (!userProfile || !userProfile.partnerId) {
      return NextResponse.json({ error: 'You are not currently linked to any partner.' }, { status: 400 });
    }

    const partnerId = Number(userProfile.partnerId);

    // Unlink both users
    await executeQuery('UPDATE users SET partner_id = NULL WHERE id = $1 OR id = $2', [currentUserId, partnerId]);

    // Update any accepted requests back to cancelled
    await executeQuery(
      "UPDATE partner_requests SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE ((sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)) AND status = 'accepted'",
      [currentUserId, partnerId]
    );

    const updatedProfile = await getUserProfileWithPartner(currentUserId);

    return NextResponse.json({
      success: true,
      message: 'Successfully unlinked partner.',
      user: updatedProfile,
    });
  } catch (error: any) {
    console.error('Error disconnecting partner:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
