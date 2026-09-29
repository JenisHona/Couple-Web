import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { sendOtpEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const records: any = await executeQuery(
      'SELECT id, username, email FROM email_verifications WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (!records || records.length === 0) {
      return NextResponse.json(
        { error: 'No active verification session found. Please register first.' },
        { status: 404 }
      );
    }

    const verification = records[0];
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await executeQuery(
      'UPDATE email_verifications SET otp = $1, expires_at = $2, created_at = CURRENT_TIMESTAMP WHERE id = $3',
      [newOtp, expiresAt, verification.id]
    );

    await sendOtpEmail({
      to: email,
      username: verification.username,
      otp: newOtp,
    });

    return NextResponse.json({
      success: true,
      message: `A fresh verification code has been sent to ${email}.`,
    });
  } catch (error: any) {
    console.error('Resend OTP error:', error);
    return NextResponse.json({ error: error.message || 'Failed to resend code' }, { status: 500 });
  }
}
