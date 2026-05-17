import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bookmark, Plus, X } from 'lucide-react';
import { savedFiltersService, SavedFilter } from '../services/filters';
import toast from 'react-hot-toast';
import { Button, Field, Surface } from './ui';

type SavedFilterDraft = Omit<SavedFilter, '_id' | 'userId' | 'name' | 'createdAt' | 'updatedAt'>;

interface SavedFiltersPanelProps {
  currentFilters: Partial<SavedFilterDraft>;
  onLoadFilter: (filter: SavedFilter) => void;
}

export default function SavedFiltersPanel({ currentFilters, onLoadFilter }: SavedFiltersPanelProps) {
  const queryClient = useQueryClient();
  const [filterName, setFilterName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  const { data: filters, isLoading } = useQuery(['saved-filters'], () => savedFiltersService.getAll());

  const saveMutation = useMutation(
    () => savedFiltersService.create({ name: filterName, ...currentFilters }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['saved-filters'] });
        setFilterName('');
        setShowSaveForm(false);
        toast.success('Filter saved');
      },
      onError: () => toast.error('Failed to save filter')
    }
  );

  const deleteMutation = useMutation(
    (id: string) => savedFiltersService.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['saved-filters'] });
        toast.success('Filter deleted');
      }
    }
  );

  if (isLoading) return <div className="text-sm text-slate-500 dark:text-slate-400">Loading filters...</div>;

  return (
    <Surface className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-label">Saved filters</p>
          <h3 className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">Saved Filters</h3>
        </div>
        {!showSaveForm ? (
          <Button variant="ghost" onClick={() => setShowSaveForm(true)}>
            <Plus size={16} />
            Save Current Filter
          </Button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {filters?.map((f) => (
          <div key={f._id} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950/60">
            <button
              onClick={() => onLoadFilter(f)}
              className="font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-300"
            >
              {f.name}
            </button>
            <button
              onClick={() => deleteMutation.mutate(f._id)}
              className="text-slate-400 transition-colors hover:text-rose-500"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>

      {showSaveForm ? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Field
            type="text"
            placeholder="Filter name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="sm:flex-1"
          />
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!filterName.trim()}
          >
            <Bookmark size={16} />
            Save
          </Button>
          <Button variant="secondary" onClick={() => setShowSaveForm(false)}>
            Cancel
          </Button>
        </div>
      ) : null}
    </Surface>
  );
}