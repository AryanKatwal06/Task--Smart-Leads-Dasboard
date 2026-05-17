import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileDown } from 'lucide-react';
import { leadsService, LeadSource, LeadStatus } from '../services/leads';
import toast from 'react-hot-toast';
import { Button, Field, ModalFrame, Select } from './ui';

export default function ExportSchedulingModal({ onClose }: { onClose: () => void }) {
  const [status, setStatus] = useState<LeadStatus | undefined>(undefined);
  const [source, setSource] = useState<LeadSource | undefined>(undefined);
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  const queryClient = useQueryClient();

  const exportMutation = useMutation(
    () => leadsService.exportCSV({ status, source, search, startDate, endDate }),
    {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads-export-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        queryClient.invalidateQueries({ queryKey: ['exports-list'] });
        toast.success('Export created and downloaded');
        onClose();
      },
      onError: () => toast.error('Export failed')
    }
  );

  return (
    <ModalFrame title="Schedule Export" description="Generate a custom CSV snapshot with filters and date ranges." onClose={onClose}>
      <div className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Status (optional)</label>
            <Select value={status ?? ''} onChange={(e) => setStatus(e.target.value || undefined)}>
              <option value="">All</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Lost">Lost</option>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Source (optional)</label>
            <Select value={source ?? ''} onChange={(e) => setSource(e.target.value || undefined)}>
              <option value="">All</option>
              <option value="Website">Website</option>
              <option value="Instagram">Instagram</option>
              <option value="Referral">Referral</option>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Search (optional)</label>
            <Field type="text" value={search ?? ''} onChange={(e) => setSearch(e.target.value || undefined)} placeholder="Name or email" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Start date</label>
            <Field type="date" value={startDate ?? ''} onChange={(e) => setStartDate(e.target.value || undefined)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">End date</label>
            <Field type="date" value={endDate ?? ''} onChange={(e) => setEndDate(e.target.value || undefined)} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => exportMutation.mutate()} disabled={exportMutation.isLoading} className="flex-1">
            <FileDown size={16} />
            {exportMutation.isLoading ? 'Exporting...' : 'Export Now'}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </ModalFrame>
  );
}