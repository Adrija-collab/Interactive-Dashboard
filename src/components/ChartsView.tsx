import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ZAxis,
} from 'recharts';
import { ChartConfig, ColumnMeta, DataRow } from '../types';
import { aggregateData, formatMetricValue } from '../utils/dataParser';
import { Maximize2, Sparkles, TrendingUp } from 'lucide-react';

interface ChartsViewProps {
  rows: DataRow[];
  columns: ColumnMeta[];
  config: ChartConfig;
  onChangeConfig: (newConfig: Partial<ChartConfig>) => void;
}

const PALETTES: Record<string, string[]> = {
  indigo: ['#4f46e5', '#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'],
  emerald: ['#059669', '#10b981', '#14b8a6', '#06b6d4', '#84cc16', '#3b82f6', '#f59e0b', '#6366f1'],
  amber: ['#d97706', '#f59e0b', '#f97316', '#ef4444', '#84cc16', '#059669', '#4f46e5', '#8b5cf6'],
  rose: ['#e11d48', '#f43f5e', '#fb7185', '#be123c', '#9f1239', '#fb923c', '#a855f7', '#6366f1'],
  slate: ['#334155', '#475569', '#64748b', '#94a3b8', '#1e293b', '#0f172a', '#6366f1', '#0ea5e9'],
};

