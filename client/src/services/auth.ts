import api from './api';

type LoginPayload = { email: string; password: string };
type RegisterPayload = { name: string; email: string; password: string };

export const authService = {
  async register(data: RegisterPayload) {
    const res = await api.post('/v1/auth/register', data);
    return res.data;
  },
  async login(data: LoginPayload) {
    const res = await api.post('/v1/auth/login', data);
    return res.data;
  },
  async refresh() {
    const res = await api.post('/v1/auth/refresh');
    return res.data;
  },
  async logout() {
    const res = await api.post('/v1/auth/logout');
    return res.data;
  }
};

export default authService;
