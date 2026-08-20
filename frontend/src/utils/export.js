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
export const importFromCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const csv = event.target.result;
        const lines = csv.split('\n').filter((line) => line.trim());
        const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
        const items = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v) => v.trim().replace(/"/g, ''));
          if (values.length === headers.length) {
            const item = {};
            headers.forEach((header, idx) => {
              item[header] = values[idx];
            });
            items.push(item);
          }
        }

        resolve(items);
      } catch (error) {
        reject(new Error('Failed to parse CSV file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const importFromExcel = (file) => importFromCSV(file);
