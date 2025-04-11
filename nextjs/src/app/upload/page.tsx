'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import FileUpload from '@/components/FileUpload';

export default function UploadPage() {
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUploadSuccess = (data: any) => {
    setUploadResult(data);
    setUploadError(null);
  };

  const handleUploadError = (error: Error) => {
    setUploadError(error.message);
    setUploadResult(null);
  };

  return (
    <div className="flex-1 bg-gray-900 flex flex-col min-h-screen">
      <Navbar />
      <main className="p-8 flex-1 max-w-7xl mx-auto w-full">
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700">
          <div className="p-8">
            <h1 className="text-2xl font-light text-gray-200 mb-4">Update Tour Guide Database</h1>
            <p className="text-gray-400 mb-8">Upload a CSV file containing tour guide information to populate the database.</p>
            
            <FileUpload 
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
            
            {uploadResult && (
              <div className="mt-6 p-4 bg-green-900 text-green-200 rounded-md">
                <h3 className="font-medium mb-2">Upload Successful!</h3>
                <p>Your tour guide data has been successfully processed and stored in the database.</p>
                <pre className="mt-2 p-2 bg-gray-800 rounded text-xs overflow-auto">
                  {JSON.stringify(uploadResult, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm">
                <a 
                  href="/tour-guides-template.csv" 
                  download
                  className="text-gray-400 hover:text-gray-200 font-light"
                >
                  Download template
                </a>
              </div>
              <Link href="/tour-guides">
                <button 
                  className="btn bg-gray-600 text-white hover:bg-gray-500 border-none"
                  disabled={!uploadResult}
                >
                  View Tour Guides
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 