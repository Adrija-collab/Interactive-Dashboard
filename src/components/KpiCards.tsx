import React from 'react';
import {
  TrendingUp,
  Hash,
  Activity,
  Calculator,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { ColumnMeta, DataRow } from '../types';
import { formatMetricValue } from '../utils/dataParser';

interface KpiCardsProps {
  rows: DataRow[];
  totalRows: number;
  columns: ColumnMeta[];
  activeMetricKey: string;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  rows,
  totalRows,
  columns,
  activeMetricKey,
}) => {
  const numericCols = columns.filter((c) => c.type === 'number');
  const targetCol =
    numericCols.find((c) => c.key === activeMetricKey) || numericCols[0];

  if (!targetCol || rows.length === 0) {
    return null;
  }

  // Calculate stats for target metric
  const values = rows
    .map((r) => Number(r[targetCol.key]))
    .filter((n) => !isNaN(n));

  const count = values.length;
  const sum = values.reduce((acc, v) => acc + v, 0);
  const avg = count > 0 ? sum / count : 0;
  const max = count > 0 ? Math.max(...values) : 0;
  const min = count > 0 ? Math.min(...values) : 0;

  // Find a secondary metric if available
  const secondaryCol = numericCols.find((c) => c.key !== targetCol.key);
  let secondarySum = 0;
  if (secondaryCol) {
    secondarySum = rows.reduce((acc, r) => {
      const v = Number(r[secondaryCol.key]);
      return acc + (isNaN(v) ? 0 : v);
    }, 0);
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Card 1: Total Metric */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Total {targetCol.label}
          </span>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">
          {formatMetricValue(sum, targetCol.key)}
        </div>
        <div className="mt-2 flex items-center text-xs text-slate-500">
          <span className="text-emerald-600 font-semibold flex items-center mr-1.5">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            Sum
          </span>
          <span>across {count} active records</span>
        </div>
      </div>

      {/* Card 2: Average Value */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Average {targetCol.label}
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Calculator className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">
          {formatMetricValue(avg, targetCol.key)}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>Min: {formatMetricValue(min, targetCol.key)}</span>
          <span className="text-slate-300">•</span>
          <span>Max: {formatMetricValue(max, targetCol.key)}</span>
        </div>
      </div>

      {/* Card 3: Secondary Metric or Peak Value */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500 truncate">
            {secondaryCol ? `Total ${secondaryCol.label}` : `Peak ${targetCol.label}`}
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">
          {secondaryCol
            ? formatMetricValue(secondarySum, secondaryCol.key)
            : formatMetricValue(max, targetCol.key)}
        </div>
        <div className="mt-2 text-xs text-slate-500">
          {secondaryCol ? (
            <span>Aggregated key companion metric</span>
          ) : (
            <span>Highest recording in dataset</span>
          )}
        </div>
      </div>

      {/* Card 4: Dataset Scope & Records */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Filtered Rows
          </span>
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <Hash className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">
          {rows.length}{' '}
          <span className="text-sm font-normal text-slate-400">/ {totalRows}</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full"
              style={{
                width: `${totalRows > 0 ? (rows.length / totalRows) * 100 : 100}%`,
              }}
            />
          </div>
          <span className="text-[11px] font-medium">
            {totalRows > 0 ? Math.round((rows.length / totalRows) * 100) : 100}%
          </span>
        </div>
      </div>
    </div>
  );
};
