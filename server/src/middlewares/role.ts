import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';

export const authorize = (roles: string | string[]) => (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.user?.role as string | undefined;
  const allowed = (Array.isArray(roles) ? roles : [roles]).map((r) => r.toLowerCase());
  if (!userRole || !allowed.includes(userRole.toLowerCase())) return next(new ApiError(403, 'Forbidden'));
  return next();
};

export default { authorize };
