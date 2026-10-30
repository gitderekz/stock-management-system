// Export data of any shape to CSV, Excel, and PDF.
const flattenValue = (value) => {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'object') {
    if (Array.isArray(value)) return value.map((item) => flattenValue(item)).join(', ');
    if (value.name) return value.name;
    if (value.fullName) return value.fullName;
    if (value.label) return value.label;
    if (value.po_number) return value.po_number;
    if (value.email) return value.email;
    return JSON.stringify(value);
  }
  return String(value);
};

const flattenRows = (data) => {
  const items = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.rows) ? data.rows : [];

  return items.map((row) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      return { value: row };
    }

    const flat = {};
    const visit = (obj, prefix = '') => {
      if (!obj || typeof obj !== 'object') {
        if (prefix) flat[prefix] = obj;
        return;
      }

      if (Array.isArray(obj)) {
        flat[prefix || 'value'] = obj.map((item) => flattenValue(item)).join(', ');
        return;
      }

      Object.keys(obj).forEach((key) => {
        const nextPrefix = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
          if (value.name || value.fullName || value.label || value.id || value.email || value.code) {
            flat[nextPrefix] = flattenValue(value);
          } else {
            visit(value, nextPrefix);
          }
        } else {
          flat[nextPrefix] = flattenValue(value);
        }
      });
    };

    visit(row);
    return flat;
  });
};

const getHeaders = (rows) => [...new Set(rows.flatMap((row) => Object.keys(row)))];

const asCSVText = (rows) => {
  if (!rows || rows.length === 0) return '';
  const headers = getHeaders(rows);
  const rowsText = rows.map((row) => headers.map((header) => `"${String(row[header] ?? '').replace(/"/g, '""')}"`).join(','));
  return [headers, ...rowsText].map((line) => Array.isArray(line) ? line.join(',') : line).join('\n');
};

const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Export users to CSV
export const exportToCSV = (data, filename = 'report.csv') => {
  const rows = flattenRows(data);
  if (!rows.length) {
    alert('No data to export');
    return;
  }

  const csvContent = asCSVText(rows);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, filename);
};

// Export users to Excel (using a tab-delimited format that opens in Excel)
export const exportToExcel = (data, filename = 'report.xlsx') => {
  const rows = flattenRows(data);
  if (!rows.length) {
    alert('No data to export');
    return;
  }

  const headers = getHeaders(rows);
  const xlsxContent = [headers, ...rows.map((row) => headers.map((header) => row[header] ?? ''))]
    .map((line) => line.join('\t'))
    .join('\n');

  const blob = new Blob([xlsxContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  downloadFile(blob, filename);
};

// Export users to PDF using jsPDF and autoTable
export const exportToPDF = async (data, filename = 'report.pdf') => {
  const rows = flattenRows(data);
  if (!rows.length) {
    alert('No data to export');
    return;
  }

  try {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default || (await import('jspdf-autotable'));

    const headers = getHeaders(rows);
    const body = rows.map((row) => headers.map((header) => String(row[header] ?? '')));

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });
    doc.setFontSize(18);
    doc.text('Report Export', 40, 40);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 60);

    autoTable(doc, {
      head: [headers],
      body,
      startY: 80,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [45, 108, 223] },
      theme: 'striped',
      overflow: 'linebreak',
      columnStyles: { 0: { cellWidth: 90 } },
    });

    const pdfBlob = doc.output('blob');
    downloadFile(pdfBlob, filename);
  } catch (err) {
    console.error('PDF export failed:', err);
    alert('PDF export failed.');
  }
};

// Import CSV file
import * as XLSX from 'xlsx';

const normalizeImportHeader = (header = '') => {
  return String(header)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');
};

const normalizeImportValue = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  return value;
};

