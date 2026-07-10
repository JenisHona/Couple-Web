import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { executeQuery } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export interface JWTPayload {
  userId: string;
  username: string;
  iat?: number;
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePasswords(plainPassword: string, hashedPassword: string) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export function generateToken(userId: string, username: string): string {
  return jwt.sign({ userId, username }, JWT_SECRET, {
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

// Demo credentials for development
const DEMO_CREDENTIALS = {
  couple: {
    password: 'lovestory123',
    id: '1',
    username: 'couple',
    email: 'couple@lovestory.local',
  }
};

export async function authenticateUser(username: string, password: string) {
  try {
    // Try to authenticate with database
    if (process.env.DATABASE_URL) {
      try {
        const result = await executeQuery(
          'SELECT id, username, email, password_hash FROM users WHERE username = $1',
          [username]
        );
        
        if (result.length === 0) {
          return null;
        }

        const user = result[0];
        const isPasswordValid = await comparePasswords(password, user.password_hash);
        
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          username: user.username,
          email: user.email,
        };
      } catch (dbError) {
        console.warn('Database auth failed, falling back to demo:', dbError);
      }
    }

    // Fallback to demo credentials
    const demo = DEMO_CREDENTIALS[username as keyof typeof DEMO_CREDENTIALS];
    if (!demo) {
      return null;
    }
    
    const isPasswordValid = await comparePasswords(password, demo.password);
    if (!isPasswordValid) {
      return null;
    }
    
    return {
      id: demo.id,
      username: demo.username,
      email: demo.email,
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function createUser(username: string, email: string, password: string) {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('Database not configured');
    }

    // Check if user exists
    const existing = await executeQuery(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    
    if (existing.length > 0) {
      throw new Error('Username or email already exists');
    }

    const hashedPassword = await hashPassword(password);
    const result = await executeQuery(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );

    return result[0];
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
}
