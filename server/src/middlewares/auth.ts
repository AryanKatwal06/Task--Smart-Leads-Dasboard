import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import ApiError from '../utils/ApiError';

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  let token: string | undefined;

  if (typeof authHeader === 'string') {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') token = parts[1];
  }

  // fallback to x-access-token header or accessToken cookie
  if (!token && typeof req.headers['x-access-token'] === 'string') token = req.headers['x-access-token'] as string;
  if (!token && req.cookies?.accessToken) token = req.cookies.accessToken as string;

  if (!token) return next(new ApiError(401, 'Unauthorized'));

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch (err) {
    return next(new ApiError(401, 'Invalid token'));
  }
};

export default { protect };
