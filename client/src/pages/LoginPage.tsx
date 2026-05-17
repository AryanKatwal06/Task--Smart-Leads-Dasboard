import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import authService from '../services/auth';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/auth.store';
import toast from 'react-hot-toast';
import { ArrowRight, Lock, Sparkles } from 'lucide-react';
import { Button, Field, GlassPanel, Surface } from '../components/ui';
import { motion } from 'framer-motion';

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
type FormValues = z.infer<typeof schema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      const res = await authService.login(data);
      setAuth(res.user, res.accessToken);
      toast.success('Signed in successfully');
      navigate('/dashboard');
    } catch (err) {
      // Prefer server-provided error message when available (axios response)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const serverMsg = (err as any)?.response?.data?.error as string | undefined;
      toast.error(serverMsg ?? (err instanceof Error ? err.message : 'Sign in failed'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-12 top-0 h-[30rem] w-[30rem] rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-[26rem] w-[26rem] rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-fuchsia-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-6 lg:grid-cols-[1.04fr_0.96fr]">
        <GlassPanel className="relative overflow-hidden border border-white/60 p-0 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.24),_transparent_28%),radial-gradient(circle_at_80%_16%,_rgba(34,211,238,0.2),_transparent_20%),radial-gradient(circle_at_bottom_left,_rgba(217,70,239,0.16),_transparent_24%),linear-gradient(135deg,_rgba(255,255,255,0.85),_rgba(255,255,255,0.55))]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.35)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400" />
          <div className="relative flex h-full min-h-[28rem] items-end p-8 sm:p-10 lg:p-12">
            <div className="max-w-xl space-y-8">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-[1.15rem] bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 text-white shadow-[0_18px_40px_rgba(99,102,241,0.32)] ring-1 ring-white/40">
                  <Sparkles size={19} />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-950 dark:text-white">Smart Leads</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Secure access to your workspace</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/15 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-700 shadow-sm backdrop-blur dark:border-indigo-400/15 dark:bg-slate-950/55 dark:text-indigo-200">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_0_6px_rgba(34,211,238,0.12)]" />
                  Sign in
                </div>
                <h1 className="max-w-md text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl lg:leading-[1.05]">
                  A calmer, sharper way to manage leads.
                </h1>
                <p className="max-w-lg text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
                  Clean glass, luminous color, and generous spacing create a login experience that feels premium without distracting from the form.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                {['Dashboard overview', 'Leads pipeline', 'Analytics reports'].map((item, index) => (
                  <div
                    key={item}
                    className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200"
                  >
                    <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${index === 0 ? 'bg-indigo-500' : index === 1 ? 'bg-fuchsia-400' : 'bg-cyan-400'}`} />
                    {item}
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_1.05fr]">
                <div className="rounded-[1.8rem] border border-white/70 bg-white/75 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">After sign in</p>
                  <div className="mt-4 space-y-3">
                    {[
                      ['Dashboard', 'See the overall workspace at a glance.'],
                      ['Leads', 'Browse, filter, and manage your pipeline.'],
                      ['Analytics', 'Review charts, exports, and scheduled reports.'],
                      ['Admin', 'Access protected tools when your role allows it.']
                    ].map(([title, description]) => (
                      <div key={title} className="rounded-2xl border border-slate-200/70 bg-white/75 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/5">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400" />
                          <div>
                            <p className="text-sm font-semibold text-slate-950 dark:text-white">{title}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[1.8rem] border border-white/70 bg-white/72 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-fuchsia-400/15 blur-3xl" />
                  <div className="absolute -left-10 top-1/3 h-32 w-32 rounded-full bg-cyan-400/15 blur-3xl" />
                  <div className="relative space-y-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Workspace preview</p>
                        <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">A quick view of the areas you’ll use most.</p>
                      </div>
                      <div className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 shadow-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300">
                        Live routes
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        ['Dashboard', 'Overview and quick actions'],
                        ['Leads', 'Search, filter, and edit records'],
                        ['Analytics', 'Exports and scheduled reports'],
                        ['Admin', 'Protected operator tools']
                      ].map(([title, description], index) => (
                        <div
                          key={title}
                          className="group rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 h-9 w-9 rounded-xl bg-gradient-to-br ${index === 0 ? 'from-indigo-500 via-violet-500 to-cyan-400' : index === 1 ? 'from-fuchsia-500 via-violet-500 to-indigo-400' : index === 2 ? 'from-cyan-400 via-sky-500 to-indigo-400' : 'from-emerald-400 via-teal-500 to-cyan-400'} shadow-[0_12px_24px_rgba(99,102,241,0.18)]`} />
                            <div>
                              <p className="text-sm font-semibold text-slate-950 dark:text-white">{title}</p>
                              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-3 rounded-[1.4rem] border border-white/70 bg-white/80 p-4 shadow-sm sm:grid-cols-[1.2fr_0.8fr] dark:border-white/10 dark:bg-slate-900/55">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">What this includes</p>
                        <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">Protected routes, role checks, saved filters, bulk import, and export scheduling.</p>
                      </div>
                      <div className="flex flex-wrap gap-2 self-start sm:justify-end">
                        {['Filters', 'Import', 'Exports'].map((item, index) => (
                          <span key={item} className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${index === 0 ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-200' : index === 1 ? 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-200' : 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-200'}`}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassPanel>

        <div className="flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg"
          >
            <GlassPanel className="border border-white/60 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.12)] sm:p-10">
              <div className="mb-8 space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
                  <Lock size={14} />
                  Secure sign in
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Welcome back</h2>
                  <p className="max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">Use your workspace credentials to continue. The form below stays clean and focused so the experience feels calm and premium.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                  <Field {...register('email')} placeholder="you@company.com" />
                  {formState.errors.email ? <p className="text-xs text-rose-500">{formState.errors.email.message}</p> : null}
                </div>
                <div className="space-y-2.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                  <Field type="password" {...register('password')} placeholder="••••••••" />
                  {formState.errors.password ? <p className="text-xs text-rose-500">{formState.errors.password.message}</p> : null}
                </div>
                <Button type="submit" loading={isSubmitting} className="w-full rounded-2xl py-3.5 text-base shadow-[0_18px_36px_rgba(79,70,229,0.28)]">
                  Sign in
                  <ArrowRight size={16} />
                </Button>
              </form>

              <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => navigate('/register')} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-300">
                  Sign up
                </button>
              </div>
            </GlassPanel>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;