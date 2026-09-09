import Papa from 'papaparse';
import { AggregationType, ColumnMeta, ColumnType, DataRow } from '../types';

export function detectColumns(rows: DataRow[]): ColumnMeta[] {
  if (!rows || rows.length === 0) return [];

  const keys = Object.keys(rows[0]);

  return keys.map((key) => {
    let numericCount = 0;
    let validCount = 0;
    let dateCount = 0;
    const uniqueValuesSet = new Set<string>();
    let minVal = Infinity;
    let maxVal = -Infinity;
    let sampleValue = undefined;

    // Scan up to first 200 rows for type inference
    const scanLimit = Math.min(rows.length, 200);
    for (let i = 0; i < scanLimit; i++) {
      const val = rows[i][key];
      if (val !== undefined && val !== null && val !== '') {
        validCount++;
        if (sampleValue === undefined) sampleValue = val;

        const strVal = String(val).trim();
        uniqueValuesSet.add(strVal);

        // Check number
        const cleanedStr = strVal.replace(/^[$,€£¥]/, '').replace(/,/g, '');
        const num = Number(cleanedStr);
        if (!isNaN(num) && cleanedStr !== '') {
          numericCount++;
          if (num < minVal) minVal = num;
          if (num > maxVal) maxVal = num;
        }

        // Check ISO or standard date
        if (
          /^\d{4}-\d{2}(-\d{2})?$/.test(strVal) ||
          /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(strVal) ||
          (strVal.length > 6 && !isNaN(Date.parse(strVal)) && isNaN(Number(strVal)))
        ) {
          dateCount++;
        }
      }
    }

    let type: ColumnType = 'string';
    if (validCount > 0 && numericCount / validCount > 0.8) {
      type = 'number';
    } else if (validCount > 0 && dateCount / validCount > 0.8) {
      type = 'date';
    }

    // Friendly label from camelCase or snake_case
    const label = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]/g, ' ')
      .trim()
      .replace(/^\w/, (c) => c.toUpperCase());

    return {
      key,
      label,
      type,
      uniqueValues: uniqueValuesSet.size <= 50 ? Array.from(uniqueValuesSet) : undefined,
      min: minVal !== Infinity ? minVal : undefined,
      max: maxVal !== -Infinity ? maxVal : undefined,
      sampleValue,
    };
  });
}

