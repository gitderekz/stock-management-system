// Export products to CSV
export const exportToCSV = (products, filename = 'products.csv') => {
  if (!products || products.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = ['ID', 'Name', 'Brand', 'Category', 'Quantity', 'Price', 'Condition', 'Serial Code'];
  const rows = products.map((product) => [
    product.id,
    product.name,
    product.brand,
    product.category,
    product.quantity,
    product.price,
    product.condition,
    product.serialCode,
  ]);

  const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  downloadFile(blob, filename);
};

// Export products to Excel (using simple CSV format for now)
export const exportToExcel = (products, filename = 'products.xlsx') => {
  if (!products || products.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = ['ID', 'Name', 'Brand', 'Category', 'Quantity', 'Price', 'Condition', 'Serial Code'];
  const rows = products.map((product) => [
    product.id,
    product.name,
    product.brand,
    product.category,
    product.quantity,
    product.price,
    product.condition,
    product.serialCode,
  ]);

  // Simple Excel format (can be improved with xlsx library)
  const xlsxContent = [headers, ...rows].map((row) => row.join('\t')).join('\n');

  const blob = new Blob([xlsxContent], { type: 'application/vnd.ms-excel' });
  downloadFile(blob, filename);
};

// Export products to PDF (using jsPDF + autoTable)
export const exportToPDF = async (products, filename = 'products.pdf') => {
  if (!products || products.length === 0) {
    alert('No data to export');
    return;
  }

  try {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default || (await import('jspdf-autotable'));

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });
    const title = 'Product Inventory Report';
    doc.setFontSize(18);
    doc.text(title, 40, 40);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 60);

    const headers = ['ID', 'Name', 'Brand', 'Category', 'Qty', 'Price', 'Condition', 'Serial'];
    const rows = products.map((p) => [p.id, p.name, p.brand || '', p.category || '', p.quantity || 0, p.price || 0, p.condition || '', p.serialCode || '']);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 80,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [45, 108, 223] },
      theme: 'striped',
    });

    const pdfData = doc.output('blob');
    downloadFile(pdfData, filename);
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
        const products = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v) => v.trim().replace(/"/g, ''));
          if (values.length === headers.length) {
            products.push({
              name: values[1],
              brand: values[2],
              category: values[3],
              quantity: parseInt(values[4]) || 0,
              price: parseInt(values[5]) || 0,
              condition: values[6],
              serialCode: values[7],
            });
          }
        }

        resolve(products);
      } catch (error) {
        reject(new Error('Failed to parse CSV file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Import Excel file (simplified - reads as CSV)
export const importFromExcel = (file) => {
  return importFromCSV(file);
};

// Helper function to download file
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
