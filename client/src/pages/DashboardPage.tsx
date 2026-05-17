import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock3, Sparkles, Zap } from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/auth.store';
import { Button, GlassPanel, SectionHeader, StatCard, Surface } from '../components/ui';

const DashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [profileStatus, setProfileStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      setProfileStatus('loading');
      try {
        await api.get('/v1/auth/me');
        if (mounted) {
          setProfileStatus('ready');
          setLastSyncedAt(new Date().toLocaleTimeString());
        }
      } catch {
        if (mounted) setProfileStatus('error');
      }
    };

    loadProfile();
    const intervalId = window.setInterval(loadProfile, 45000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Workspace pulse"
        title={`Welcome${user?.name ? `, ${user.name}` : ''}`}
        description="Your pipeline is live. This overview confirms the session is authenticated and ready for action."
        actions={
          <>
            <Button variant="secondary">View analytics</Button>
            <Button>Open leads</Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
          <StatCard label="Session state" value={profileStatus} delta="Auth health" hint="Synced every 45 seconds" icon={<Activity size={18} />} accent="indigo" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }}>
          <StatCard label="Last sync" value={lastSyncedAt ?? 'Pending'} delta="Refresh cadence" hint="Automatic token verification" icon={<Clock3 size={18} />} accent="cyan" />
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.34 }}>
          <StatCard label="Focus mode" value="Enabled" delta="Premium shell" hint="Motion and glass surfaces active" icon={<Sparkles size={18} />} accent="emerald" />
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36 }}>
          <StatCard label="Routing" value="Protected" delta="Access control" hint="Role and auth gates applied" icon={<Zap size={18} />} accent="amber" />
        </motion.div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
        <GlassPanel className="overflow-hidden p-0">
          <div className="relative overflow-hidden px-6 py-8 sm:px-8">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-cyan-500/10 to-transparent" />
            <div className="relative max-w-3xl space-y-5">
              <p className="section-label">Live status</p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-4xl">
                Premium pipeline monitoring for modern teams.
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                This session is actively refreshing, keeping authentication valid and the dashboard state aligned with the backend. The redesigned shell, motion, and surfaces are already active across the app.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button>Review leads</Button>
                <Button variant="secondary">Inspect analytics</Button>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200/70 px-6 py-5 dark:border-slate-800">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Auth', value: 'Healthy' },
                { label: 'Refresh', value: 'Automatic' },
                { label: 'Theme', value: 'Adaptive' }
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="surface p-5"
        >
          <p className="section-label">System notes</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">What this page is doing</h3>
          <ul className="mt-4 space-y-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <li>Validates your session against <span className="font-medium text-slate-950 dark:text-white">GET /api/v1/auth/me</span>.</li>
            <li>Refreshes automatically on a timer so the access token can be reissued when needed.</li>
            <li>Shows the updated shell, motion system, and premium surfaces across the app.</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;