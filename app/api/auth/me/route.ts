import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getUserProfileWithPartner } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);

    if (!payload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userProfile = await getUserProfileWithPartner(payload.userId);
    if (userProfile) {
      return NextResponse.json({ user: userProfile });
    }

    return NextResponse.json({
      user: {
        id: payload.userId,
        username: payload.username,
        email: payload.email || `${payload.username.toLowerCase()}@duodiary.com`,
        gender: 'unspecified',
        partnerId: null,
        coupleCode: null,
        partner: null,
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
