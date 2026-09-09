export type ColumnType = 'number' | 'string' | 'date' | 'boolean';

export interface ColumnMeta {
  key: string;
  label: string;
  type: ColumnType;
  uniqueValues?: string[];
  min?: number;
  max?: number;
  sampleValue?: any;
}

export type DataRow = Record<string, any>;

export interface Dataset {
  id: string;
  title: string;
  description: string;
  data: DataRow[];
  columns: ColumnMeta[];
}

export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max';

export type ChartType = 'overview' | 'bar' | 'line' | 'area' | 'pie' | 'scatter' | 'radar' | 'table';

export interface ChartConfig {
  chartType: ChartType;
  dimensionKey: string;
  metricKey: string;
  secondaryMetricKey?: string;
  groupByKey?: string;
  aggregation: AggregationType;
  sortOrder: 'none' | 'metric-desc' | 'metric-asc' | 'dimension-asc';
  limit: number;
  colorTheme: string;
}

export interface FilterState {
  searchQuery: string;
  categoryFilters: Record<string, string[]>;
  dateRange?: { start?: string; end?: string };
}
