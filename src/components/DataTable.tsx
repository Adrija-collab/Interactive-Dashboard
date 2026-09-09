import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
  FileSpreadsheet,
} from 'lucide-react';
import { ColumnMeta, DataRow } from '../types';
import { formatMetricValue } from '../utils/dataParser';

interface DataTableProps {
  rows: DataRow[];
  columns: ColumnMeta[];
  datasetTitle: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  rows,
  columns,
  datasetTitle,
}) => {
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [copied, setCopied] = useState(false);

  const handleSort = (colKey: string) => {
    if (sortCol === colKey) {
      if (sortDir === 'asc') setSortDir('desc');
      else {
        setSortCol(null);
        setSortDir('asc');
      }
    } else {
      setSortCol(colKey);
      setSortDir('asc');
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortCol) return rows;
    const sorted = [...rows].sort((a, b) => {
      const valA = a[sortCol];
      const valB = b[sortCol];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }
      return sortDir === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
    return sorted;
  }, [rows, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const paginatedRows = sortedRows.slice(startIdx, startIdx + pageSize);

  const copyToClipboard = () => {
    if (!rows.length) return;
    const headers = columns.map((c) => c.key).join(',');
    const csvContent = [
      headers,
      ...rows.map((r) => columns.map((c) => JSON.stringify(r[c.key] ?? '')).join(',')),
    ].join('\n');

    navigator.clipboard.writeText(csvContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Table Top Controls */}
      <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            {datasetTitle} &mdash; Raw Data View
          </h3>
          <p className="text-xs text-slate-500">
            Total {rows.length} records active &bull; Click column header to sort
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied CSV</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Data</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold">
              <th className="py-2.5 px-4 w-12 text-slate-400 font-normal">#</th>
              {columns.map((col) => {
                const isSorted = sortCol === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="py-2.5 px-4 cursor-pointer hover:bg-slate-200/50 transition select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.label}</span>
                      <span className="text-slate-400">
                        {isSorted ? (
                          sortDir === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {paginatedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="py-8 text-center text-slate-400 text-xs"
                >
                  No records matching current search or filters.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">
                    {startIdx + idx + 1}
                  </td>
                  {columns.map((col) => {
                    const rawVal = row[col.key];
                    const isNum = col.type === 'number';
                    return (
                      <td key={col.key} className="py-2.5 px-4 truncate max-w-xs font-medium">
                        {isNum ? formatMetricValue(rawVal, col.key) : String(rawVal ?? '-')}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/40">
        <div>
          Showing <span className="font-semibold text-slate-700">{startIdx + 1}</span> to{' '}
          <span className="font-semibold text-slate-700">
            {Math.min(startIdx + pageSize, sortedRows.length)}
          </span>{' '}
          of <span className="font-semibold text-slate-700">{sortedRows.length}</span> entries
        </div>

        <div className="flex items-center gap-1.5">
          <button
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-medium text-slate-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="p-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
