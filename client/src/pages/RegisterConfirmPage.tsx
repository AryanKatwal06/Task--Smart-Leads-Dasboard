import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Sparkles } from 'lucide-react';
import { Button, GlassPanel, Surface } from '../components/ui';

const RegisterConfirmPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { email?: string } | null;

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-12 top-0 h-[28rem] w-[28rem] rounded-full bg-emerald-500/18 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-[26rem] w-[26rem] rounded-full bg-cyan-400/18 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-6 lg:grid-cols-[0.98fr_1.02fr]">
        <GlassPanel className="relative overflow-hidden border border-white/60 p-0 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.2),_transparent_28%),radial-gradient(circle_at_80%_16%,_rgba(34,211,238,0.18),_transparent_20%),radial-gradient(circle_at_bottom_left,_rgba(99,102,241,0.14),_transparent_24%),linear-gradient(135deg,_rgba(255,255,255,0.86),_rgba(255,255,255,0.56))]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.35)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-400 to-indigo-500" />
          <div className="relative flex h-full min-h-[28rem] items-end p-8 sm:p-10 lg:p-12">
            <div className="max-w-xl space-y-8">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-[1.15rem] bg-gradient-to-br from-emerald-500 via-cyan-400 to-indigo-500 text-white shadow-[0_18px_40px_rgba(16,185,129,0.24)] ring-1 ring-white/40">
                  <BadgeCheck size={19} />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-950 dark:text-white">Registration complete</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Your workspace is ready</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/15 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700 shadow-sm backdrop-blur dark:border-emerald-400/15 dark:bg-slate-950/55 dark:text-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.12)]" />
                  Next step
                </div>
                <h1 className="max-w-md text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl lg:leading-[1.05]">
                  Your account is ready to use.
                </h1>
                <p className="max-w-lg text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
                  Continue into the app to see the dashboard, manage leads, review analytics, and use protected admin surfaces when your role allows it.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['Email', state?.email ?? 'Verified email pending'],
                  ['Access', 'Ready to sign in'],
                  ['Protected areas', 'Dashboard, Leads, Analytics'],
                  ['Support', 'Use the sign-in flow anytime']
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[1.4rem] border border-white/70 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassPanel>

        <div className="flex items-center justify-center p-8 sm:p-10 lg:p-12">
          <div className="w-full max-w-lg space-y-6">
            <GlassPanel className="border border-white/60 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.12)] sm:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
                <BadgeCheck size={14} />
                Account created
              </div>
              <div className="mt-5 space-y-3">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Registration complete</h2>
                <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Thank you for registering{state?.email ? ` — ${state.email}` : ''}. If email verification is enabled, check your inbox before signing in.
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <div className="rounded-[1.4rem] border border-white/70 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Recommended next step</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Go to sign in and enter the credentials you just created.</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button className="flex-1 rounded-2xl py-3.5 text-base shadow-[0_18px_36px_rgba(16,185,129,0.24)]" onClick={() => navigate('/login')}>
                    Sign in
                    <ArrowRight size={16} />
                  </Button>
                  <Button variant="secondary" className="flex-1 rounded-2xl py-3.5 text-base" onClick={() => navigate('/dashboard')}>
                    Go to app
                  </Button>
                </div>
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterConfirmPage;