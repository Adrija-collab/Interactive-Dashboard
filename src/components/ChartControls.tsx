import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  LineChart,
  AreaChart,
  PieChart,
  ScatterChart,
  Radar,
  Table as TableIcon,
  Palette,
  ArrowDownUp,
  Sliders,
} from 'lucide-react';
import { AggregationType, ChartConfig, ChartType, ColumnMeta } from '../types';

interface ChartControlsProps {
  config: ChartConfig;
  onChangeConfig: (newConfig: Partial<ChartConfig>) => void;
  columns: ColumnMeta[];
}

export const ChartControls: React.FC<ChartControlsProps> = ({
  config,
  onChangeConfig,
  columns,
}) => {
  const numericColumns = columns.filter((c) => c.type === 'number');
  const categoricalOrDateColumns = columns.filter(
    (c) => c.type === 'string' || c.type === 'date'
  );

  const chartTabs: { id: ChartType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'bar', label: 'Bar Chart', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'line', label: 'Line Trend', icon: <LineChart className="w-4 h-4" /> },
    { id: 'area', label: 'Area Fill', icon: <AreaChart className="w-4 h-4" /> },
    { id: 'pie', label: 'Donut & Pie', icon: <PieChart className="w-4 h-4" /> },
    { id: 'scatter', label: 'Scatter Correlation', icon: <ScatterChart className="w-4 h-4" /> },
    { id: 'radar', label: 'Radar Profile', icon: <Radar className="w-4 h-4" /> },
    { id: 'table', label: 'Raw Data Table', icon: <TableIcon className="w-4 h-4" /> },
  ];

  const colorThemes = [
    { id: 'indigo', name: 'Indigo / Modern', color: '#4f46e5' },
    { id: 'emerald', name: 'Emerald / Fresh', color: '#059669' },
    { id: 'amber', name: 'Amber / Warm', color: '#d97706' },
    { id: 'rose', name: 'Rose / Vibrant', color: '#e11d48' },
    { id: 'slate', name: 'Slate / Minimal', color: '#475569' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-xs">
      {/* View Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 border-b border-slate-100 scrollbar-none">
        {chartTabs.map((tab) => {
          const isActive = config.chartType === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-view-${tab.id}`}
              onClick={() => onChangeConfig({ chartType: tab.id })}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Axis & Aggregation Configuration Bar (only for visual charts) */}
      {config.chartType !== 'table' && config.chartType !== 'overview' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
          {/* Dimension (X-Axis) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Dimension (X-Axis)
            </label>
            <select
              id="select-dimension"
              value={config.dimensionKey}
              onChange={(e) => onChangeConfig({ dimensionKey: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {categoricalOrDateColumns.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label} ({c.type})
                </option>
              ))}
              {/* Fallback to all if no categoricals */}
              {categoricalOrDateColumns.length === 0 &&
                columns.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
            </select>
          </div>

          {/* Metric (Y-Axis) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Metric (Y-Axis)
            </label>
            <select
              id="select-metric"
              value={config.metricKey}
              onChange={(e) => onChangeConfig({ metricKey: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {numericColumns.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Secondary Metric / Grouping */}
          {config.chartType === 'scatter' ? (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Y2 Metric (Scatter)
              </label>
              <select
                id="select-secondary-metric"
                value={config.secondaryMetricKey || ''}
                onChange={(e) => onChangeConfig({ secondaryMetricKey: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">Select comparison...</option>
                {numericColumns.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Sub-Group By (Optional)
              </label>
              <select
                id="select-group-by"
                value={config.groupByKey || ''}
                onChange={(e) => onChangeConfig({ groupByKey: e.target.value || undefined })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">None (Single Series)</option>
                {categoricalOrDateColumns
                  .filter((c) => c.key !== config.dimensionKey)
                  .map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Aggregation */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Aggregation
            </label>
            <select
              id="select-aggregation"
              value={config.aggregation}
              onChange={(e) => onChangeConfig({ aggregation: e.target.value as AggregationType })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="sum">Sum (Total)</option>
              <option value="avg">Average (Mean)</option>
              <option value="count">Count of Rows</option>
              <option value="max">Maximum</option>
              <option value="min">Minimum</option>
            </select>
          </div>

          {/* Sorting / Ordering */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Sort Order
            </label>
            <select
              id="select-sorting"
              value={config.sortOrder}
              onChange={(e) => onChangeConfig({ sortOrder: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="none">Dataset Natural</option>
              <option value="metric-desc">Value (High to Low)</option>
              <option value="metric-asc">Value (Low to High)</option>
              <option value="dimension-asc">Category (A-Z)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
