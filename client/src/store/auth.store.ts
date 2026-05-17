import { create } from 'zustand';

type User = { id: string; name: string; email: string; role: string } | null;

type AuthState = {
  user: User;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: (JSON.parse(localStorage.getItem('sl_user') || 'null') as User) || null,
  accessToken: localStorage.getItem('sl_token') || null,
  setAuth: (user, token) => {
    localStorage.setItem('sl_user', JSON.stringify(user));
    localStorage.setItem('sl_token', token);
    set({ user, accessToken: token });
  },
  clearAuth: () => {
    localStorage.removeItem('sl_user');
    localStorage.removeItem('sl_token');
    set({ user: null, accessToken: null });
  }
}));

export default useAuthStore;
