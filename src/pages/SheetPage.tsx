// import SpreadsheetViewer from '../components/SpreadsheetViewer';
import SpreadsheetViewer from '@/components/SheatViwer';
export default function SpreadsheetPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">User Data</h1>
      <SpreadsheetViewer 
        title="Product Inventory" 
        sheetRange="Sheet1!A1:E100"
        refreshInterval={60000} // Refresh every minute
      />
    </main>
  );
}
