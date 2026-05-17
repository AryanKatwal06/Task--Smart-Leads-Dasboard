import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { leadsService, ExportFileRecord } from '../services/leads';
import { Button, Surface } from './ui';

export default function ExportsList() {
  const { data: exports, isLoading } = useQuery<ExportFileRecord[]>(['exports-list'], () => leadsService.listExports());

  const handleDownload = async (filename: string) => {
    const blob = await leadsService.downloadExport(filename);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) return <div className="text-sm text-slate-500 dark:text-slate-400">Loading exports...</div>;

  if (!exports || exports.length === 0) {
    return <div className="text-sm text-slate-500 dark:text-slate-400">No exports available yet.</div>;
  }

  return (
    <Surface className="mt-4 overflow-hidden">
      <div className="border-b border-slate-200/70 px-4 py-4 dark:border-slate-800">
        <p className="section-label">Generated Exports</p>
        <h4 className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">Generated Exports</h4>
      </div>
      <table className="w-full text-sm border-collapse">
        <thead className="bg-slate-50/60 text-left text-xs uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-950/50 dark:text-slate-400">
          <tr>
            <th className="px-4 py-3">Filename</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
          {exports.map((exp) => (
            <tr key={exp.filename} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-950/40">
              <td className="px-4 py-3 font-medium text-slate-950 dark:text-white">{exp.filename}</td>
              <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{new Date(exp.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-right">
                <Button variant="secondary" onClick={() => handleDownload(exp.filename)}>
                  <Download size={16} />
                  Download
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Surface>
  );
}