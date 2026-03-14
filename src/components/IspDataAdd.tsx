'use client';

import axios from 'axios';
import { useState } from 'react';

interface ISPData {
  name: string;
  countryId: number;
  domainId: number;
}

export default function IspImporter() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const predefinedIsps: ISPData[] = [
    { name: "jubii.dk", countryId: 1, domainId: 1 },
    { name: "btinternet.com", countryId: 1, domainId: 1 },
    { name: "privat.dk", countryId: 1, domainId: 1 },
    { name: "laposte.net", countryId: 1, domainId: 1 },
    { name: "kier.co.uk", countryId: 1, domainId: 1 },
    { name: "others", countryId: 1, domainId: 1 },
    { name: "gmail.com", countryId: 1, domainId: 1 },
    { name: "telenet.be", countryId: 1, domainId: 1 },
    { name: "hetnet.nl", countryId: 1, domainId: 1 },
    { name: "hotmail.com", countryId: 1, domainId: 1 },
    { name: "live.nl", countryId: 1, domainId: 1 },
    { name: "home.nl", countryId: 1, domainId: 1 },
    { name: "ziggo.nl", countryId: 1, domainId: 1 },
    { name: "planet.nl", countryId: 1, domainId: 1 },
    { name: "outlook.com", countryId: 1, domainId: 1 },
    { name: "quicknet.nl", countryId: 1, domainId: 1 },
    { name: "skynet.be", countryId: 1, domainId: 1 },
    { name: "zeelandnet.nl", countryId: 1, domainId: 1 },
    { name: "kliksafe.nl", countryId: 1, domainId: 1 },
    { name: "casema.nl", countryId: 1, domainId: 1 },
    { name: "chello.nl", countryId: 1, domainId: 1 },
    { name: "upcmail.nl", countryId: 1, domainId: 1 },
    { name: "kpnplanet.nl", countryId: 1, domainId: 1 },
    { name: "xs4all.nl", countryId: 1, domainId: 1 },
    { name: "kpnmail.nl", countryId: 1, domainId: 1 },
    { name: "telfort.nl", countryId: 1, domainId: 1 },
    { name: "yahoo.com", countryId: 1, domainId: 1 },
    { name: "basegrow.com", countryId: 1, domainId: 1 },
    { name: "gmx.de", countryId: 1, domainId: 1 },
    { name: "t-online.de", countryId: 1, domainId: 1 },
    { name: "arcor.de", countryId: 1, domainId: 1 },
    { name: "yahoo.de", countryId: 1, domainId: 1 },
    { name: "hotmail.de", countryId: 1, domainId: 1 },
    { name: "freenet.de", countryId: 1, domainId: 1 },
    { name: "web.de", countryId: 1, domainId: 1 },
    { name: "abc.com", countryId: 1, domainId: 1 },
    { name: "icloud.com", countryId: 1, domainId: 1 },
    { name: "googlemail.com", countryId: 1, domainId: 1 },
    { name: "pandora.be", countryId: 1, domainId: 1 },
    { name: "lhsystems.com", countryId: 1, domainId: 1 },
    { name: "travelctm.com", countryId: 1, domainId: 1 },
    { name: "aexp.com", countryId: 1, domainId: 1 },
    { name: "dlh.de", countryId: 1, domainId: 1 },
    { name: "me.com", countryId: 1, domainId: 1 },
    { name: "mail.dk", countryId: 1, domainId: 1 },
    { name: "outlook.dk", countryId: 1, domainId: 1 },
    { name: "stofanet.dk", countryId: 1, domainId: 1 },
    { name: "live.dk", countryId: 1, domainId: 1 },
    { name: "yahoo.dk", countryId: 1, domainId: 1 },
    { name: "hotmail.dk", countryId: 1, domainId: 1 },
    { name: "telia.com", countryId: 1, domainId: 1 },
    { name: "yahoo.se", countryId: 1, domainId: 1 },
    { name: "hotmail.se", countryId: 1, domainId: 1 },
    { name: "live.se", countryId: 1, domainId: 1 },
    { name: "yahoo.fr", countryId: 1, domainId: 1 },
    { name: "hotmail.fr", countryId: 1, domainId: 1 },
    { name: "live.be", countryId: 1, domainId: 1 },
    { name: "hotmail.be", countryId: 1, domainId: 1 },
    { name: "live.fr", countryId: 1, domainId: 1 },
    { name: "live.co.uk", countryId: 1, domainId: 1 },
    { name: "yahoo.co.uk", countryId: 1, domainId: 1 },
    { name: "hotmail.co.uk", countryId: 1, domainId: 1 },
    { name: "webspeed.dk", countryId: 1, domainId: 1 },
    { name: "asda.co.uk", countryId: 1, domainId: 1 },
    { name: "sfr.fr", countryId: 1, domainId: 1 },
    { name: "jubii.dk", countryId: 1, domainId: 1 },
    { name: "btinternet.com", countryId: 1, domainId: 1 },
    { name: "privat.dk", countryId: 1, domainId: 1 },
  ];

  const importPredefinedIsps = async () => {
    setLoading(true);
    setStatus('Importing predefined ISPs...');

    try {
      const response = await fetch('/api/addIsp', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isps: predefinedIsps }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setStatus(`Success! Imported ${data.count} ISP records.`);
      } else {
        setStatus(`Error: ${data.message}`);
      }
    } catch (error) {
      setStatus(`Failed to import ISPs: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const addCustomIsp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus('Adding custom ISP...');
    
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const countryId = parseInt(formData.get('countryId') as string);
    const domainId = parseInt(formData.get('domainId') as string);
    
    // Create ISP data object
    const ispData: ISPData = {
      name,
      countryId,
      domainId
    };

    try {
      // Call the API endpoint we created earlier
      const response = await axios.post('/api/addIsp', ispData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 201) {
        setStatus('ISP added successfully!');
        // Reset the form
        event.currentTarget.reset();
      } else {
        setStatus(`Error: ${response.data.message || 'Unknown error occurred'}`);
      }
    } catch (error) {
      console.log('Error adding ISP:', error);
      if (axios.isAxiosError(error)) {
        setStatus(`Failed to add ISP: ${error.response?.data?.message || error.message}`);
      } else {
        setStatus(`Failed to add ISP: ${error instanceof Error ? error.message : String(error)}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">ISP Management</h1>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Import Predefined ISPs</h2>
        <button
          onClick={importPredefinedIsps}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:bg-blue-300"
        >
          {loading ? 'Importing...' : 'Import All Predefined ISPs'}
        </button>
        <div className="mt-2 text-sm text-gray-600">
          This will import {predefinedIsps.length} predefined ISP records.
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Add Custom ISP</h2>
        <form onSubmit={addCustomIsp} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              ISP Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="countryId" className="block text-sm font-medium text-gray-700">
              Country ID
            </label>
            <input
              type="number"
              id="countryId"
              name="countryId"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="domainId" className="block text-sm font-medium text-gray-700">
              Domain ID
            </label>
            <input
              type="number"
              id="domainId"
              name="domainId"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded disabled:bg-green-300"
          >
            {loading ? 'Adding...' : 'Add ISP'}
          </button>
        </form>
      </div>
      
      {status && (
        <div className={`p-4 rounded ${status.includes('Error') || status.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {status}
        </div>
      )}
    </div>
  );
}