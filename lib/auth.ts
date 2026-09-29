import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { executeQuery } from './db';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'our-magical-love-secret-key-2024';

export interface JWTPayload {
  userId: string;
  username: string;
  email?: string;
  iat?: number;
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePasswords(plainPassword: string, hashedPassword?: string | null) {
  if (!hashedPassword) return false;
  if (hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('$2b$') || hashedPassword.startsWith('$2y$')) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch {
      return false;
    }
  }
  return plainPassword === hashedPassword;
}

export function generateToken(userId: string | number, username: string, email?: string): string {
  return jwt.sign({ userId: String(userId), username, email }, JWT_SECRET, {
    expiresIn: '30d',
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  // 1. Try Cookie
  const cookieToken = request.cookies.get('auth-token')?.value;
  if (cookieToken) {
    const payload = verifyToken(cookieToken);
    if (payload) return payload;
  }

  // 2. Try Authorization Header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const headerToken = authHeader.substring(7).trim();
    const payload = verifyToken(headerToken);
    if (payload) return payload;
  }

  return null;
}

export async function authenticateUser(username: string, password: string) {
  const normalizedUsername = username.trim();
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('Database URL is not configured');
    }

    const result: any = await executeQuery(
      'SELECT id, username, email, password, password_hash, is_verified, gender, age, bio, avatar_url FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)',
      [normalizedUsername]
    );
    
    if (result && result.length > 0) {
      const user = result[0];
      
      if (user.is_verified === false) {
        throw new Error('Please verify your email address before signing in.');
      }

      let isValid = false;
      if (user.password_hash) {
        isValid = await comparePasswords(password, user.password_hash);
      }
      if (!isValid && user.password) {
        isValid = (password === user.password);
      }
      
      if (isValid) {
        return {
          id: user.id.toString(),
          username: user.username,
          email: user.email || `${user.username.toLowerCase()}@duodiary.com`,
          gender: user.gender || 'unspecified',
          age: user.age ? Number(user.age) : null,
          bio: user.bio || null,
          avatarUrl: user.avatar_url || null,
        };
      }
    }

    return null;
  } catch (error: any) {
    console.error('Database authentication error:', error);
    throw error;
  }
}

export function generateCoupleCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `LOVE-${code}`;
}

export async function getCoupleUserIds(userId: string | number): Promise<number[]> {
  try {
    const numId = Number(userId);
    if (!numId) return [1];
    const res: any = await executeQuery('SELECT id, partner_id FROM users WHERE id = $1', [numId]);
    if (res && res.length > 0) {
      const u = res[0];
      if (u.partner_id) {
        return [Number(u.id), Number(u.partner_id)];
      }
      return [Number(u.id)];
    }
  } catch (err) {
    console.warn('Error fetching couple user ids:', err);
  }
  return [Number(userId)];
}

export async function getUserProfileWithPartner(userId: string | number) {
  try {
    const numId = Number(userId);
    const users: any = await executeQuery(
      'SELECT id, username, email, partner_id, couple_code, gender, age, bio, avatar_url FROM users WHERE id = $1',
      [numId]
    );
    if (!users || users.length === 0) return null;
    const user = users[0];

    let partner = null;
    if (user.partner_id) {
      const partners: any = await executeQuery(
        'SELECT id, username, email, couple_code, gender, age, bio, avatar_url FROM users WHERE id = $1',
        [user.partner_id]
      );
      if (partners && partners.length > 0) {
        partner = {
          id: String(partners[0].id),
          username: partners[0].username,
          email: partners[0].email,
          coupleCode: partners[0].couple_code,
          gender: partners[0].gender || 'unspecified',
          age: partners[0].age ? Number(partners[0].age) : null,
          bio: partners[0].bio || null,
          avatarUrl: partners[0].avatar_url || null,
        };
      }
    }

    return {
      id: String(user.id),
      username: user.username,
      email: user.email,
      gender: user.gender || 'unspecified',
      age: user.age ? Number(user.age) : null,
      bio: user.bio || null,
      avatarUrl: user.avatar_url || null,
      partnerId: user.partner_id ? String(user.partner_id) : null,
      coupleCode: user.couple_code,
      partner,
    };
  } catch (err) {
    console.error('Error in getUserProfileWithPartner:', err);
    return null;
  }
}

export async function createUser(username: string, email: string, password: string, gender: string = 'unspecified', age: number | null = null) {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('Database not configured');
    }

    const existing: any = await executeQuery(
      'SELECT id FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($2)',
      [username.trim(), email.trim()]
    );
    
    if (existing && existing.length > 0) {
      throw new Error('Username or email already exists');
    }

    const coupleCode = generateCoupleCode();
    const hashedPassword = await hashPassword(password);
    const result: any = await executeQuery(
      'INSERT INTO users (username, password, email, password_hash, couple_code, gender, age) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, email, couple_code, gender, age',
      [username.trim(), password, email.trim(), hashedPassword, coupleCode, gender, age]
    );

    return result[0];
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
}