const normalizeProductImportRow = (row = {}) => {
  if (!row || typeof row !== 'object') return {};

  const normalized = {};
  const headerMap = {};

  Object.keys(row).forEach((key) => {
    const canonical = normalizeImportHeader(key);
    headerMap[canonical] = key;
  });

  const assign = (key, value) => {
    if (value === undefined || value === null) return;
    normalized[key] = value;
  };

  const setMappedValue = (aliases, value) => {
    const match = Object.keys(headerMap).find((header) => aliases.includes(header));
    if (!match) return;
    assign(headerMap[match], value);
  };

  Object.keys(row).forEach((key) => {
    const rawValue = normalizeImportValue(row[key]);
    const canonical = normalizeImportHeader(key);

    if (!canonical) return;

    if (['name', 'categoryid', 'brandid', 'supplierid', 'quantity', 'price', 'condition', 'serialcode', 'category', 'brand', 'supplier', 'categoryname', 'brandname', 'suppliername', 'model', 'version', 'description', 'status'].includes(canonical)) {
      if (canonical === 'categoryid') {
        const trimmed = String(rawValue).trim();
        if (trimmed && Number.isNaN(Number(trimmed))) {
          normalized.category = trimmed;
        } else {
          normalized.categoryId = trimmed ? Number(trimmed) : '';
        }
        return;
      }

      if (canonical === 'brandid') {
        const trimmed = String(rawValue).trim();
        if (trimmed && Number.isNaN(Number(trimmed))) {
          normalized.brand = trimmed;
        } else {
          normalized.brandId = trimmed ? Number(trimmed) : '';
        }
        return;
      }

      if (canonical === 'supplierid') {
        const trimmed = String(rawValue).trim();
        if (trimmed && Number.isNaN(Number(trimmed))) {
          normalized.supplier = trimmed;
        } else {
          normalized.supplierId = trimmed ? Number(trimmed) : '';
        }
        return;
      }

      if (canonical === 'quantity') {
        const numeric = rawValue === '' ? 0 : Number(rawValue);
        normalized.quantity = Number.isFinite(numeric) ? numeric : 0;
        return;
      }

      if (canonical === 'price') {
        const numeric = rawValue === '' ? 0 : Number(rawValue);
        normalized.price = Number.isFinite(numeric) ? numeric : 0;
        return;
      }

      if (canonical === 'condition') {
        normalized.condition = String(rawValue || 'new').toLowerCase();
        return;
      }

      if (canonical === 'serialcode' || canonical === 'partnumber' || canonical === 'sku') {
        normalized.serialCode = rawValue;
        return;
      }

      if (canonical === 'category' || canonical === 'categoryname') {
        normalized.category = rawValue;
        return;
      }

      if (canonical === 'brand' || canonical === 'brandname') {
        normalized.brand = rawValue;
        return;
      }

      if (canonical === 'supplier' || canonical === 'suppliername') {
        normalized.supplier = rawValue;
        return;
      }

      if (canonical === 'name' || canonical === 'description' || canonical === 'model' || canonical === 'version' || canonical === 'status') {
        normalized[canonical === 'name' ? 'name' : canonical] = rawValue;
      }
    }
  });

  if (!normalized.name) return null;

  const finalRow = {
    name: normalized.name || '',
    categoryId: normalized.categoryId ?? (normalized.category ? undefined : ''),
    brandId: normalized.brandId ?? (normalized.brand ? undefined : ''),
    supplierId: normalized.supplierId ?? (normalized.supplier ? undefined : ''),
    quantity: Number(normalized.quantity ?? 0),
    price: Number(normalized.price ?? 0),
    condition: normalized.condition || 'new',
    serialCode: normalized.serialCode || '',
  };

  if (normalized.category) finalRow.category = normalized.category;
  if (normalized.brand) finalRow.brand = normalized.brand;
  if (normalized.supplier) finalRow.supplier = normalized.supplier;
  if (normalized.description !== undefined) finalRow.description = normalized.description;
  if (normalized.model !== undefined) finalRow.model = normalized.model;
  if (normalized.version !== undefined) finalRow.version = normalized.version;
  if (normalized.status !== undefined) finalRow.status = normalized.status;

  return finalRow;
};

const parseDelimitedLine = (line, delimiter) => {
  const result = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
};

const parseDelimitedText = (text) => {
  const possibleDelimiters = [',', ';', '\t', '|'];
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];

  const detectDelimiter = (firstLine) => {
    const counts = possibleDelimiters.map((delimiter) => ({
      delimiter,
      count: (firstLine.match(new RegExp(`\\${delimiter}`, 'g')) || []).length,
    }));

    const max = counts.sort((a, b) => b.count - a.count)[0];
    return max && max.count > 0 ? max.delimiter : ',';
  };

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseDelimitedLine(lines[0], delimiter).map((header) => header.replace(/^['"]|['"]$/g, '').trim());
  const rows = [];

  for (let i = 1; i < lines.length; i += 1) {
    const values = parseDelimitedLine(lines[i], delimiter);
    if (!values.length) continue;

    const row = {};
    headers.forEach((header, index) => {
      const value = values[index] !== undefined ? values[index].replace(/^['"]|['"]$/g, '').trim() : '';
      row[header] = value;
    });

    const normalized = normalizeProductImportRow(row);
    if (normalized) rows.push(normalized);
  }

  return rows;
};

export const importFromCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = String(event.target?.result || '');
        const rows = parseDelimitedText(text);
        resolve(rows);
      } catch (error) {
        reject(new Error('Failed to parse CSV file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const importFromExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });
        const rows = json.map((row) => normalizeProductImportRow(row)).filter(Boolean);
        resolve(rows);
      } catch (error) {
        reject(new Error('Failed to parse Excel file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

export const importFromXLSX = importFromExcel;
