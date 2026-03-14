import { SheetRow } from '../types/sheet';

export function parseSheetData(data: string[][]): SheetRow[] {
  if (!data || data.length < 2) return [];
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    const rowData: SheetRow = {};
    headers.forEach((header, index) => {
      rowData[header] = row[index] || '';
    });
    return rowData;
  });
}