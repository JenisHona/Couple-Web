import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { executeQuery } from '@/lib/db';
import { sendOtpEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, gender, age } = body;

    const trimmedUsername = (username || '').trim();
    const trimmedEmail = (email || '').trim().toLowerCase();
    const selectedGender = (gender || 'unspecified').trim();
    
    // Parse optional age
    let parsedAge: number | null = null;
    if (age !== undefined && age !== null && age !== '') {
      const numAge = Number(age);
      if (isNaN(numAge) || numAge < 16) {
        return NextResponse.json(
          { error: 'You must be at least 16 years old to join Duo Diary 🌸' },
          { status: 400 }
        );
      }
      if (numAge > 120) {
        return NextResponse.json(
          { error: 'Please enter a valid age' },
          { status: 400 }
        );
      }
      parsedAge = Math.floor(numAge);
    }

    if (!trimmedUsername || !trimmedEmail || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: 'Password must be at least 4 characters' },
        { status: 400 }
      );
    }

    // Check if username or email already exists in users
    const existing: any = await executeQuery(
      'SELECT id, username, email FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($2)',
      [trimmedUsername, trimmedEmail]
    );

    if (existing && existing.length > 0) {
      const conflict = existing[0];
      if (conflict.username.toLowerCase() === trimmedUsername.toLowerCase()) {
        return NextResponse.json({ error: 'This username is already taken' }, { status: 400 });
      }
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await hashPassword(password);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete existing pending verifications for this email
    await executeQuery('DELETE FROM email_verifications WHERE LOWER(email) = LOWER($1)', [trimmedEmail]);

    // Insert into email_verifications including gender and age
    await executeQuery(
      `INSERT INTO email_verifications (email, username, password_hash, plain_password, otp, expires_at, gender, age)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [trimmedEmail, trimmedUsername, hashedPassword, password, otp, expiresAt, selectedGender, parsedAge]
    );

    // Send the email with OTP
    await sendOtpEmail({
      to: trimmedEmail,
      username: trimmedUsername,
      otp,
    });

    return NextResponse.json({
      success: true,
      requiresOtp: true,
      email: trimmedEmail,
      username: trimmedUsername,
      message: `A 6-digit verification code has been sent to ${trimmedEmail}.`,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Registration initiate error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate registration' },
      { status: 500 }
    );
  }
}
