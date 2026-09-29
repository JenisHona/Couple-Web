import { NextRequest, NextResponse } from 'next/server';
import { generateCoupleCode } from '@/lib/auth';
import { executeQuery } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedOtp = (otp || '').trim();

    if (!trimmedEmail || !trimmedOtp) {
      return NextResponse.json({ error: 'Email and 6-digit OTP code are required' }, { status: 400 });
    }

    // Find pending verification record
    const records: any = await executeQuery(
      `SELECT id, email, username, password_hash, plain_password, otp, expires_at, gender, age 
       FROM email_verifications 
       WHERE LOWER(email) = LOWER($1)
       ORDER BY created_at DESC LIMIT 1`,
      [trimmedEmail]
    );

    if (!records || records.length === 0) {
      return NextResponse.json(
        { error: 'No verification request found for this email. Please register again.' },
        { status: 404 }
      );
    }

    const verification = records[0];

    // Check if expired
    const expiresAt = new Date(verification.expires_at);
    if (new Date() > expiresAt) {
      await executeQuery('DELETE FROM email_verifications WHERE id = $1', [verification.id]);
      return NextResponse.json(
        { error: 'Verification code has expired. Please click resend code or register again.' },
        { status: 400 }
      );
    }

    // Check OTP match
    if (verification.otp !== trimmedOtp) {
      return NextResponse.json(
        { error: 'Invalid verification code. Please check your email and try again.' },
        { status: 400 }
      );
    }

    // Check if user was already inserted in the meantime
    const existingUser: any = await executeQuery(
      'SELECT id FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($2)',
      [verification.username, trimmedEmail]
    );

    let createdUser;
    if (existingUser && existingUser.length > 0) {
      // If user existed, ensure is_verified is true and update gender/age if provided
      await executeQuery(
        'UPDATE users SET is_verified = TRUE, gender = COALESCE($2, gender), age = COALESCE($3, age) WHERE id = $1', 
        [
          existingUser[0].id,
          verification.gender || 'unspecified',
          verification.age || null,
        ]
      );
      createdUser = existingUser[0];
    } else {
      const coupleCode = generateCoupleCode();
      const insertResult: any = await executeQuery(
        `INSERT INTO users (username, password, email, password_hash, couple_code, is_verified, gender, age) 
         VALUES ($1, $2, $3, $4, $5, TRUE, $6, $7) 
         RETURNING id, username, email, couple_code, gender, age`,
        [
          verification.username,
          verification.plain_password || 'pass',
          trimmedEmail,
          verification.password_hash,
          coupleCode,
          verification.gender || 'unspecified',
          verification.age || null,
        ]
      );
      createdUser = insertResult[0];
    }

    // Delete verification record
    await executeQuery('DELETE FROM email_verifications WHERE LOWER(email) = LOWER($1)', [trimmedEmail]);

    return NextResponse.json({
      success: true,
      message: 'Account verified successfully! Please log in with your credentials.',
      username: verification.username,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify code' },
      { status: 500 }
    );
  }
}
