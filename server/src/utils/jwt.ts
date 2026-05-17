import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { IUser } from '../models/user.model';

const ACCESS_SECRET: Secret = process.env.JWT_ACCESS_TOKEN_SECRET || 'dev_access_secret';
const REFRESH_SECRET: Secret = process.env.JWT_REFRESH_TOKEN_SECRET || 'dev_refresh_secret';

const ACCESS_TOKEN_EXPIRES: SignOptions['expiresIn'] = (process.env.JWT_ACCESS_TOKEN_EXPIRES || '15m') as SignOptions['expiresIn'];
const REFRESH_TOKEN_EXPIRES: SignOptions['expiresIn'] = (process.env.JWT_REFRESH_TOKEN_EXPIRES || '7d') as SignOptions['expiresIn'];

export function signAccessToken(user: IUser) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES
  });
}

export function signRefreshToken(user: IUser) {
  return jwt.sign({ sub: user._id.toString() }, REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET) as { sub: string; role?: string };
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET) as { sub: string };
}

export default { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
