// components/ExcelImportForm.jsx
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ExcelImportForm() {
  const [file, setFile] = useState(null);
  const [forOrg, setForOrg] = useState('');
  const [uploadedBy, setUploadedBy] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const router = useRouter();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check if file is Excel or CSV
      const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
      if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError('');
      } else {
        setFile(null);
        setError('Please select a valid Excel (.xls, .xlsx) or CSV file');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    if (!forOrg.trim()) {
      setError('Organization field is required');
      return;
    }
    
    if (!uploadedBy.trim()) {
      setError('Uploaded by field is required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('for_org', forOrg);
    formData.append('uploaded_by', uploadedBy);
    
    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to import file');
      }
      
      setResult(data.result);
      // Optional: Redirect or show success message
    } catch (err) {
      setError(err.message || 'An error occurred during upload');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setForOrg('');
    setUploadedBy('');
    setError('');
    setResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-20 border-gray-100 border">
      <h1 className="text-2xl font-bold mb-6">Import Excel/CSV Data</h1>
      
      {result ? (
        <div className="bg-green-50 p-4 rounded-md mb-6">
          <h2 className="text-xl font-semibold text-green-800 mb-2">Import Successful!</h2>
          <div className="mb-4">
            <p><span className="font-medium">Organization:</span> {result.for_org}</p>
            <p><span className="font-medium">Uploaded By:</span> {result.uploaded_by}</p>
            <p><span className="font-medium">File Type:</span> {result.file_type}</p>
            <p><span className="font-medium">Rows Imported:</span> {result.rows_count}</p>
          </div>
          
          {result.sample_data && result.sample_data.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Sample Data (First 3 rows):</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(result.sample_data[0]).map((key) => (
                        <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {result.sample_data.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, i) => (
                          <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {value?.toString()}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <button
            onClick={resetForm}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Import Another File
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="for_org" className="block text-sm font-medium text-gray-700">
              Organization *
            </label>
            <input
              type="text"
              id="for_org"
              value={forOrg}
              onChange={(e) => setForOrg(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Enter organization name"
              required
            />
          </div>
          
          <div>
            <label htmlFor="uploaded_by" className="block text-sm font-medium text-gray-700">
              Uploaded By *
            </label>
            <input
              type="text"
              id="uploaded_by"
              value={uploadedBy}
              onChange={(e) => setUploadedBy(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Enter your name"
              required
            />
          </div>
          
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700">
              Excel/CSV File *
            </label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              accept=".xlsx,.xls,.csv"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Accepted formats: .xlsx, .xls, .csv
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded">
              {error}
            </div>
          )}
          
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Uploading...' : 'Import Data'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}