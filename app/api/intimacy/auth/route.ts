import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getUserProfileWithPartner } from '@/lib/auth';
import { executeQuery } from '@/lib/db';
import crypto from 'crypto';

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin + '_intimacy_vault_salt').digest('hex');
}

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

    // Check if user is 18+ (if age is specified and < 18, reject)
    if (userProfile.age && userProfile.age < 18) {
      return NextResponse.json({ 
        isUnderage: true, 
        error: 'This section is strictly for users 18 years of age or older.' 
      }, { status: 403 });
    }

    // Check partner age
    if (userProfile.partner?.age && userProfile.partner.age < 18) {
      return NextResponse.json({ 
        isUnderage: true, 
        error: 'Both partners must be 18 years of age or older to access intimate features.' 
      }, { status: 403 });
    }

    // Get intimacy settings
    const settings: any = await executeQuery(
      'SELECT pin_hash, is_age_confirmed FROM intimacy_settings WHERE user_id = $1',
      [userId]
    );

    const hasPin = !!(settings && settings.length > 0 && settings[0].pin_hash);
    const isAgeConfirmed = !!(settings && settings.length > 0 && settings[0].is_age_confirmed);

    return NextResponse.json({
      hasPin,
      isAgeConfirmed,
      hasPartner: !!userProfile.partner,
      partnerUsername: userProfile.partner?.username || null,
      userAge: userProfile.age,
    });
  } catch (err: any) {
    console.error('Error checking intimacy auth:', err);
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
    const { action, pin, newPin, confirmAge } = body;

    // Action 1: Confirm 18+ Age Verification
    if (action === 'confirm_age') {
      if (!confirmAge) {
        return NextResponse.json({ error: 'You must confirm you are 18+ to proceed.' }, { status: 400 });
      }

      await executeQuery(
        `INSERT INTO intimacy_settings (user_id, is_age_confirmed, updated_at)
         VALUES ($1, TRUE, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id) 
         DO UPDATE SET is_age_confirmed = TRUE, updated_at = CURRENT_TIMESTAMP`,
        [userId]
      );

      return NextResponse.json({ success: true, message: '18+ age status verified.' });
    }

    // Action 2: Set New PIN
    if (action === 'set_pin') {
      if (!newPin || typeof newPin !== 'string' || newPin.length < 4) {
        return NextResponse.json({ error: 'Please provide a 4-digit PIN.' }, { status: 400 });
      }

      const pinHash = hashPin(newPin.trim());
      await executeQuery(
        `INSERT INTO intimacy_settings (user_id, pin_hash, is_age_confirmed, updated_at)
         VALUES ($1, $2, TRUE, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id) 
         DO UPDATE SET pin_hash = $2, is_age_confirmed = TRUE, updated_at = CURRENT_TIMESTAMP`,
        [userId, pinHash]
      );

      return NextResponse.json({ success: true, message: 'Vault PIN successfully set.' });
    }

    // Action 3: Verify PIN
    if (action === 'verify_pin') {
      if (!pin) {
        return NextResponse.json({ error: 'Please enter your PIN.' }, { status: 400 });
      }

      const settings: any = await executeQuery(
        'SELECT pin_hash FROM intimacy_settings WHERE user_id = $1',
        [userId]
      );

      if (!settings || settings.length === 0 || !settings[0].pin_hash) {
        return NextResponse.json({ error: 'No PIN set yet. Please set a PIN first.' }, { status: 400 });
      }

      const incomingHash = hashPin(pin.trim());
      if (incomingHash !== settings[0].pin_hash) {
        return NextResponse.json({ error: 'Incorrect PIN. Try again.' }, { status: 401 });
      }

      return NextResponse.json({ success: true, verified: true, message: 'Vault unlocked.' });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (err: any) {
    console.error('Error in intimacy auth POST:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
