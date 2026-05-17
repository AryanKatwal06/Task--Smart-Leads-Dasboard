import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FixedSizeList as List } from 'react-window';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'react-router-dom';
import { ArrowDownUp, Filter, Plus, RefreshCw, Search, Sparkles, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

import BulkImportModal from '../components/BulkImportModal';
import LeadRow from '../components/LeadRow';
import SavedFiltersPanel from '../components/SavedFiltersPanel';
import SkeletonRow from '../components/SkeletonRow';
import leadsService, { Lead, LeadSource, LeadStatus } from '../services/leads';
import { Button, EmptyState, Field, Select, SectionHeader, StatCard, Surface } from '../components/ui';

const statusOptions: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Lost'];
const sourceOptions: LeadSource[] = ['Website', 'Instagram', 'Referral'];
const sortOptions = [
  { value: 'createdAt', label: 'Newest first' },
  { value: 'updatedAt', label: 'Recently updated' },
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' }
] as const;

const parseStatus = (value: string | null): LeadStatus | undefined => {
  return value && statusOptions.includes(value as LeadStatus) ? (value as LeadStatus) : undefined;
};

const parseSource = (value: string | null): LeadSource | undefined => {
  return value && sourceOptions.includes(value as LeadSource) ? (value as LeadSource) : undefined;
};

const parseSortField = (value: string | null) => {
  return value && ['name', 'email', 'status', 'source', 'createdAt', 'updatedAt'].includes(value)
    ? (value as 'name' | 'email' | 'status' | 'source' | 'createdAt' | 'updatedAt')
    : 'createdAt';
};

const parseSortOrder = (value: string | null): 'asc' | 'desc' => {
  return value === 'asc' ? 'asc' : 'desc';
};

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  status: z.enum(['New', 'Contacted', 'Qualified', 'Lost']).optional(),
  source: z.enum(['Website', 'Instagram', 'Referral']).optional()
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  name: '',
  email: '',
  status: 'New',
  source: 'Website'
};

const LeadsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(true);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');

  const { register, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues
  });

  const queryState = useMemo(() => {
    const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? '10') || 10));

    return {
      status: parseStatus(searchParams.get('status')),
      source: parseSource(searchParams.get('source')),
      search: searchParams.get('search') ?? undefined,
      page,
      limit,
      sortBy: parseSortField(searchParams.get('sortBy')),
      sortOrder: parseSortOrder(searchParams.get('sortOrder'))
    };
  }, [searchParams]);

  useEffect(() => {
    setSearchInput(searchParams.get('search') ?? '');
  }, [searchParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = searchInput.trim();
      const current = searchParams.get('search') ?? '';

      if (trimmed === current) {
        return;
      }

      const next = new URLSearchParams(searchParams);
      if (trimmed) next.set('search', trimmed);
      else next.delete('search');
      next.set('page', '1');
      setSearchParams(next, { replace: true });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput, searchParams, setSearchParams]);

  const updateParams = (
    updates: Record<string, string | number | null | undefined>,
    options?: { resetPage?: boolean }
  ) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') next.delete(key);
      else next.set(key, String(value));
    });

    if (options?.resetPage) {
      next.set('page', '1');
    }

    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => {
    setSearchInput('');
    const next = new URLSearchParams(searchParams);
    ['status', 'source', 'search', 'sortBy', 'sortOrder', 'page'].forEach((key) => next.delete(key));
    setSearchParams(next, { replace: true });
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['leads', queryState],
    queryFn: () => leadsService.getAll(queryState),
    keepPreviousData: true
  });

  const leads = useMemo(() => data?.leads ?? [], [data?.leads]);
  const meta = data?.meta;

  const createMutation = useMutation({
    mutationFn: leadsService.create,
    onSuccess: async () => {
      toast.success('Lead created');
      reset(defaultValues);
      await queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: () => {
      toast.error('Failed to create lead');
    }
  });

  const emptyState = useMemo(() => {
    if (isLoading) return 'Loading leads...';
    if (isError) return 'Unable to load leads right now.';
    if (leads.length === 0) return 'No leads found yet.';
    return null;
  }, [isError, isLoading, leads.length]);

  const leadRows = useMemo(() => leads.map((lead: Lead) => <LeadRow key={lead._id} lead={lead} />), [leads]);

  const onSubmit = async (values: FormValues) => {
    await createMutation.mutateAsync(values);
  };

  const totalPages = meta?.totalPages ?? 0;
  const largeDataset = Boolean(meta && meta.total > 200);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Pipeline"
        title="Leads"
        description="A high-signal workspace for capturing, filtering, and moving prospects through the pipeline."
        actions={
          <>
            <Button variant="secondary" onClick={() => setShowForm((current) => !current)}>
              <Plus size={16} />
              {showForm ? 'Hide form' : 'New lead'}
            </Button>
            <Button variant="secondary" onClick={() => setShowBulkImport(true)}>
              <Upload size={16} />
              Bulk Import
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Visible leads"
          value={meta ? meta.total : '—'}
          delta={queryState.search || queryState.status || queryState.source ? 'Filtered' : 'All records'}
          hint={meta ? `Page ${meta.page} of ${meta.totalPages || 1}` : 'Waiting for data'}
          icon={<Sparkles size={18} />}
          accent="indigo"
        />
        <StatCard
          label="Per page"
          value={queryState.limit}
          delta="Adjust in filters"
          hint="Optimized for scanning and action"
          icon={<Filter size={18} />}
          accent="cyan"
        />
        <StatCard
          label="Sort mode"
          value={queryState.sortBy}
          delta={queryState.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          hint="Refined sorting for the current view"
          icon={<ArrowDownUp size={18} />}
          accent="emerald"
        />
        <StatCard
          label="Freshness"
          value={isLoading ? 'Syncing' : isError ? 'Needs attention' : 'Live'}
          delta={isError ? 'Retry available' : 'Auto refresh ready'}
          hint="Current dataset state"
          icon={<RefreshCw size={18} />}
          accent="amber"
        />
      </div>

      <AnimatePresence initial={false}>
        {showForm ? (
          <motion.section
            key="create-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            className="surface p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="section-label">Create lead</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">Capture a new prospect</h2>
              </div>
              <Button variant="ghost" onClick={() => setShowForm(false)}>
                Hide
              </Button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="lead-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Name
                </label>
                <Field id="lead-name" placeholder="Jane Doe" {...register('name')} />
                {formState.errors.name ? <p className="text-xs text-rose-500">{formState.errors.name.message}</p> : null}
              </div>
              <div className="space-y-2">
                <label htmlFor="lead-email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <Field id="lead-email" placeholder="jane@company.com" {...register('email')} />
                {formState.errors.email ? <p className="text-xs text-rose-500">{formState.errors.email.message}</p> : null}
              </div>
              <div className="space-y-2">
                <label htmlFor="lead-status" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Status
                </label>
                <Select id="lead-status" {...register('status')}>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Lost">Lost</option>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="lead-source" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Source
                </label>
                <Select id="lead-source" {...register('source')}>
                  <option value="Website">Website</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Referral">Referral</option>
                </Select>
              </div>
              <div className="md:col-span-2 flex items-center justify-end gap-3">
                <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={createMutation.isLoading}>
                  Create lead
                </Button>
              </div>
            </form>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <section className="surface overflow-hidden">
        <div className="border-b border-slate-200/70 px-5 py-5 dark:border-slate-800">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="section-label">Lead list</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">Lead list</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" onClick={clearFilters}>
                Clear filters
              </Button>
              <Button variant="secondary" onClick={() => refetch()}>
                <RefreshCw size={16} />
                Refresh
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <SavedFiltersPanel
              currentFilters={queryState}
              onLoadFilter={(f) => {
                updateParams(
                  {
                    status: f.status,
                    source: f.source,
                    search: f.search,
                    startDate: f.startDate,
                    endDate: f.endDate,
                    sortBy: f.sortBy,
                    sortOrder: f.sortOrder
                  },
                  { resetPage: true }
                );
              }}
            />
          </div>

          <div className="mt-4 grid gap-3 xl:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Field
                aria-label="Search leads"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search name or email"
                className="pl-11"
              />
            </div>

            <Select
              aria-label="Filter by status"
              value={queryState.status ?? ''}
              onChange={(event) => updateParams({ status: event.target.value || null }, { resetPage: true })}
            >
              <option value="">All statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>

            <Select
              aria-label="Filter by source"
              value={queryState.source ?? ''}
              onChange={(event) => updateParams({ source: event.target.value || null }, { resetPage: true })}
            >
              <option value="">All sources</option>
              {sourceOptions.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </Select>

            <Select
              aria-label="Sort by field"
              value={queryState.sortBy}
              onChange={(event) => updateParams({ sortBy: event.target.value }, { resetPage: true })}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort by {option.label}
                </option>
              ))}
            </Select>

            <Select
              aria-label="Sort order"
              value={queryState.sortOrder}
              onChange={(event) => updateParams({ sortOrder: event.target.value }, { resetPage: true })}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </Select>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <label className="flex items-center gap-2">
              <span>Rows</span>
              <Select
                value={queryState.limit}
                onChange={(event) => updateParams({ limit: Number(event.target.value) }, { resetPage: true })}
                className="w-auto min-w-24"
              >
                {[10, 20, 50].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </label>
            {meta ? (
              <span>
                Showing {leads.length} of {meta.total} lead{meta.total === 1 ? '' : 's'}
              </span>
            ) : null}
          </div>
        </div>

        {emptyState ? (
          <div className="p-5">
            <EmptyState
              title={emptyState}
              description={isError ? 'The current pipeline snapshot could not be loaded.' : 'Use filters, search, or the create form to start building your pipeline.'}
              action={
                isError ? (
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['leads'] })}>Retry</Button>
                    <Button variant="secondary" onClick={() => window.location.reload()}>
                      Refresh page
                    </Button>
                  </div>
                ) : null
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table role="table" className="min-w-full text-left text-sm" aria-rowcount={meta?.total ?? undefined}>
              <motion.thead
                role="rowgroup"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="border-b border-slate-200/70 bg-slate-50/70 text-xs uppercase tracking-[0.2em] text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400"
              >
                <tr role="row">
                  <th role="columnheader" className="px-6 py-4">
                    Name
                  </th>
                  <th role="columnheader" className="px-6 py-4">
                    Email
                  </th>
                  <th role="columnheader" className="px-6 py-4">
                    Status
                  </th>
                  <th role="columnheader" className="px-6 py-4">
                    Source
                  </th>
                  <th role="columnheader" className="px-6 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </motion.thead>
              <tbody role="rowgroup">
                {isLoading ? (
                  Array.from({ length: queryState.limit }).map((_, i) => <SkeletonRow key={`skeleton-${i}`} index={i} />)
                ) : largeDataset ? (
                  <tr>
                    <td colSpan={5} className="p-0">
                      <div role="list" aria-label="Leads list" className="w-full">
                        <List height={Math.min(600, 56 * leads.length)} itemCount={leads.length} itemSize={56} width="100%">
                          {({ index, style }) => {
                            const lead = leads[index];
                            return (
                              <div key={lead._id} style={style}>
                                <LeadRow lead={lead} style={style} />
                              </div>
                            );
                          }}
                        </List>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence initial={false} mode="popLayout">
                    {leadRows}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.total > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 px-5 py-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <p>
              Page {meta.page} of {meta.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="secondary" type="button" disabled={meta.page <= 1} onClick={() => updateParams({ page: meta.page - 1 })}>
                Previous
              </Button>
              <label className="flex items-center gap-2">
                <span>Go to</span>
                <Field
                  type="number"
                  min={1}
                  max={Math.max(1, totalPages)}
                  value={meta.page}
                  onChange={(e) => {
                    const v = Number(e.target.value || 1);
                    const page = Math.min(Math.max(1, Math.floor(v)), Math.max(1, totalPages));
                    updateParams({ page });
                  }}
                  className="w-20"
                />
              </label>
              <Button variant="secondary" type="button" disabled={meta.page >= meta.totalPages} onClick={() => updateParams({ page: meta.page + 1 })}>
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      {showBulkImport ? (
        <BulkImportModal onClose={() => setShowBulkImport(false)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['leads'] })} />
      ) : null}
    </div>
  );
};

export default LeadsPage;