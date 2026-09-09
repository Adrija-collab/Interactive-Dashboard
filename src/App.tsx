import React, { useState, useMemo, useEffect } from 'react';
import { sampleDatasets } from './data/sampleDatasets';
import { ChartConfig, Dataset } from './types';
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { FilterBar } from './components/FilterBar';
import { ChartControls } from './components/ChartControls';
import { ChartsView } from './components/ChartsView';
import { DataTable } from './components/DataTable';
import { DataImportModal } from './components/DataImportModal';
import { FileSpreadsheet, Sparkles, Upload } from 'lucide-react';

export default function App() {
  const [datasets, setDatasets] = useState<Dataset[]>(() => {
    const saved = localStorage.getItem('app_datasets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return sampleDatasets;
  });

  const [activeDatasetId, setActiveDatasetId] = useState<string>(() => {
    return sampleDatasets[0].id;
  });

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active dataset reference
  const currentDataset = useMemo(() => {
    return datasets.find((d) => d.id === activeDatasetId) || datasets[0];
  }, [datasets, activeDatasetId]);

  // Derive initial or valid dimension and metric columns
  const numericColumns = useMemo(
    () => currentDataset.columns.filter((c) => c.type === 'number'),
    [currentDataset]
  );
  const categoricalOrDateColumns = useMemo(
    () => currentDataset.columns.filter((c) => c.type === 'string' || c.type === 'date'),
    [currentDataset]
  );

  // Chart configuration state
  const [chartConfig, setChartConfig] = useState<ChartConfig>(() => ({
    chartType: 'overview',
    dimensionKey: categoricalOrDateColumns[0]?.key || currentDataset.columns[0]?.key || '',
    metricKey: numericColumns[0]?.key || '',
    secondaryMetricKey: numericColumns[1]?.key || numericColumns[0]?.key || '',
    aggregation: 'sum',
    sortOrder: 'none',
    limit: 50,
    colorTheme: 'indigo',
  }));

  // Keep dimension & metric synchronized whenever dataset changes
  useEffect(() => {
    const validDim =
      categoricalOrDateColumns.find((c) => c.key === chartConfig.dimensionKey) ||
      categoricalOrDateColumns[0] ||
      currentDataset.columns[0];

    const validMetric =
      numericColumns.find((c) => c.key === chartConfig.metricKey) ||
      numericColumns[0];

    const validSecMetric =
      numericColumns.find((c) => c.key === chartConfig.secondaryMetricKey && c.key !== validMetric?.key) ||
      numericColumns.find((c) => c.key !== validMetric?.key) ||
      numericColumns[0];

    setChartConfig((prev) => ({
      ...prev,
      dimensionKey: validDim ? validDim.key : '',
      metricKey: validMetric ? validMetric.key : '',
      secondaryMetricKey: validSecMetric ? validSecMetric.key : '',
      groupByKey: undefined,
    }));
    setSelectedFilters({});
    setSearchQuery('');
  }, [activeDatasetId]);

  // Persist datasets in local storage
  useEffect(() => {
    try {
      localStorage.setItem('app_datasets', JSON.stringify(datasets));
    } catch {
      // ignore storage quota errors
    }
  }, [datasets]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    let result = currentDataset.data;

    // 1. Text Search across all properties
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((val) =>
          String(val ?? '').toLowerCase().includes(q)
        )
      );
    }

    // 2. Specific column dropdown filters
    Object.entries(selectedFilters).forEach(([colKey, filterVal]) => {
      if (filterVal) {
        result = result.filter((row) => String(row[colKey]) === filterVal);
      }
    });

    return result;
  }, [currentDataset, searchQuery, selectedFilters]);

  // Handle custom dataset imported
  const handleImportSuccess = (newDataset: Dataset) => {
    setDatasets((prev) => [newDataset, ...prev]);
    setActiveDatasetId(newDataset.id);
    showToast(`Loaded "${newDataset.title}" with ${newDataset.data.length} records!`);
  };

  // Reset to default sample datasets
  const handleResetDefaults = () => {
    localStorage.removeItem('app_datasets');
    setDatasets(sampleDatasets);
    setActiveDatasetId(sampleDatasets[0].id);
    showToast('Reset to default sample datasets');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Export current data as CSV
  const handleExportCSV = () => {
    if (!filteredRows.length) return;
    const cols = currentDataset.columns;
    const headerRow = cols.map((c) => c.key).join(',');
    const dataRows = filteredRows.map((r) =>
      cols.map((c) => JSON.stringify(r[c.key] ?? '')).join(',')
    );
    const csvString = [headerRow, ...dataRows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${currentDataset.title.replace(/\s+/g, '_')}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported CSV successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Header */}
      <Header
        currentDataset={currentDataset}
        allDatasets={datasets}
        onSelectDataset={setActiveDatasetId}
        onOpenImport={() => setIsImportModalOpen(true)}
        onExportCSV={handleExportCSV}
        onResetDefault={handleResetDefaults}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top KPI Metric Summary Cards */}
        <KpiCards
          rows={filteredRows}
          totalRows={currentDataset.data.length}
          columns={currentDataset.columns}
          activeMetricKey={chartConfig.metricKey}
        />

        {/* Global Filter Bar */}
        <FilterBar
          columns={currentDataset.columns}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedFilters={selectedFilters}
          onFilterChange={(k, v) => setSelectedFilters((p) => ({ ...p, [k]: v }))}
          onResetFilters={() => {
            setSelectedFilters({});
            setSearchQuery('');
          }}
          filteredCount={filteredRows.length}
          totalCount={currentDataset.data.length}
        />

        {/* Chart View Switcher & Axis Selectors */}
        <ChartControls
          config={chartConfig}
          onChangeConfig={(newCfg) => setChartConfig((prev) => ({ ...prev, ...newCfg }))}
          columns={currentDataset.columns}
        />

        {/* Main Visualization Display */}
        {chartConfig.chartType === 'table' ? (
          <DataTable
            rows={filteredRows}
            columns={currentDataset.columns}
            datasetTitle={currentDataset.title}
          />
        ) : (
          <ChartsView
            rows={filteredRows}
            columns={currentDataset.columns}
            config={chartConfig}
            onChangeConfig={(newCfg) => setChartConfig((prev) => ({ ...prev, ...newCfg }))}
          />
        )}
      </main>

      {/* Data Import Modal */}
      <DataImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
}
