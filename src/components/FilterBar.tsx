import React from 'react';
import { Search, X, Filter, RefreshCw } from 'lucide-react';
import { ColumnMeta } from '../types';

interface FilterBarProps {
  columns: ColumnMeta[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilters: Record<string, string>;
  onFilterChange: (columnKey: string, value: string) => void;
  onResetFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  columns,
  searchQuery,
  onSearchChange,
  selectedFilters,
  onFilterChange,
  onResetFilters,
  filteredCount,
  totalCount,
}) => {
  // Find categorical columns with unique values suitable for quick dropdown filter
  const filterableCols = columns.filter(
    (c) => c.type === 'string' && c.uniqueValues && c.uniqueValues.length >= 2 && c.uniqueValues.length <= 25
  );

  const activeFilterCount =
    Object.values(selectedFilters).filter(Boolean).length + (searchQuery.trim() ? 1 : 0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 mb-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search & Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[200px] max-w-xs flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="filter-search-input"
              type="text"
              placeholder="Search across all fields..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Categorical Select Dropdowns */}
          {filterableCols.slice(0, 3).map((col) => (
            <div key={col.key} className="flex items-center gap-1.5">
              <label htmlFor={`filter-select-${col.key}`} className="text-xs font-medium text-slate-500 whitespace-nowrap hidden sm:inline">
                {col.label}:
              </label>
              <select
                id={`filter-select-${col.key}`}
                value={selectedFilters[col.key] || ''}
                onChange={(e) => onFilterChange(col.key, e.target.value)}
                className="text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">All {col.label}s</option>
                {col.uniqueValues?.map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Clear Filters Button */}
          {activeFilterCount > 0 && (
            <button
              id="btn-clear-filters"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-1 rounded-md transition"
            >
              <RefreshCw className="w-3 h-3" />
              Reset ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Row count status */}
        <div className="flex items-center justify-between sm:justify-end text-xs text-slate-500 gap-2">
          <span className="font-medium text-slate-700">{filteredCount}</span>
          <span>of {totalCount} records showing</span>
        </div>
      </div>
    </div>
  );
};
