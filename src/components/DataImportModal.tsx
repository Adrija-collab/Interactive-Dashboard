import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ClipboardPaste,
  Database,
  ArrowRight,
} from 'lucide-react';
import { Dataset } from '../types';
import { parseCSVData, parseJSONData } from '../utils/dataParser';

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (dataset: Dataset) => void;
}

export const DataImportModal: React.FC<DataImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [inputText, setInputText] = useState('');
  const [datasetTitle, setDatasetTitle] = useState('My Custom Dataset');
  const [parsedResult, setParsedResult] = useState<{
    data: any[];
    columns: any[];
    error?: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleParseText = (text: string) => {
    setInputText(text);
    const trimmed = text.trim();
    if (!trimmed) {
      setParsedResult(null);
      return;
    }

    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      const res = parseJSONData(trimmed);
      setParsedResult(res);
    } else {
      const res = parseCSVData(trimmed);
      setParsedResult(res);
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setDatasetTitle(file.name.replace(/\.[^/.]+$/, ''));
        handleParseText(content);
        setActiveTab('paste');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleApply = () => {
    if (!parsedResult || !parsedResult.data || parsedResult.data.length === 0) return;

    const newDataset: Dataset = {
      id: `custom-${Date.now()}`,
      title: datasetTitle.trim() || 'Custom Dataset',
      description: `User-imported dataset containing ${parsedResult.data.length} records and ${parsedResult.columns.length} columns.`,
      data: parsedResult.data,
      columns: parsedResult.columns,
    };

    onImportSuccess(newDataset);
    onClose();
  };

  const loadDemoCSV = () => {
    const sample = `City,Quarter,Revenue,OperatingCost,Customers,CustomerSatisfaction
New York,Q1,184000,124000,4120,4.8
London,Q1,142000,98000,2890,4.6
Tokyo,Q1,215000,140000,5310,4.9
Paris,Q1,96000,68000,1950,4.3
Sydney,Q1,88000,59000,1620,4.5
New York,Q2,204000,131000,4650,4.9
London,Q2,165000,105000,3420,4.7
Tokyo,Q2,238000,152000,5980,4.9
Paris,Q2,112000,74000,2310,4.4
Sydney,Q2,99000,64000,1890,4.6`;

    setDatasetTitle('Global Quarterly Operations');
    handleParseText(sample);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="data-import-modal-content"
        className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Provide or Import Your Data
              </h2>
              <p className="text-xs text-slate-500">
                Paste tabular data (CSV/TSV) or JSON array, or drop a file to visualize
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Dataset Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dataset Name
            </label>
            <input
              type="text"
              value={datasetTitle}
              onChange={(e) => setDatasetTitle(e.target.value)}
              placeholder="e.g., Annual Sales 2024, Survey Results..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Import Modes: Paste vs Upload */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('paste')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeTab === 'paste'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              Paste Data (CSV / JSON)
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Upload File
            </button>

            <div className="ml-auto">
              <button
                onClick={loadDemoCSV}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                Fill Sample Template
              </button>
            </div>
          </div>

          {activeTab === 'paste' ? (
            <div>
              <textarea
                id="raw-data-textarea"
                value={inputText}
                onChange={(e) => handleParseText(e.target.value)}
                placeholder={`Paste comma-separated rows or JSON:\n\nMonth,Region,Sales,Profit\nJan,East,45000,12000\nFeb,East,52000,15000\nMar,West,61000,19000`}
                rows={6}
                className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder-slate-400"
              />
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                Drag and drop your file here, or{' '}
                <label className="text-indigo-600 hover:underline cursor-pointer">
                  browse
                  <input
                    type="file"
                    accept=".csv,.json,.tsv,.txt"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports .csv, .tsv, and .json files
              </p>
            </div>
          )}

          {/* Parsing Results & Live Preview */}
          {parsedResult && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              {parsedResult.error ? (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{parsedResult.error}</span>
                </div>
              ) : (
                <div className="p-3 bg-slate-50/60 border-b border-slate-200">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Ready to load:</span>
                      <span className="text-slate-600 font-normal">
                        {parsedResult.data.length} rows &bull; {parsedResult.columns.length} columns detected
                      </span>
                    </div>
                  </div>

                  {/* Detected Column Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {parsedResult.columns.map((col: any) => (
                      <span
                        key={col.key}
                        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-white border border-slate-200 text-slate-700"
                      >
                        {col.label}
                        <span
                          className={`ml-1 text-[9px] px-1 rounded ${
                            col.type === 'number'
                              ? 'bg-blue-100 text-blue-700'
                              : col.type === 'date'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {col.type}
                        </span>
                      </span>
                    ))}
                  </div>

                  {/* First 3 preview rows */}
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left text-[11px] text-slate-600">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                          {parsedResult.columns.slice(0, 5).map((col: any) => (
                            <th key={col.key} className="py-1 px-2">
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsedResult.data.slice(0, 3).map((row, idx) => (
                          <tr key={idx} className="border-b border-slate-100">
                            {parsedResult.columns.slice(0, 5).map((col: any) => (
                              <td key={col.key} className="py-1 px-2 truncate max-w-[120px]">
                                {String(row[col.key] ?? '-')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="btn-apply-dataset"
            disabled={!parsedResult || !!parsedResult.error || parsedResult.data.length === 0}
            onClick={handleApply}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
          >
            <span>Apply to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
