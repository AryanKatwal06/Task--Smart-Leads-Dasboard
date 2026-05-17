import bcrypt from 'bcrypt';
import { IUser } from '../models/user.model';
import { UserRepository } from '../repositories/user.repository';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import ApiError from '../utils/ApiError';
import RefreshTokenRepository from '../repositories/refreshToken.repository';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function parseExpires(expiresStr?: string) {
  if (!expiresStr) return undefined;
  // support simple formats like '7d' or '15m'
  const num = parseInt(expiresStr.slice(0, -1), 10);
  const unit = expiresStr.slice(-1);
  if (Number.isNaN(num)) return undefined;
  const now = Date.now();
  if (unit === 'd') return new Date(now + num * 24 * 60 * 60 * 1000);
  if (unit === 'h') return new Date(now + num * 60 * 60 * 1000);
  if (unit === 'm') return new Date(now + num * 60 * 1000);
  return undefined;
}

export const AuthService = {
  async register(data: { name: string; email: string; password: string; role?: 'admin' | 'sales' }) {
    const email = normalizeEmail(data.email);
    const existing = await UserRepository.findByEmail(email);
    if (existing) throw new ApiError(400, 'Email already in use');
    const hashed = await bcrypt.hash(data.password, 10);
    const total = await UserRepository.count();
    const role = total === 0 ? 'admin' : data.role ?? 'sales';
    const user = await UserRepository.create({ name: data.name, email, password: hashed, role } as Partial<IUser>);

    // create tokens and persist a hashed refresh token
    const accessToken = signAccessToken(user as IUser);
    const refreshToken = signRefreshToken(user as IUser);
    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    const expiresAt = parseExpires(process.env.JWT_REFRESH_TOKEN_EXPIRES);
    await RefreshTokenRepository.create(user._id.toString(), hashedRefresh, expiresAt);

    return { user, accessToken, refreshToken };
  },

  async login(email: string, password: string) {
    const normalizedEmail = normalizeEmail(email);
    // Debug: log the normalized email used for lookup
    console.log('LOGIN_EMAIL:', normalizedEmail);

    const user = await UserRepository.findByEmail(normalizedEmail);
    // Debug: print whether a user was found (safe preview without sensitive fields)
    console.log('FOUND_USER:', user ? { id: String(user._id), email: String(user.email), role: (user as any).role } : null);
    if (!user) {
      // helpful debug log for local development — remove or lower severity in production
      // eslint-disable-next-line no-console
      console.warn('[auth] login failed — user not found:', normalizedEmail);
      throw new ApiError(401, 'Invalid credentials');
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      // eslint-disable-next-line no-console
      console.warn('[auth] login failed — password mismatch for:', normalizedEmail);
      throw new ApiError(401, 'Invalid credentials');
    }

    const accessToken = signAccessToken(user as IUser);
    const refreshToken = signRefreshToken(user as IUser);

    // persist hashed refresh token for rotation
    const hashed = await bcrypt.hash(refreshToken, 10);
    const expiresAt = parseExpires(process.env.JWT_REFRESH_TOKEN_EXPIRES);
    await RefreshTokenRepository.create(user._id.toString(), hashed, expiresAt);

    return { user, accessToken, refreshToken };
  },

  async refresh(token: string) {
    try {
      const payload = verifyRefreshToken(token);
      const userId = payload.sub;
      const tokens = await RefreshTokenRepository.findByUser(userId);
      for (const t of tokens) {
        const match = await bcrypt.compare(token, t.token);
        if (match && !t.revoked) {
          // rotate: delete old and create new
          await RefreshTokenRepository.delete(t._id.toString());
          const user = await UserRepository.findById(userId);
          if (!user) throw new ApiError(401, 'Invalid token');
          const newAccess = signAccessToken(user as IUser);
          const newRefresh = signRefreshToken(user as IUser);
          const hashed = await bcrypt.hash(newRefresh, 10);
          const expiresAt = parseExpires(process.env.JWT_REFRESH_TOKEN_EXPIRES);
          await RefreshTokenRepository.create(userId, hashed, expiresAt);
          return { accessToken: newAccess, refreshToken: newRefresh, user };
        }
      }
      throw new ApiError(401, 'Refresh token revoked or not found');
    } catch (err) {
      throw new ApiError(401, 'Invalid refresh token');
    }
  },

  async logout(token?: string, userId?: string) {
    if (!token && !userId) return;
    if (token) {
      // revoke specific token
      try {
        const payload = verifyRefreshToken(token);
        const uid = payload.sub;
        const tokens = await RefreshTokenRepository.findByUser(uid);
        for (const t of tokens) {
          const match = await bcrypt.compare(token, t.token);
          if (match) await RefreshTokenRepository.revoke(t._id.toString());
        }
      } catch (err) {
        // ignore
      }
    } else if (userId) {
      const tokens = await RefreshTokenRepository.findByUser(userId);
      for (const t of tokens) await RefreshTokenRepository.revoke(t._id.toString());
    }
  },

  async me(userId: string) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    return user;
  }
};

export default AuthService;
