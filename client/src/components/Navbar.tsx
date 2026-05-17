import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Moon, Search, Sun, Sparkles } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';
import authService from '../services/auth';
import useAuthStore from '../store/auth.store';
import toast from 'react-hot-toast';
import { Button, Surface } from './ui';

const Navbar: React.FC<{ onMenuToggle?: () => void }> = ({ onMenuToggle }) => {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleLogout = async () => {
    setIsSigningOut(true);
    try {
      await authService.logout();
      toast.success('Signed out successfully');
    } finally {
      clearAuth();
      navigate('/login', { replace: true });
      setIsSigningOut(false);
    }
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = searchValue.trim();
    const searchParams = new URLSearchParams();

    if (trimmed) {
      searchParams.set('search', trimmed);
    }

    searchParams.set('page', '1');
    navigate({ pathname: '/leads', search: searchParams.toString() ? `?${searchParams.toString()}` : '' }, { replace: location.pathname === '/leads' });
  };

  return (
    <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6 lg:px-8">
      <Surface className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <button onClick={onMenuToggle} className="button-ghost h-11 w-11 rounded-2xl p-0 xl:hidden" aria-label="Open navigation">
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/20">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-skin-text">Smart Leads</p>
              <p className="text-xs text-skin-muted">Premium growth workspace</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSearch} className="hidden flex-1 max-w-xl lg:block">
          <label className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-500 shadow-sm transition-all duration-200 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-200/60 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400 dark:focus-within:border-indigo-500/50 dark:focus-within:ring-indigo-500/20">
            <Search size={16} className="shrink-0" />
            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search leads by name or email"
              className="w-full bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
              aria-label="Search leads"
            />
          </label>
        </form>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-skin bg-skin-bg-elevated px-3 py-2 text-xs text-skin-muted shadow-sm md:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.15)]" />
            {user?.name ? <span>Signed in as {user.name}</span> : <span>Workspace active</span>}
          </div>

          <Button variant="ghost" onClick={toggle} aria-label="Toggle theme" className="h-11 w-11 rounded-2xl px-0">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          <Button variant="secondary" loading={isSigningOut} onClick={handleLogout} className="hidden sm:inline-flex">
            <LogOut size={16} />
            Sign out
          </Button>
        </div>
      </Surface>
    </header>
  );
};

export default Navbar;
