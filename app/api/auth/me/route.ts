import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { executeQuery } from '@/lib/db';

// Demo user data
const DEMO_USER = {
  couple: {
    id: '1',
    username: 'couple',
    email: 'couple@lovestory.local',
  }
};

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Try to fetch from database
    if (process.env.DATABASE_URL) {
      try {
        const result = await executeQuery(
          'SELECT id, username, email FROM users WHERE id = $1',
          [payload.userId]
        );
        
        if (result.length > 0) {
          return NextResponse.json({ user: result[0] });
        }
      } catch (dbError) {
        console.warn('Database fetch failed, using demo:', dbError);
      }
    }

    // Fallback to demo data
    const demoUser = DEMO_USER[payload.username as keyof typeof DEMO_USER];
    if (!demoUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ user: demoUser });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
