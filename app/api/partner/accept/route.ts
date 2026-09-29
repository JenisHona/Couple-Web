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
    const body = await request.json();
    const requestId = Number(body.requestId);

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    // Verify request belongs to receiver and is pending
    const requests: any = await executeQuery(
      `SELECT r.id, r.sender_id, r.receiver_id, u.username as sender_username, me.username as my_username
       FROM partner_requests r
       JOIN users u ON u.id = r.sender_id
       JOIN users me ON me.id = r.receiver_id
       WHERE r.id = $1 AND r.receiver_id = $2 AND r.status = 'pending'`,
      [requestId, currentUserId]
    );

    if (!requests || requests.length === 0) {
      return NextResponse.json({ error: 'Pending partner request not found' }, { status: 404 });
    }

    const req = requests[0];
    const senderId = Number(req.sender_id);

    // Link both users mutually
    await executeQuery('UPDATE users SET partner_id = $1 WHERE id = $2', [senderId, currentUserId]);
    await executeQuery('UPDATE users SET partner_id = $1 WHERE id = $2', [currentUserId, senderId]);

    // Mark this request accepted
    await executeQuery("UPDATE partner_requests SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [requestId]);

    // Reject all other pending requests for both users
    await executeQuery(
      "UPDATE partner_requests SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id != $1 AND (sender_id = $2 OR receiver_id = $2 OR sender_id = $3 OR receiver_id = $3) AND status = 'pending'",
      [requestId, currentUserId, senderId]
    );

    // Ensure couple_profile has default partner names if not yet set
    const profile: any = await executeQuery('SELECT id, partner1_name, partner2_name FROM couple_profile LIMIT 1');
    if (!profile || profile.length === 0) {
      await executeQuery(
        'INSERT INTO couple_profile (partner1_name, partner2_name, relationship_start, story) VALUES ($1, $2, CURRENT_DATE, $3)',
        [req.sender_username, req.my_username, 'Two hearts joined together in love.']
      );
    } else if (!profile[0].partner1_name || !profile[0].partner2_name) {
      await executeQuery(
        'UPDATE couple_profile SET partner1_name = $1, partner2_name = $2 WHERE id = $3',
        [req.sender_username, req.my_username, profile[0].id]
      );
    }

    const updatedProfile = await getUserProfileWithPartner(currentUserId);

    return NextResponse.json({
      success: true,
      message: `You and @${req.sender_username} are now linked partners! Welcome to your shared couple sanctuary.`,
      user: updatedProfile,
    });
  } catch (error: any) {
    console.error('Error accepting partner request:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
