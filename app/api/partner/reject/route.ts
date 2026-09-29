import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
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

    const result: any = await executeQuery(
      "UPDATE partner_requests SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND receiver_id = $2 AND status = 'pending' RETURNING id",
      [requestId, currentUserId]
    );

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Request not found or already handled' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Partner request declined' });
  } catch (error: any) {
    console.error('Error rejecting partner request:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
