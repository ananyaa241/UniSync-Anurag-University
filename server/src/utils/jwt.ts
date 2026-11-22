import jwt from 'jsonwebtoken';
import { Response } from 'express';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'unisync_access_secret_super_secure_key_2026_anurag_cse';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'unisync_refresh_secret_super_secure_key_2026_anurag_cse';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'HOD' | 'COORDINATOR' | 'FACULTY';
  deviceId: string;
}

export const generateTokens = (payload: TokenPayload) => {
  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '2h' });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '30d' });
  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
};
