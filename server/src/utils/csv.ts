import fs from 'fs';
import path from 'path';
import type { Response } from 'express';

type CsvPrimitive = string | number | boolean | Date | null | undefined;

type CsvDoc = {
  _id?: { toString(): string } | string;
  name: string;
  email: string;
  status: string;
  source: string;
  createdAt?: Date;
  updatedAt?: Date;
};

type CursorLike = {
  on(event: 'data', listener: (doc: CsvDoc) => void): CursorLike;
  on(event: 'end', listener: () => void): CursorLike;
  on(event: 'error', listener: (err: unknown) => void): CursorLike;
};

type QueryLike = {
  status?: string;
  source?: string;
  search?: string;
};

type ResponseLike = Pick<Response, 'setHeader' | 'write' | 'end'> & {
  destroy?: (error?: Error) => void;
};

function escapeCell(cell: CsvPrimitive) {
  return `"${(cell ?? '').toString().replace(/"/g, '""')}"`;
}

export function buildHeaderRow() {
  return ['id', 'name', 'email', 'status', 'source', 'createdAt', 'updatedAt']
    .map(escapeCell)
    .join(',') + '\n';
}

export function buildRowFromDoc(doc: CsvDoc) {
  const row = [
    doc._id?.toString(),
    doc.name,
    doc.email,
    doc.status,
    doc.source,
    doc.createdAt?.toISOString(),
    doc.updatedAt?.toISOString()
  ];
  return row.map(escapeCell).join(',') + '\n';
}

export function ensureExportsDir() {
  const exportsDir = path.resolve(process.cwd(), 'exports');
  if (!fs.existsSync(exportsDir)) fs.mkdirSync(exportsDir, { recursive: true });
  return exportsDir;
}

export function generateFilename(prefix = 'leads', query?: QueryLike) {
  // create a descriptive filename including filters and timestamp
  const parts: string[] = [prefix];
  if (query) {
    const qparts: string[] = [];
    if (query.status) qparts.push(`status-${String(query.status)}`);
    if (query.source) qparts.push(`source-${String(query.source)}`);
    if (query.search) qparts.push(`search-${String(query.search).replace(/[^a-z0-9]/gi, '_')}`);
    if (qparts.length) parts.push(qparts.join('_'));
  }
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  parts.push(ts);
  return parts.join('_') + '.csv';
}

export async function streamCursorToResponse(cursor: CursorLike, res: ResponseLike, options?: { saveToFile?: boolean; filename?: string; query?: QueryLike }) {
  const exportsDir = ensureExportsDir();
  const filename = options?.filename || generateFilename('leads', options?.query);
  const filepath = path.join(exportsDir, filename);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  // open file write stream if saving
  const fileStream = options?.saveToFile ? fs.createWriteStream(filepath, { encoding: 'utf8' }) : null;

  const header = buildHeaderRow();
  res.write(header);
  if (fileStream) fileStream.write(header);

  cursor.on('data', (doc) => {
    const line = buildRowFromDoc(doc);
    try {
      res.write(line);
    } catch (error) {
      void error;
    }
    if (fileStream) fileStream.write(line);
  });

  return new Promise<void>((resolve, reject) => {
    cursor.on('end', () => {
      if (fileStream) fileStream.end();
      try {
        res.end();
      } catch (error) {
        void error;
      }
      resolve();
    });
    cursor.on('error', (err) => {
      if (fileStream) fileStream.destroy();
      try {
        res.destroy?.(err instanceof Error ? err : new Error('Stream error'));
      } catch (error) {
        void error;
      }
      reject(err);
    });
  });
}
