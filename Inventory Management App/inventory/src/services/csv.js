export function exportToCsv(filename, rows) {
  const replacer = (key, value) => (value === null || value === undefined ? '' : value);
  const header = Object.keys(rows[0] || {});
  const csv = [header.join(','), ...rows.map((row) => header.map((field) => JSON.stringify(row[field], replacer)).join(','))].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseCsv(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const text = reader.result;
      const [first, ...lines] = text.split(/\r?\n/);
      const header = first.split(',');
      const rows = lines
        .filter(Boolean)
        .map((line) => {
          const cols = line.split(',');
          const obj = {};
          header.forEach((h, idx) => (obj[h] = cols[idx]));
          return obj;
        });
      resolve({ header, rows });
    };
    reader.readAsText(file);
  });
}
