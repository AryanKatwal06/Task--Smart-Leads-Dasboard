import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuthStore from '../store/auth.store';
import { BarChart3, LayoutDashboard, Shield, Users } from 'lucide-react';
import { cn } from './ui';
import { motion } from 'framer-motion';

export const SidebarMenu: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const base = 'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200';

  const renderLink = (to: string, Icon: React.ElementType, label: string) => (
    <NavLink to={to} className={({ isActive }) => cn(base, isActive ? 'bg-slate-950 text-white shadow-lg xl:bg-slate-950 xl:text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white xl:text-slate-600 xl:hover:bg-slate-100 xl:hover:text-slate-950 dark:xl:text-slate-300 dark:xl:hover:bg-slate-900 dark:xl:hover:text-white')}>
      {({ isActive }: { isActive: boolean }) => (
        <motion.div
          initial={false}
          animate={isActive ? { x: 4, scale: 1.02 } : { x: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 30 }}
          className="flex w-full items-center"
        >
          <Icon size={18} />
          <span className="ml-2">{label}</span>
        </motion.div>
      )}
    </NavLink>
  );

  return (
    <nav className="flex flex-col gap-2">
      {renderLink('/dashboard', LayoutDashboard, 'Dashboard')}
      {user?.role === 'admin' ? renderLink('/admin', Shield, 'Admin') : null}
      {(user?.role === 'admin' || user?.role === 'sales') && renderLink('/analytics', BarChart3, 'Analytics')}
      {renderLink('/leads', Users, 'Leads')}
    </nav>
  );
};
