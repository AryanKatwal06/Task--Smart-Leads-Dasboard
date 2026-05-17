import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import authService from '../services/auth';
import useAuthStore from '../store/auth.store';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, BadgeCheck, Sparkles } from 'lucide-react';
import { Button, Field, GlassPanel, Surface } from '../components/ui';
import { motion } from 'framer-motion';

const schema = z.object({ name: z.string().min(1), email: z.string().email(), password: z.string().min(8) });
type FormValues = z.infer<typeof schema>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      const res = await authService.register(data);
      if (res?.user && res?.accessToken) {
        setAuth(res.user, res.accessToken);
        toast.success('Account created and signed in');
        navigate('/dashboard');
      } else {
        toast.success('Account created successfully');
        navigate('/register/confirm', { state: { email: data.email } });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-12 top-0 h-[30rem] w-[30rem] rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-[26rem] w-[26rem] rounded-full bg-cyan-400/18 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <GlassPanel className="relative overflow-hidden border border-white/60 p-0 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.18),_transparent_28%),radial-gradient(circle_at_80%_16%,_rgba(34,211,238,0.18),_transparent_20%),radial-gradient(circle_at_bottom_left,_rgba(99,102,241,0.14),_transparent_24%),linear-gradient(135deg,_rgba(255,255,255,0.86),_rgba(255,255,255,0.56))]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.35)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-cyan-400" />
          <div className="relative flex h-full min-h-[28rem] items-end p-8 sm:p-10 lg:p-12">
            <div className="max-w-xl space-y-8">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-[1.15rem] bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 text-white shadow-[0_18px_40px_rgba(236,72,153,0.24)] ring-1 ring-white/40">
                  <Sparkles size={19} />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-950 dark:text-white">Smart Leads</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Create your workspace</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/15 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-fuchsia-700 shadow-sm backdrop-blur dark:border-fuchsia-400/15 dark:bg-slate-950/55 dark:text-fuchsia-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.12)]" />
                  Register
                </div>
                <h1 className="max-w-md text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl lg:leading-[1.05]">
                  Start with a workspace that feels refined from day one.
                </h1>
                <p className="max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
                  Create your account to unlock dashboards, leads management, analytics, exports, and protected admin surfaces in one calm, polished flow.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                {['Dashboard', 'Leads', 'Analytics'].map((item, index) => (
                  <div key={item} className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200">
                    <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${index === 0 ? 'bg-fuchsia-500' : index === 1 ? 'bg-indigo-500' : 'bg-cyan-400'}`} />
                    {item}
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_1.05fr]">
                <div className="rounded-[1.8rem] border border-white/70 bg-white/75 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">What you unlock</p>
                  <div className="mt-4 space-y-3">
                    {[
                      ['Protected routes', 'Login, register, and role-based access.'],
                      ['Saved filters', 'Keep the lead views you use most.'],
                      ['Bulk import', 'Add leads without repetitive manual entry.'],
                      ['Export scheduling', 'Prepare CSV exports on a schedule.']
                    ].map(([title, description]) => (
                      <div key={title} className="rounded-2xl border border-slate-200/70 bg-white/75 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/5">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-cyan-400" />
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
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-cyan-400/15 blur-3xl" />
                  <div className="absolute -left-10 top-1/3 h-32 w-32 rounded-full bg-fuchsia-400/15 blur-3xl" />
                  <div className="relative space-y-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Built for</p>
                        <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">A consistent experience across the whole app.</p>
                      </div>
                      <div className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 shadow-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300">
                        Ready
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        ['Dashboard shell', 'Track activity without clutter.'],
                        ['Leads workflow', 'Search, sort, and update records.'],
                        ['Analytics tools', 'Review exports and performance.'],
                        ['Admin access', 'Keep operator tools protected.']
                      ].map(([title, description], index) => (
                        <div key={title} className="group rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5">
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 h-9 w-9 rounded-xl bg-gradient-to-br ${index === 0 ? 'from-fuchsia-500 via-violet-500 to-indigo-400' : index === 1 ? 'from-indigo-500 via-violet-500 to-cyan-400' : index === 2 ? 'from-cyan-400 via-sky-500 to-indigo-400' : 'from-emerald-400 via-teal-500 to-cyan-400'} shadow-[0_12px_24px_rgba(99,102,241,0.18)]`} />
                            <div>
                              <p className="text-sm font-semibold text-slate-950 dark:text-white">{title}</p>
                              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
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
                  <Sparkles size={14} />
                  Create your workspace
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Create your account</h2>
                  <p className="max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">Set up your access in a clean, focused form that matches the rest of the product.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                  <Field {...register('name')} placeholder="Your name" />
                  {formState.errors.name ? <p className="text-xs text-rose-500">{formState.errors.name.message}</p> : null}
                </div>
                <div className="space-y-2.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                  <Field {...register('email')} placeholder="you@company.com" />
                  {formState.errors.email ? <p className="text-xs text-rose-500">{formState.errors.email.message}</p> : null}
                </div>
                <div className="space-y-2.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                  <Field type="password" {...register('password')} placeholder="At least 8 characters" />
                  {formState.errors.password ? <p className="text-xs text-rose-500">{formState.errors.password.message}</p> : null}
                </div>
                <Button type="submit" loading={isSubmitting} className="w-full rounded-2xl py-3.5 text-base shadow-[0_18px_36px_rgba(236,72,153,0.22)]">
                  Create account
                  <ArrowRight size={16} />
                </Button>
              </form>

              <div className="mt-8 rounded-[1.4rem] border border-white/70 bg-white/75 px-4 py-4 text-sm text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                Already have access?{' '}
                <button type="button" onClick={() => navigate('/login')} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-300">
                  Sign in instead
                </button>
              </div>
            </GlassPanel>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;