// Custom Tooltip component for Recharts
const CustomTooltip = ({ active, payload, label, metricName }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white text-xs rounded-lg p-2.5 shadow-lg border border-slate-800">
        <p className="font-semibold text-slate-200 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            <span className="text-slate-300 font-medium">
              {entry.name || metricName}:
            </span>
            <span className="font-bold text-white">
              {formatMetricValue(entry.value, entry.name || metricName)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const ChartsView: React.FC<ChartsViewProps> = ({
  rows,
  columns,
  config,
  onChangeConfig,
}) => {
  const palette = PALETTES[config.colorTheme] || PALETTES.indigo;

  // Prepare aggregated data
  const { chartData, seriesKeys } = aggregateData(
    rows,
    config.dimensionKey,
    config.metricKey,
    config.aggregation,
    config.groupByKey
  );

  // Apply sorting if configured
  let sortedData = [...chartData];
  if (config.sortOrder === 'metric-desc') {
    sortedData.sort((a, b) => (Number(b[config.metricKey]) || 0) - (Number(a[config.metricKey]) || 0));
  } else if (config.sortOrder === 'metric-asc') {
    sortedData.sort((a, b) => (Number(a[config.metricKey]) || 0) - (Number(b[config.metricKey]) || 0));
  } else if (config.sortOrder === 'dimension-asc') {
    sortedData.sort((a, b) =>
      String(a[config.dimensionKey]).localeCompare(String(b[config.dimensionKey]))
    );
  }

  // Find second metric for scatter
  const secondaryMetric = config.secondaryMetricKey || (columns.find(c => c.type === 'number' && c.key !== config.metricKey)?.key || config.metricKey);

  // OVERVIEW MULTI-CHART VIEW
  if (config.chartType === 'overview') {
    // 1. Time / Sequential Trend
    const dateOrDimCol = columns.find(c => c.type === 'date' || c.key.toLowerCase().includes('date') || c.key.toLowerCase().includes('month')) || columns[0];
    const trendAgg = aggregateData(rows, dateOrDimCol.key, config.metricKey, 'sum');

    // 2. Secondary Category Breakdown
    const catCol = columns.find(c => c.type === 'string' && c.key !== dateOrDimCol.key && c.uniqueValues && c.uniqueValues.length <= 10) || columns.find(c => c.type === 'string') || columns[1];
    const catAgg = catCol ? aggregateData(rows, catCol.key, config.metricKey, 'sum') : { chartData: [] };

    // 3. Top Performers / Bar Ranking
    const topBarData = [...(catAgg.chartData.length > 0 ? catAgg.chartData : trendAgg.chartData)]
      .sort((a, b) => (b[config.metricKey] || 0) - (a[config.metricKey] || 0))
      .slice(0, 7);

    return (
      <div className="space-y-6">
        {/* Top Row: Trend Area Chart & Donut Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Trend Line / Area */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {config.metricKey} Trajectory over {dateOrDimCol.label}
                </h3>
                <p className="text-xs text-slate-500">
                  Total aggregated value progression across sequential timeline
                </p>
              </div>
              <button
                onClick={() => onChangeConfig({ chartType: 'area', dimensionKey: dateOrDimCol.key })}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                Expand View
              </button>
            </div>
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendAgg.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="overviewAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={palette[0]} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={palette[0]} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey={dateOrDimCol.key}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => formatMetricValue(val, config.metricKey)}
                  />
                  <Tooltip content={<CustomTooltip metricName={config.metricKey} />} />
                  <Area
                    type="monotone"
                    dataKey={config.metricKey}
                    stroke={palette[0]}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#overviewAreaGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Category Proportion */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {catCol ? `${catCol.label} Breakdown` : 'Proportion Share'}
                </h3>
                <p className="text-xs text-slate-500">
                  Distribution share of {config.metricKey}
                </p>
              </div>
              <button
                onClick={() => onChangeConfig({ chartType: 'pie', dimensionKey: catCol ? catCol.key : config.dimensionKey })}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                Expand View
              </button>
            </div>
            <div className="h-64 sm:h-72 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="70%">
                <PieChart>
                  <Pie
                    data={catAgg.chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey={config.metricKey}
                    nameKey={catCol ? catCol.key : config.dimensionKey}
                  >
                    {catAgg.chartData.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={palette[idx % palette.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip metricName={config.metricKey} />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend Badges */}
              <div className="flex flex-wrap justify-center gap-2 mt-2 max-h-20 overflow-y-auto px-2">
                {catAgg.chartData.slice(0, 6).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1 text-[11px] text-slate-600">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: palette[idx % palette.length] }}
                    />
                    <span className="truncate max-w-[100px]">
                      {item[catCol ? catCol.key : config.dimensionKey]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Bar Ranking & Multi-Metric Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Rankings Bar Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Top Performing Segments
                </h3>
                <p className="text-xs text-slate-500">
                  Comparative analysis sorted by {config.metricKey}
                </p>
              </div>
              <button
                onClick={() => onChangeConfig({ chartType: 'bar', sortOrder: 'metric-desc' })}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                Expand View
              </button>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topBarData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => formatMetricValue(v, config.metricKey)}
                  />
                  <YAxis
                    type="category"
                    dataKey={catCol ? catCol.key : config.dimensionKey}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip metricName={config.metricKey} />} />
                  <Bar
                    dataKey={config.metricKey}
                    fill={palette[0]}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Metrics Summary Matrix */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Data Attribute Highlights
                </h3>
                <p className="text-xs text-slate-500">
                  Overview of all numerical attributes across current active dataset
                </p>
              </div>
              <button
                onClick={() => onChangeConfig({ chartType: 'table' })}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                Full Data Table
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 my-auto">
              {columns
                .filter((c) => c.type === 'number')
                .slice(0, 4)
                .map((col) => {
                  const vals = rows.map((r) => Number(r[col.key])).filter((n) => !isNaN(n));
                  const sum = vals.reduce((a, b) => a + b, 0);
                  const avg = vals.length ? sum / vals.length : 0;
                  return (
                    <div
                      key={col.key}
                      onClick={() => onChangeConfig({ metricKey: col.key })}
                      className={`p-3 rounded-lg border transition cursor-pointer ${
                        config.metricKey === col.key
                          ? 'border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500'
                          : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-1">
                        <span className="truncate">{col.label}</span>
                        {config.metricKey === col.key && (
                          <span className="text-[10px] font-bold text-indigo-600 uppercase">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-base font-bold text-slate-900">
                        {formatMetricValue(sum, col.key)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Avg: {formatMetricValue(avg, col.key)}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>Click any metric card above to focus chart visualizers</span>
              <button
                onClick={() => onChangeConfig({ chartType: 'radar' })}
                className="text-xs font-medium text-indigo-600 hover:underline cursor-pointer"
              >
                Radar Profile &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // BAR CHART
  if (config.chartType === 'bar') {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {config.metricKey} by {config.dimensionKey}
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated ({config.aggregation.toUpperCase()}) distribution
              {config.groupByKey ? ` grouped by ${config.groupByKey}` : ''}
            </p>
          </div>
        </div>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey={config.dimensionKey}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatMetricValue(v, config.metricKey)}
              />
              <Tooltip content={<CustomTooltip metricName={config.metricKey} />} />
              {seriesKeys.length > 1 && <Legend />}
              {seriesKeys.map((series, idx) => (
                <Bar
                  key={series}
                  dataKey={series}
                  fill={palette[idx % palette.length]}
                  radius={[4, 4, 0, 0]}
                  name={series}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // LINE CHART
  if (config.chartType === 'line') {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {config.metricKey} Trend over {config.dimensionKey}
            </h3>
            <p className="text-xs text-slate-500">
              Continuous trend line visualization
              {config.groupByKey ? ` with series for each ${config.groupByKey}` : ''}
            </p>
          </div>
        </div>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sortedData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey={config.dimensionKey}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatMetricValue(v, config.metricKey)}
              />
              <Tooltip content={<CustomTooltip metricName={config.metricKey} />} />
              {seriesKeys.length > 1 && <Legend />}
              {seriesKeys.map((series, idx) => (
                <Line
                  key={series}
                  type="monotone"
                  dataKey={series}
                  stroke={palette[idx % palette.length]}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: palette[idx % palette.length] }}
                  activeDot={{ r: 6 }}
                  name={series}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // AREA CHART
  if (config.chartType === 'area') {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Cumulative {config.metricKey} across {config.dimensionKey}
            </h3>
            <p className="text-xs text-slate-500">
              Area fill volume progression
            </p>
          </div>
        </div>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sortedData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <defs>
                {seriesKeys.map((series, idx) => (
                  <linearGradient key={`grad-${series}`} id={`areaGrad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={palette[idx % palette.length]} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={palette[idx % palette.length]} stopOpacity={0.0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey={config.dimensionKey}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatMetricValue(v, config.metricKey)}
              />
              <Tooltip content={<CustomTooltip metricName={config.metricKey} />} />
              {seriesKeys.length > 1 && <Legend />}
              {seriesKeys.map((series, idx) => (
                <Area
                  key={series}
                  type="monotone"
                  dataKey={series}
                  stroke={palette[idx % palette.length]}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#areaGrad-${idx})`}
                  name={series}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // PIE / DONUT CHART
  if (config.chartType === 'pie') {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {config.metricKey} Share by {config.dimensionKey}
            </h3>
            <p className="text-xs text-slate-500">
              Proportional distribution and percentage share
            </p>
          </div>
        </div>
        <div className="h-96 w-full flex flex-col items-center justify-center">
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={sortedData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={120}
                paddingAngle={2}
                dataKey={config.metricKey}
                nameKey={config.dimensionKey}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
                labelLine={true}
              >
                {sortedData.map((_, idx) => (
                  <Cell key={`cell-${idx}`} fill={palette[idx % palette.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip metricName={config.metricKey} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // SCATTER PLOT
  if (config.chartType === 'scatter') {
    const scatterPoints = rows.map((r, i) => ({
      x: Number(r[config.metricKey]) || 0,
      y: Number(r[secondaryMetric]) || 0,
      label: String(r[config.dimensionKey] || `Record #${i + 1}`),
    }));

    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Correlation: {config.metricKey} vs. {secondaryMetric}
            </h3>
            <p className="text-xs text-slate-500">
              Scatter plot comparing two continuous variables
            </p>
          </div>
        </div>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                type="number"
                dataKey="x"
                name={config.metricKey}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(v) => formatMetricValue(v, config.metricKey)}
                label={{ value: config.metricKey, position: 'insideBottom', offset: -10, fontSize: 12 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name={secondaryMetric}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(v) => formatMetricValue(v, secondaryMetric)}
                label={{ value: secondaryMetric, angle: -90, position: 'insideLeft', offset: 0, fontSize: 12 }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white text-xs rounded-lg p-2.5 shadow-lg">
                        <p className="font-semibold text-slate-200 mb-1">{data.label}</p>
                        <p>
                          {config.metricKey}:{' '}
                          <span className="font-bold">{formatMetricValue(data.x, config.metricKey)}</span>
                        </p>
                        <p>
                          {secondaryMetric}:{' '}
                          <span className="font-bold">{formatMetricValue(data.y, secondaryMetric)}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Records" data={scatterPoints} fill={palette[0]} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // RADAR CHART
  if (config.chartType === 'radar') {
    // Collect numeric metrics for polar axes
    const numericCols = columns.filter((c) => c.type === 'number').slice(0, 6);

    // Normalize values between 0-100 for radar shape comparison
    const radarData = numericCols.map((col) => {
      const maxColVal = Math.max(...rows.map((r) => Number(r[col.key]) || 0), 1);
      const entry: Record<string, any> = { metric: col.label };

      // Top 3 categories
      const topEntities: string[] = Array.from(
        new Set<string>(rows.map((r) => String(r[config.dimensionKey] || 'Other')))
      ).slice(0, 3);
      topEntities.forEach((ent) => {
        const matchingRows = rows.filter((r) => String(r[config.dimensionKey]) === ent);
        const sumVal = matchingRows.reduce((a, r) => a + (Number(r[col.key]) || 0), 0);
        const avgVal = matchingRows.length ? sumVal / matchingRows.length : 0;
        entry[ent] = Math.round((avgVal / maxColVal) * 100);
      });

      return entry;
    });

    const entities: string[] = Array.from(
      new Set<string>(rows.map((r) => String(r[config.dimensionKey] || 'Other')))
    ).slice(0, 3);

    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Multi-Metric Radar Comparison across {config.dimensionKey}
            </h3>
            <p className="text-xs text-slate-500">
              Normalized relative capability index (0 - 100) across key attributes
            </p>
          </div>
        </div>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#475569' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              {entities.map((ent, idx) => (
                <Radar
                  key={ent}
                  name={ent}
                  dataKey={ent}
                  stroke={palette[idx % palette.length]}
                  fill={palette[idx % palette.length]}
                  fillOpacity={0.3}
                />
              ))}
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return null;
};
