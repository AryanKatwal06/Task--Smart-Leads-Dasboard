import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FileUp, ShieldCheck } from 'lucide-react';
import { bulkImportService } from '../services/filters';
import toast from 'react-hot-toast';
import { Button, ModalFrame } from './ui';

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function validateCSV(content: string, maxPreview = 50) {
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return { ok: false, errors: ['Empty file'] };
  const header = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const required = ['name', 'email'];
  const missingHeaders = required.filter((r) => !header.includes(r));
  if (missingHeaders.length) return { ok: false, errors: [`Missing required columns: ${missingHeaders.join(', ')}`] };

  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  const rowErrors: string[] = [];
  for (let i = 1; i < Math.min(lines.length, maxPreview + 1); i++) {
    const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    const map: Record<string, string> = {};
    header.forEach((h, idx) => (map[h] = cols[idx] ?? ''));
    if (!map.name) rowErrors.push(`Row ${i + 1}: missing name`);
    if (!map.email) rowErrors.push(`Row ${i + 1}: missing email`);
    else if (!emailRegex.test(map.email)) rowErrors.push(`Row ${i + 1}: invalid email (${map.email})`);
  }

  return { ok: rowErrors.length === 0, errors: rowErrors };
}

export default function BulkImportModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);

  const importMutation = useMutation(
    async () => {
      if (!file) throw new Error('No file selected');
      return bulkImportService.uploadCSV(file);
    },
    {
      onSuccess: (result) => {
        toast.success(`Imported ${result.imported} leads, ${result.failed} failed`);
        onSuccess();
        onClose();
      },
      onError: () => toast.error('Import failed')
    }
  );

  const handleUpload = async () => {
    if (!file) return;
    setValidating(true);
    try {
      const text = await readFileAsText(file);
      const validate = validateCSV(text);
      if (!validate.ok) {
        toast.error(validate.errors.slice(0, 5).join('; '));
        setValidating(false);
        return;
      }
      importMutation.mutate();
    } catch {
      toast.error('Failed to read file');
    } finally {
      setValidating(false);
    }
  };

  return (
    <ModalFrame title="Bulk Import Leads" description="Upload a CSV file with columns: name, email, status, source." onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-600 dark:text-indigo-300">
              <FileUp size={18} />
            </div>
            <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <p className="font-medium text-slate-900 dark:text-white">CSV requirements</p>
              <p>Provide name and email for every row. Optional fields can enrich the imported records.</p>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">CSV file</label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="field file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white dark:file:bg-white dark:file:text-slate-950"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleUpload} disabled={!file || importMutation.isLoading || validating} className="flex-1">
            <ShieldCheck size={16} />
            {importMutation.isLoading || validating ? 'Uploading...' : 'Upload'}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </ModalFrame>
  );
}