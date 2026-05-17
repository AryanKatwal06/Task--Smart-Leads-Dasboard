import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leadsService, LeadAnalyticsResponse } from '../services/leads';
import { Line } from 'react-chartjs-2';
import ExportsList from '../components/ExportsList';
import ExportSchedulingModal from '../components/ExportSchedulingModal';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { ArrowDownToLine, Flame, Sparkles, TrendingUp } from 'lucide-react';
import { Button, SectionHeader, StatCard, Surface } from '../components/ui';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function AnalyticsPage() {
  const [showExportScheduling, setShowExportScheduling] = useState(false);

  const { data, isLoading, refetch } = useQuery<LeadAnalyticsResponse>(['leads-analytics'], () => leadsService.getAnalytics());

  const totals = useMemo(() => {
    const statusTotal = data ? Object.values(data.byStatus).reduce((sum, value) => sum + value, 0) : 0;
    const sourceTotal = data ? Object.values(data.bySource).reduce((sum, value) => sum + value, 0) : 0;
    const latestPoint = data?.timeseries?.at(-1)?.count ?? 0;

    return { statusTotal, sourceTotal, latestPoint };
  }, [data]);

  const chartData = useMemo(
    () => ({
      labels: data?.timeseries.map((t) => t._id) ?? [],
      datasets: [
        {
          label: 'Leads',
          data: data?.timeseries.map((t) => t.count) ?? [],
          borderColor: 'rgba(79, 70, 229, 1)',
          backgroundColor: 'rgba(79, 70, 229, 0.12)',
          pointBackgroundColor: 'rgba(34, 211, 238, 1)',
          pointBorderColor: 'rgba(15, 23, 42, 1)',
          tension: 0.35,
          fill: true
        }
      ]
    }),
    [data]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      },
      scales: {
        x: {
          grid: { color: 'rgba(148, 163, 184, 0.12)' },
          ticks: { color: 'rgba(100, 116, 139, 0.9)' }
        },
        y: {
          grid: { color: 'rgba(148, 163, 184, 0.12)' },
          ticks: { color: 'rgba(100, 116, 139, 0.9)', precision: 0 }
        }
      }
    }),
    []
  );

  const handleExport = async () => {
    setExporting(true);
    try {
      const { blob } = await leadsService.exportCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'leads-export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const [exporting, setExporting] = React.useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 w-48 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="mt-3 h-8 w-72 rounded bg-slate-200 dark:bg-slate-700" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="metric-card relative overflow-hidden p-4">
              <div className="h-6 w-28 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
              <div className="mt-3 h-8 w-20 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
            </div>
          ))}
        </div>

        <div className="surface p-5">
          <div className="h-6 w-40 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 w-full rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Analytics"
        title="Leads Analytics"
        description="A premium reporting surface for reading performance, exporting data, and tracking pipeline momentum."
        actions={
          <>
            <Button variant="secondary" onClick={handleExport} loading={exporting} disabled={exporting}>
              <ArrowDownToLine size={16} />
              Export CSV
            </Button>
            <Button onClick={() => setShowExportScheduling(true)}>
              <Sparkles size={16} />
              Create Custom Export
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total by status" value={totals.statusTotal} delta="Live snapshot" hint="Aggregated across the workspace" icon={<TrendingUp size={18} />} accent="indigo" />
        <StatCard label="Total by source" value={totals.sourceTotal} delta="Acquisition mix" hint="Used for attribution review" icon={<Flame size={18} />} accent="cyan" />
        <StatCard label="Latest point" value={totals.latestPoint} delta="Momentum" hint="Last point in the series" icon={<Sparkles size={18} />} accent="emerald" />
        <StatCard label="Range" value="All time" delta="No date filter" hint="Showing the full dataset" icon={<Sparkles size={18} />} accent="amber" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Surface className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="section-label">Filters</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">Status and source</h3>
            </div>
            <Button variant="secondary" onClick={() => refetch()}>
              Refresh
            </Button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.6rem] border border-slate-200/80 bg-gradient-to-br from-white/90 to-slate-50/80 p-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:from-slate-950/70 dark:to-slate-950/50">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">By status</p>
                <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:text-indigo-200">API driven</span>
              </div>
              <div className="mt-5 space-y-3">
                {data?.byStatus && Object.entries(data.byStatus).length > 0 ? Object.entries(data.byStatus).map(([k, v], index) => (
                  <div key={k} className="flex items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${index === 0 ? 'bg-indigo-500' : index === 1 ? 'bg-cyan-400' : index === 2 ? 'bg-fuchsia-400' : 'bg-emerald-400'}`} />
                      <span className="text-slate-600 dark:text-slate-300">{k}</span>
                    </div>
                    <span className="font-semibold text-slate-950 dark:text-white">{String(v)}</span>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-dashed border-slate-200/80 bg-white/60 px-4 py-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
                    No status data available yet.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-slate-200/80 bg-gradient-to-br from-white/90 to-slate-50/80 p-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:from-slate-950/70 dark:to-slate-950/50">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">By source</p>
                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-200">Attribution</span>
              </div>
              <div className="mt-5 space-y-3">
                {data?.bySource && Object.entries(data.bySource).length > 0 ? Object.entries(data.bySource).map(([k, v], index) => (
                  <div key={k} className="flex items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${index === 0 ? 'bg-fuchsia-400' : index === 1 ? 'bg-indigo-500' : 'bg-cyan-400'}`} />
                      <span className="text-slate-600 dark:text-slate-300">{k}</span>
                    </div>
                    <span className="font-semibold text-slate-950 dark:text-white">{String(v)}</span>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-dashed border-slate-200/80 bg-white/60 px-4 py-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
                    No source data available yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </Surface>

        <Surface className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-label">Timeseries</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">Pipeline momentum</h3>
            </div>
          </div>
          <div className="mt-5 h-[360px]">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
              <Line data={chartData} options={chartOptions} />
            </motion.div>
          </div>
        </Surface>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
        <ExportsList />
      </motion.div>

      {showExportScheduling && <ExportSchedulingModal onClose={() => setShowExportScheduling(false)} />}
    </div>
  );
}