export function parseCSVData(csvString: string): { data: DataRow[]; columns: ColumnMeta[]; error?: string } {
  try {
    const result = Papa.parse<Record<string, any>>(csvString.trim(), {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    if (result.errors && result.errors.length > 0 && (!result.data || result.data.length === 0)) {
      return { data: [], columns: [], error: result.errors[0].message };
    }

    const cleanData: DataRow[] = (result.data || []).filter((row) => {
      return Object.values(row).some((val) => val !== null && val !== undefined && val !== '');
    });

    if (cleanData.length === 0) {
      return { data: [], columns: [], error: 'No data rows found in CSV.' };
    }

    const columns = detectColumns(cleanData);
    return { data: cleanData, columns };
  } catch (err: any) {
    return { data: [], columns: [], error: err.message || 'Failed to parse CSV' };
  }
}

export function parseJSONData(jsonString: string): { data: DataRow[]; columns: ColumnMeta[]; error?: string } {
  try {
    const parsed = JSON.parse(jsonString.trim());
    let list: any[] = [];
    if (Array.isArray(parsed)) {
      list = parsed;
    } else if (typeof parsed === 'object' && parsed !== null) {
      const arrayKey = Object.keys(parsed).find((k) => Array.isArray(parsed[k]));
      if (arrayKey) {
        list = parsed[arrayKey];
      } else {
        list = [parsed];
      }
    }

    const cleanData: DataRow[] = list.filter((item) => typeof item === 'object' && item !== null);
    if (cleanData.length === 0) {
      return { data: [], columns: [], error: 'JSON does not contain an array of data objects.' };
    }

    const columns = detectColumns(cleanData);
    return { data: cleanData, columns };
  } catch (err: any) {
    return { data: [], columns: [], error: err.message || 'Invalid JSON format' };
  }
}

export function aggregateData(
  rows: DataRow[],
  dimensionKey: string,
  metricKey: string,
  aggregation: AggregationType = 'sum',
  groupByKey?: string
): { chartData: any[]; seriesKeys: string[] } {
  if (!rows || rows.length === 0 || !dimensionKey || !metricKey) {
    return { chartData: [], seriesKeys: [metricKey] };
  }

  // If groupByKey is provided, we pivot by secondary category
  if (groupByKey && groupByKey !== dimensionKey) {
    const pivotMap = new Map<string, Record<string, { sum: number; count: number; min: number; max: number }>>();
    const allGroups = new Set<string>();

    rows.forEach((row) => {
      const dimVal = String(row[dimensionKey] ?? 'Unknown');
      const groupVal = String(row[groupByKey] ?? 'Other');
      allGroups.add(groupVal);

      let val = Number(row[metricKey]);
      if (isNaN(val)) val = aggregation === 'count' ? 1 : 0;

      if (!pivotMap.has(dimVal)) {
        pivotMap.set(dimVal, {});
      }
      const dimObj = pivotMap.get(dimVal)!;
      if (!dimObj[groupVal]) {
        dimObj[groupVal] = { sum: val, count: 1, min: val, max: val };
      } else {
        dimObj[groupVal].sum += val;
        dimObj[groupVal].count += 1;
        dimObj[groupVal].min = Math.min(dimObj[groupVal].min, val);
        dimObj[groupVal].max = Math.max(dimObj[groupVal].max, val);
      }
    });

    const seriesKeys = Array.from(allGroups);
    const chartData = Array.from(pivotMap.entries()).map(([dimVal, groups]) => {
      const entry: Record<string, any> = { [dimensionKey]: dimVal };
      seriesKeys.forEach((grp) => {
        const stats = groups[grp];
        if (!stats) {
          entry[grp] = 0;
        } else {
          switch (aggregation) {
            case 'avg':
              entry[grp] = stats.count > 0 ? Number((stats.sum / stats.count).toFixed(2)) : 0;
              break;
            case 'count':
              entry[grp] = stats.count;
              break;
            case 'min':
              entry[grp] = stats.min;
              break;
            case 'max':
              entry[grp] = stats.max;
              break;
            case 'sum':
            default:
              entry[grp] = Number(stats.sum.toFixed(2));
              break;
          }
        }
      });
      return entry;
    });

    return { chartData, seriesKeys };
  }

  // Standard 1D aggregation
  const map = new Map<string, { sum: number; count: number; min: number; max: number }>();

  rows.forEach((row) => {
    const dimVal = String(row[dimensionKey] ?? 'Unknown');
    let val = Number(row[metricKey]);
    if (isNaN(val)) val = aggregation === 'count' ? 1 : 0;

    if (!map.has(dimVal)) {
      map.set(dimVal, { sum: val, count: 1, min: val, max: val });
    } else {
      const curr = map.get(dimVal)!;
      curr.sum += val;
      curr.count += 1;
      curr.min = Math.min(curr.min, val);
      curr.max = Math.max(curr.max, val);
    }
  });

  const chartData = Array.from(map.entries()).map(([dimVal, stats]) => {
    let finalValue = stats.sum;
    if (aggregation === 'avg') finalValue = stats.count > 0 ? stats.sum / stats.count : 0;
    if (aggregation === 'count') finalValue = stats.count;
    if (aggregation === 'min') finalValue = stats.min;
    if (aggregation === 'max') finalValue = stats.max;

    return {
      [dimensionKey]: dimVal,
      [metricKey]: Number(finalValue.toFixed(2)),
      count: stats.count,
    };
  });

  return { chartData, seriesKeys: [metricKey] };
}

export function formatMetricValue(val: number | string | undefined | null, columnName?: string): string {
  if (val === undefined || val === null) return '-';
  if (typeof val === 'string') {
    const num = Number(val);
    if (isNaN(num)) return val;
    val = num;
  }

  const colLower = (columnName || '').toLowerCase();
  const isCurrency =
    colLower.includes('revenue') ||
    colLower.includes('sales') ||
    colLower.includes('cost') ||
    colLower.includes('price') ||
    colLower.includes('mrr') ||
    colLower.includes('profit') ||
    colLower.includes('spend');

  const isPercent =
    colLower.includes('rate') ||
    colLower.includes('percent') ||
    colLower.includes('ratio') ||
    colLower.includes('roi') ||
    colLower.includes('nps');

  if (isCurrency) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: val >= 100 ? 0 : 2,
      notation: Math.abs(val) >= 1_000_000 ? 'compact' : 'standard',
    }).format(val);
  }

  if (isPercent && Math.abs(val) <= 100) {
    return `${val.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`;
  }

  if (Math.abs(val) >= 1_000_000) {
    return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(val);
  }

  return val.toLocaleString('en-US', { maximumFractionDigits: 2 });
}
