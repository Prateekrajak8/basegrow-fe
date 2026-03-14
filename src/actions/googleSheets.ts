import { parseSheetData } from '../utils/sheetParser';
import { SheetRow } from '../types/sheet';

export async function fetchSheetData(range = 'Sheet1!A1:Z1000',spreadSheetUrl:string): Promise<{
  raw: string[][],
  parsed: SheetRow[],
  timestamp: number
}> {
  try {
    const response = await fetch(`/api/sheet-data?range=${encodeURIComponent(range)}&url=${encodeURIComponent(spreadSheetUrl)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch sheet data');
    }
    const result = await response.json();
    const rawData = result?.data || [];
    return {
      raw: rawData,
      parsed: parseSheetData(rawData),
      timestamp: Date.now()
    };
  } catch (error) {
    console.log('Error fetching spreadsheet data:', error);
    throw error;
  }
}
