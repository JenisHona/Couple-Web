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

    // Fetch incoming pending requests
    const incoming: any = await executeQuery(
      `SELECT r.id, r.sender_id, r.created_at, u.username, u.email, u.couple_code
       FROM partner_requests r
       JOIN users u ON u.id = r.sender_id
       WHERE r.receiver_id = $1 AND r.status = 'pending'
       ORDER BY r.created_at DESC`,
      [Number(payload.userId)]
    );

    // Fetch outgoing pending requests
    const outgoing: any = await executeQuery(
      `SELECT r.id, r.receiver_id, r.created_at, u.username, u.email, u.couple_code
       FROM partner_requests r
       JOIN users u ON u.id = r.receiver_id
       WHERE r.sender_id = $1 AND r.status = 'pending'
       ORDER BY r.created_at DESC`,
      [Number(payload.userId)]
    );

    return NextResponse.json({
      user: userProfile,
      partner: userProfile.partner,
      coupleCode: userProfile.coupleCode,
      incomingRequests: (incoming || []).map((r: any) => ({
        id: r.id,
        senderId: String(r.sender_id),
        username: r.username,
        email: r.email,
        coupleCode: r.couple_code,
        createdAt: r.created_at,
      })),
      outgoingRequests: (outgoing || []).map((r: any) => ({
        id: r.id,
        receiverId: String(r.receiver_id),
        username: r.username,
        email: r.email,
        coupleCode: r.couple_code,
        createdAt: r.created_at,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching partner data:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserId = Number(payload.userId);
    const body = await request.json();
    const identifier = (body.identifier || body.username || body.coupleCode || '').trim();

    if (!identifier) {
      return NextResponse.json({ error: 'Please provide partner username, email, or couple code' }, { status: 400 });
    }

    // Check if current user already has a partner
    const currentUser: any = await executeQuery('SELECT id, partner_id, username FROM users WHERE id = $1', [currentUserId]);
    if (currentUser && currentUser[0]?.partner_id) {
      return NextResponse.json({ error: 'You already have a linked partner. Disconnect first to link with someone else.' }, { status: 400 });
    }

    // Find the target user by username, email, or couple_code (case insensitive)
    const targetUsers: any = await executeQuery(
      `SELECT id, username, email, partner_id, couple_code 
       FROM users 
       WHERE LOWER(username) = LOWER($1) 
          OR LOWER(email) = LOWER($1) 
          OR UPPER(couple_code) = UPPER($1)`,
      [identifier]
    );

    if (!targetUsers || targetUsers.length === 0) {
      return NextResponse.json({ error: 'No user found with that username, email, or couple code' }, { status: 404 });
    }

    const targetUser = targetUsers[0];
    const targetUserId = Number(targetUser.id);

    if (targetUserId === currentUserId) {
      return NextResponse.json({ error: 'You cannot add yourself as your partner!' }, { status: 400 });
    }

    if (targetUser.partner_id) {
      return NextResponse.json({ error: 'This user is already linked with another partner.' }, { status: 400 });
    }

    // Check if there is already a pending request from this user to target
    const existingOutgoing: any = await executeQuery(
      'SELECT id, status FROM partner_requests WHERE sender_id = $1 AND receiver_id = $2 AND status = $3',
      [currentUserId, targetUserId, 'pending']
    );

    if (existingOutgoing && existingOutgoing.length > 0) {
      return NextResponse.json({ error: 'Partner request already sent and pending.' }, { status: 400 });
    }

    // Check if the target user has already sent a request to current user!
    const existingIncoming: any = await executeQuery(
      'SELECT id FROM partner_requests WHERE sender_id = $1 AND receiver_id = $2 AND status = $3',
      [targetUserId, currentUserId, 'pending']
    );

    // If reverse request already exists, automatically link both!
    if (existingIncoming && existingIncoming.length > 0) {
      await executeQuery(
        'UPDATE users SET partner_id = $1 WHERE id = $2',
        [targetUserId, currentUserId]
      );
      await executeQuery(
        'UPDATE users SET partner_id = $1 WHERE id = $2',
        [currentUserId, targetUserId]
      );
      await executeQuery(
        "UPDATE partner_requests SET status = 'accepted' WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)",
        [currentUserId, targetUserId]
      );

      return NextResponse.json({
        success: true,
        autoConnected: true,
        message: `Both of you requested each other! You are now happily linked with @${targetUser.username}!`,
      });
    }

    // Insert new pending request (or update rejected/cancelled one)
    await executeQuery(
      `INSERT INTO partner_requests (sender_id, receiver_id, status, created_at, updated_at)
       VALUES ($1, $2, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (sender_id, receiver_id) 
       DO UPDATE SET status = 'pending', updated_at = CURRENT_TIMESTAMP`,
      [currentUserId, targetUserId]
    );

    return NextResponse.json({
      success: true,
      message: `Partner invitation successfully sent to @${targetUser.username}!`,
      targetUsername: targetUser.username,
    });
  } catch (error: any) {
    console.error('Error sending partner request:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
