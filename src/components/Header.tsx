import React from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Layers,
  PlusCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Dataset } from '../types';

interface HeaderProps {
  currentDataset: Dataset;
  allDatasets: Dataset[];
  onSelectDataset: (id: string) => void;
  onOpenImport: () => void;
  onExportCSV: () => void;
  onResetDefault: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDataset,
  allDatasets,
  onSelectDataset,
  onOpenImport,
  onExportCSV,
  onResetDefault,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          {/* Logo & Dataset Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Interactive Data Dashboard
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  <Sparkles className="w-3 h-3 mr-1 text-indigo-500" />
                  Live Visualizer
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-md">
                {currentDataset.description}
              </p>
            </div>
          </div>

          {/* Actions & Dataset Switcher */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Dataset Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1">
              <Layers className="w-4 h-4 text-slate-400 ml-1" />
              <select
                id="dataset-selector"
                value={currentDataset.id}
                onChange={(e) => onSelectDataset(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none pr-3 py-1 cursor-pointer"
              >
                {allDatasets.map((ds) => (
                  <option key={ds.id} value={ds.id}>
                    {ds.title} ({ds.data.length} rows)
                  </option>
                ))}
              </select>
            </div>

            {/* Import / Provide Data button */}
            <button
              id="btn-import-data"
              onClick={onOpenImport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Import / Provide Data
            </button>

            {/* Export CSV */}
            <button
              id="btn-export-csv"
              onClick={onExportCSV}
              title="Export Current Data as CSV"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export</span> CSV
            </button>

            {/* Reset */}
            <button
              id="btn-reset-defaults"
              onClick={onResetDefault}
              title="Reset to default datasets"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
