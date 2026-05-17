import AuthService from '../services/auth.service';
import { UserRepository } from '../repositories/user.repository';
import RefreshTokenRepository from '../repositories/refreshToken.repository';
import bcrypt from 'bcrypt';

jest.mock('../repositories/user.repository');
jest.mock('../repositories/refreshToken.repository');

describe('AuthService', () => {
  beforeEach(() => jest.clearAllMocks());

  test('register should create user and hash password', async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (UserRepository.create as jest.Mock).mockImplementation(async (u) => ({ _id: '1', ...u }));
    (UserRepository.count as jest.Mock).mockResolvedValue(0);
    (RefreshTokenRepository.create as jest.Mock).mockResolvedValue({});

    const res = await AuthService.register({ name: 'Test', email: 't@test.com', password: 'password123' });
    expect(UserRepository.findByEmail).toHaveBeenCalledWith('t@test.com');
    expect(UserRepository.create).toHaveBeenCalled();
    expect(res.user.email).toBe('t@test.com');
  });

  test('login should return tokens for valid credentials', async () => {
    const hashed = await bcrypt.hash('password123', 10);
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue({ _id: '1', email: 't@test.com', password: hashed, role: 'sales' });
    (RefreshTokenRepository.create as jest.Mock).mockResolvedValue({});
    (UserRepository.count as jest.Mock).mockResolvedValue(1);

    const res = await AuthService.login('t@test.com', 'password123');
    expect(res.accessToken).toBeDefined();
    expect(res.refreshToken).toBeDefined();
    expect(RefreshTokenRepository.create).toHaveBeenCalled();
  });

  test('login should normalize email before lookup', async () => {
    const hashed = await bcrypt.hash('password123', 10);
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue({ _id: '1', email: 't@test.com', password: hashed, role: 'sales' });
    (RefreshTokenRepository.create as jest.Mock).mockResolvedValue({});
    (UserRepository.count as jest.Mock).mockResolvedValue(1);

    await AuthService.login('  T@Test.com  ', 'password123');

    expect(UserRepository.findByEmail).toHaveBeenCalledWith('t@test.com');
  });
});
