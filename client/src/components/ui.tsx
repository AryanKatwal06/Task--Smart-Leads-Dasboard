import React from 'react';
import { Loader2 } from 'lucide-react';

type PrimitiveProps = {
  className?: string;
  children: React.ReactNode;
};

export function cn(...values: Array<string | undefined | false | null>) {
  return values.filter(Boolean).join(' ');
}

export function Surface({ className, children }: PrimitiveProps) {
  return <div className={cn('surface', className)}>{children}</div>;
}

export function GlassPanel({ className, children }: PrimitiveProps) {
  return <div className={cn('glass-panel', className)}>{children}</div>;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}>
      <div className="space-y-2">
        {eyebrow ? <p className="section-label">{eyebrow}</p> : null}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-skin-text md:text-4xl">{title}</h1>
          {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-skin-muted">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  hint,
  icon,
  accent = 'indigo'
}: {
  label: string;
  value: React.ReactNode;
  delta?: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  accent?: 'indigo' | 'cyan' | 'emerald' | 'amber' | 'rose';
}) {
  const accentMap: Record<string, string> = {
    indigo: 'from-indigo-500/20 to-cyan-500/10 text-indigo-500',
    cyan: 'from-cyan-500/20 to-sky-500/10 text-cyan-500',
    emerald: 'from-emerald-500/20 to-teal-500/10 text-emerald-500',
    amber: 'from-amber-500/20 to-orange-500/10 text-amber-500',
    rose: 'from-rose-500/20 to-pink-500/10 text-rose-500'
  };

  return (
    <div className="metric-card relative overflow-hidden">
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-100', accentMap[accent])} />
      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
            <div className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{value}</div>
          </div>
          {icon ? <div className="rounded-2xl border border-white/60 bg-white/70 p-3 text-current shadow-sm dark:border-white/10 dark:bg-slate-950/60">{icon}</div> : null}
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          {delta ? <span className="chip">{delta}</span> : <span />}
          {hint ? <span className="text-xs text-slate-500 dark:text-slate-400">{hint}</span> : null}
        </div>
      </div>
    </div>
  );
}

export function Button({
  variant = 'primary',
  loading,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
}) {
  const variantClass = {
    primary: 'button-primary',
    secondary: 'button-secondary',
    ghost: 'button-ghost',
    danger: 'button-danger'
  }[variant];

  return (
    <button className={cn(variantClass, className)} {...props} disabled={props.disabled || loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export const Field = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return <input ref={ref} className={cn('field', className)} {...props} />;
  }
);
Field.displayName = 'Field';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => {
    return <select ref={ref} className={cn('field-select', className)} {...props} />;
  }
);
Select.displayName = 'Select';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return <textarea ref={ref} className={cn('field min-h-28 resize-y', className)} {...props} />;
  }
);
Textarea.displayName = 'Textarea';

export function EmptyState({
  title,
  description,
  action,
  icon
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="surface flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
      {icon ? <div className="rounded-full border border-slate-200 bg-slate-50 p-4 text-slate-500 dark:border-slate-800 dark:bg-slate-900">{icon}</div> : null}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
        {description ? <p className="max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function ModalFrame({
  title,
  description,
  children,
  onClose
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-[10px]">
      <div className="glass-panel-strong w-full max-w-2xl overflow-hidden">
        <div className="border-b border-slate-200/70 px-6 py-5 dark:border-slate-800">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="section-label">Modal</p>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h3>
              {description ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
            </div>
            {onClose ? (
              <button onClick={onClose} className="button-ghost h-10 w-10 rounded-full p-0" aria-label="Close modal">
                ×
              </button>
            ) : null}
          </div>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}