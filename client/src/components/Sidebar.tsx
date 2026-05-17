import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { SidebarMenu } from './SidebarMenu';
import useAuthStore from '../store/auth.store';
import { Surface } from './ui';
import { BarChart3, Bot, Sparkles } from 'lucide-react';

const Sidebar: React.FC<{ open?: boolean; onClose?: () => void }> = ({ open = false, onClose }) => {
  const user = useAuthStore((state) => state.user);
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-40 xl:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]" aria-label="Close navigation" onClick={onClose} />
          <motion.aside
            initial={shouldReduceMotion ? { x: 0 } : { x: -24, opacity: 0 }}
            animate={shouldReduceMotion ? { x: 0 } : { x: 0, opacity: 1 }}
            exit={shouldReduceMotion ? { x: 0 } : { x: -24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="relative flex h-full w-[88vw] max-w-sm flex-col border-r border-white/10 bg-slate-950/95 p-4 text-white shadow-[0_30px_100px_rgba(2,6,23,0.6)]"
          >
            <SidebarContent userRole={user?.role ?? 'guest'} onClose={onClose} />
          </motion.aside>
        </motion.div>
      ) : null}

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-80 p-4 xl:block">
        <Surface className="flex h-full flex-col overflow-hidden p-4">
          <SidebarContent userRole={user?.role ?? 'guest'} />
        </Surface>
      </aside>
    </AnimatePresence>
  );
};

export default Sidebar;

function SidebarContent({ userRole, onClose }: { userRole: string; onClose?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/20">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-white xl:text-skin-text">Smart Leads</p>
              <p className="text-xs text-skin-muted">Revenue command center</p>
            </div>
          </div>
        {onClose ? (
          <button onClick={onClose} className="button-ghost h-10 w-10 rounded-2xl p-0 text-white xl:hidden" aria-label="Close navigation">
            ×
          </button>
        ) : null}
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-slate-950/20 xl:border-skin xl:bg-skin-bg-elevated xl:text-skin-text">
      <p className="section-label text-skin-muted">Workspace</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-white xl:text-slate-950 dark:text-white">Signal Intelligence</p>
            <p className="text-xs text-slate-300 xl:text-slate-500">Real-time pipeline clarity</p>
          </div>
          <div className="rounded-2xl bg-emerald-400/15 p-3 text-emerald-300 xl:bg-emerald-500/10 xl:text-emerald-600">
            <Bot size={18} />
          </div>
        </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-skin-muted">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 xl:border-slate-200 xl:bg-white/70 dark:xl:border-slate-800 dark:xl:bg-slate-900/60">
            <span className="block text-[11px] uppercase tracking-[0.24em]">Role</span>
            <span className="mt-1 block font-semibold text-white xl:text-slate-950 dark:text-white">{userRole}</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 xl:border-slate-200 xl:bg-white/70 dark:xl:border-slate-800 dark:xl:bg-slate-900/60">
            <span className="block text-[11px] uppercase tracking-[0.24em]">Status</span>
            <span className="mt-1 block font-semibold text-white xl:text-slate-950 dark:text-white">Synced</span>
          </div>
        </div>
      </div>

      <SidebarMenu />

      <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300 xl:border-slate-200 xl:bg-white/80 xl:text-slate-500 dark:xl:border-slate-800 dark:xl:bg-slate-950/55">
        <p className="section-label text-slate-300 xl:text-slate-500">Performance</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <p className="font-medium text-white xl:text-slate-950 dark:text-white">Adaptive motion</p>
            <p className="text-xs text-slate-400 xl:text-slate-500">Spring transitions enabled</p>
          </div>
          <BarChart3 size={18} className="text-cyan-300 xl:text-cyan-500" />
        </div>
      </div>
    </div>
  );
}
