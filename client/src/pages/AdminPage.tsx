import React from 'react';
import { Shield, Settings2, Sparkles } from 'lucide-react';
import { Button, GlassPanel, SectionHeader } from '../components/ui';

const AdminPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Administration"
        title="Admin Console"
        description="Role-protected area for operational tooling, policy controls, and workspace oversight."
        actions={<Button variant="secondary">Request access</Button>}
      />

      <GlassPanel className="relative overflow-hidden p-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/5 via-indigo-500/10 to-cyan-500/10 dark:from-white/5 dark:via-indigo-500/10 dark:to-cyan-500/10" />
        <div className="relative grid gap-6 px-6 py-8 md:grid-cols-[1.1fr_0.9fr] md:px-8 md:py-10">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-950/65 dark:text-slate-300">
              <Shield size={14} />
              Protected by role-based access control
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Admin-only surfaces are reserved for operators.</h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              This route remains gated behind the authenticated role check. In a production deployment, this is where workspace policy, audit, and automation controls would live.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button>
                <Sparkles size={16} />
                Inspect workspace
              </Button>
              <Button variant="secondary">
                <Settings2 size={16} />
                Review settings
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Access', value: 'Admin only' },
              { label: 'Audit', value: 'Enabled' },
              { label: 'Policies', value: 'Locked down' },
              { label: 'Motion', value: 'Adaptive' }
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className="mt-2 text-base font-semibold text-slate-950 dark:text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </GlassPanel>
    </div>
  );
};

export default AdminPage;