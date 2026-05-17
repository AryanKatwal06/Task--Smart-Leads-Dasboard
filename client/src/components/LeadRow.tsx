import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Lead } from '../services/leads';
import { ArrowUpRight } from 'lucide-react';
import { cn } from './ui';

type Props = {
  lead: Lead;
  style?: React.CSSProperties;
};

const rowVariants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.18 } }
} as const;

const statusTone: Record<Lead['status'], string> = {
  New: 'bg-sky-500/10 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200',
  Contacted: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200',
  Qualified: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200',
  Lost: 'bg-rose-500/10 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200'
};

const sourceTone: Record<Lead['source'], string> = {
  Website: 'bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200',
  Instagram: 'bg-fuchsia-500/10 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-200',
  Referral: 'bg-cyan-500/10 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-200'
};

const LeadRowComponent = React.forwardRef<HTMLDivElement | HTMLTableRowElement, Props>(function LeadRowComponent({ lead, style }: Props, ref) {
  const navigate = useNavigate();
  const onOpen = useCallback(() => navigate(`/leads/${lead._id}`), [navigate, lead._id]);

  const commonClasses =
    'group border-t border-slate-200/70 dark:border-slate-800/80 hover:bg-slate-50/80 dark:hover:bg-slate-950/40 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400';

  const badgeBase = 'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide';

  if (style) {
    return (
      <motion.div
        role="row"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpen();
          }
        }}
        onClick={onOpen}
        className={cn(commonClasses, 'grid grid-cols-[1.6fr_1.8fr_1fr_1fr_auto] items-center px-6')}
        ref={ref as React.Ref<HTMLDivElement>}
        style={style}
        initial="hidden"
        animate="show"
        exit="exit"
        variants={rowVariants}
      >
        <div role="cell" className="py-4 truncate font-medium text-slate-950 dark:text-white">{lead.name}</div>
        <div role="cell" className="py-4 truncate text-slate-500 dark:text-slate-400">{lead.email}</div>
        <div role="cell" className="py-4">
          <span className={cn(badgeBase, statusTone[lead.status])}>{lead.status}</span>
        </div>
        <div role="cell" className="py-4">
          <span className={cn(badgeBase, sourceTone[lead.source])}>{lead.source}</span>
        </div>
        <div role="cell" className="py-4 text-right">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            View / Edit
            <ArrowUpRight size={13} />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.tr
      key={lead._id}
      variants={rowVariants}
      layout
      tabIndex={0}
      role="row"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      onClick={onOpen}
      className={commonClasses}
      ref={ref as React.Ref<HTMLTableRowElement>}
    >
      <td className="px-6 py-4 font-medium text-slate-950 dark:text-white">{lead.name}</td>
      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{lead.email}</td>
      <td className="px-6 py-4">
        <span className={cn(badgeBase, statusTone[lead.status])}>{lead.status}</span>
      </td>
      <td className="px-6 py-4">
        <span className={cn(badgeBase, sourceTone[lead.source])}>{lead.source}</span>
      </td>
      <td className="px-6 py-4 text-right">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          View / Edit
          <ArrowUpRight size={13} />
        </button>
      </td>
    </motion.tr>
  );
});

export default React.memo(LeadRowComponent);
