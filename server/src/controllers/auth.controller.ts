import { Request, Response, CookieOptions } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import AuthService from '../services/auth.service';
import { UserRepository } from '../repositories/user.repository';
import bcrypt from 'bcrypt';

const COOKIE_OPTS: CookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/api/v1/auth' };

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await AuthService.register(req.body);
  // Set refresh token in httpOnly cookie
  res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
  res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, accessToken });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await AuthService.login(email, password);
  // Set refresh token in httpOnly cookie
  res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, accessToken });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken as string | undefined;
  if (!token) return res.status(401).json({ error: 'No refresh token' });
  const { accessToken, refreshToken, user } = await AuthService.refresh(token);
  res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, accessToken });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken as string | undefined;
  await AuthService.logout(token, req.user?.id);
  res.clearCookie('refreshToken', { path: '/api/v1/auth' });
  res.json({ ok: true });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id as string | undefined;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const user = await AuthService.me(userId);
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

// Dev-only debug endpoint to inspect user existence and password match.
export const debugCheck = asyncHandler(async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'Not allowed' });
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email) return res.status(400).json({ error: 'Missing email' });
  const user = await UserRepository.findByEmail(email);
  const found = Boolean(user);
  let passwordMatch = false;
  if (found && password) {
    passwordMatch = await bcrypt.compare(password, user!.password);
  }
  // Return limited info for debugging only
  res.json({ found, passwordMatch, storedHashPreview: user ? String(user.password).slice(0, 10) + '...' : undefined });
});

export default { register, login };
