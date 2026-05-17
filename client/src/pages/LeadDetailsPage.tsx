import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Clock3, Edit3, Mail, Sparkles, Trash2, User } from 'lucide-react';
import leadsService from '../services/leads';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import { Button, Field, GlassPanel, SectionHeader, Select, Surface } from '../components/ui';
import { motion } from 'framer-motion';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  status: z.enum(['New', 'Contacted', 'Qualified', 'Lost']).optional(),
  source: z.enum(['Website', 'Instagram', 'Referral']).optional()
});

type FormValues = z.infer<typeof schema>;

const LeadDetailsPage: React.FC = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, reset, formState, setFocus } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', status: 'New', source: 'Website' }
  });

  const leadQuery = useQuery({
    queryKey: ['lead', leadId],
    queryFn: () => leadsService.getById(leadId ?? ''),
    enabled: Boolean(leadId)
  });

  useEffect(() => {
    if (leadQuery.data) {
      reset({
        name: leadQuery.data.name,
        email: leadQuery.data.email,
        status: leadQuery.data.status,
        source: leadQuery.data.source
      });
    }
  }, [leadQuery.data, reset]);

  useEffect(() => {
    if (isEditing) {
      // focus name field when entering edit mode
      setTimeout(() => setFocus('name'), 50);
    }
  }, [isEditing, setFocus]);

  const updateMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!leadId) throw new Error('Missing lead id');
      return leadsService.update(leadId, data);
    },
    onSuccess: async (updatedLead) => {
      toast.success('Lead updated');
      setIsEditing(false);
      queryClient.setQueryData(['lead', leadId], updatedLead);
      await queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: () => {
      toast.error('Failed to update lead');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!leadId) throw new Error('Missing lead id');
      return leadsService.remove(leadId);
    },
    onSuccess: async () => {
      toast.success('Lead deleted');
      await queryClient.invalidateQueries({ queryKey: ['leads'] });
      navigate('/leads', { replace: true });
    },
    onError: () => {
      toast.error('Failed to delete lead');
    }
  });

  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const emptyState = useMemo(() => {
    if (leadQuery.isLoading) return 'Loading lead details...';
    if (leadQuery.isError) return 'Unable to load this lead.';
    return null;
  }, [leadQuery.isError, leadQuery.isLoading]);

  const onSubmit = async (values: FormValues) => {
    await updateMutation.mutateAsync(values);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Lead details"
        title={leadQuery.data?.name ?? 'Lead'}
        description="Inspect a lead, update it inline, or remove it with a protected confirmation flow."
        actions={
          <Button variant="secondary" onClick={() => navigate('/leads')}>
            Back to list
          </Button>
        }
      />

      {emptyState ? (
        <Surface className="p-6">
          <div className="space-y-4">
            <div className="h-6 w-56 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="h-4 w-72 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="grid gap-3 md:grid-cols-2">
              <div className="h-12 w-full rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
              <div className="h-12 w-full rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            </div>
          </div>
        </Surface>
      ) : leadQuery.data ? (
        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <GlassPanel className="overflow-hidden p-0">
            <div className="border-b border-slate-200/70 px-6 py-5 dark:border-slate-800">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="section-label">Lead profile</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{leadQuery.data.name}</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{leadQuery.data.email}</p>
                </div>
                <Button onClick={() => setIsEditing((current) => !current)}>
                  <Edit3 size={16} />
                  {isEditing ? 'Cancel edit' : 'Edit lead'}
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-6 py-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                  <Field disabled={!isEditing} {...register('name')} />
                  {formState.errors.name ? <p className="text-xs text-rose-500">{formState.errors.name.message}</p> : null}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                  <Field disabled={!isEditing} {...register('email')} />
                  {formState.errors.email ? <p className="text-xs text-rose-500">{formState.errors.email.message}</p> : null}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                  <Select disabled={!isEditing} {...register('status')}>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Lost">Lost</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Source</label>
                  <Select disabled={!isEditing} {...register('source')}>
                    <option value="Website">Website</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Referral">Referral</option>
                  </Select>
                </div>
              </div>

              {isEditing ? (
                <div className="flex justify-end gap-3">
                  <Button variant="secondary" type="button" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button loading={updateMutation.isLoading} type="submit">
                    Save changes
                  </Button>
                </div>
              ) : null}
            </form>
          </GlassPanel>

          <motion.aside
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className="space-y-4"
          >
            <Surface className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-600 dark:text-indigo-300">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">Lead intelligence</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Context and metadata</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60">
                  <span className="flex items-center gap-2"><User size={14} /> Status</span>
                  <span className="font-medium text-slate-950 dark:text-white">{leadQuery.data.status}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60">
                  <span className="flex items-center gap-2"><Mail size={14} /> Source</span>
                  <span className="font-medium text-slate-950 dark:text-white">{leadQuery.data.source}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60">
                  <span className="flex items-center gap-2"><Calendar size={14} /> Created</span>
                  <span className="font-medium text-slate-950 dark:text-white">{new Date(leadQuery.data.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60">
                  <span className="flex items-center gap-2"><Clock3 size={14} /> Updated</span>
                  <span className="font-medium text-slate-950 dark:text-white">{new Date(leadQuery.data.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <Button
                variant="danger"
                onClick={() => setConfirmOpen(true)}
                disabled={deleteMutation.isLoading}
                className="w-full"
              >
                <Trash2 size={16} />
                {deleteMutation.isLoading ? 'Deleting...' : 'Delete lead'}
              </Button>
            </Surface>

            <ConfirmModal
              open={confirmOpen}
              title="Delete lead"
              description="This will permanently delete the lead. Are you sure?"
              confirmLabel="Delete"
              onCancel={() => setConfirmOpen(false)}
              onConfirm={() => {
                setConfirmOpen(false);
                deleteMutation.mutate();
              }}
            />
          </motion.aside>
        </div>
      ) : null}
    </div>
  );
};

export default LeadDetailsPage;