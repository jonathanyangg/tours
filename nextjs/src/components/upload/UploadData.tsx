'use client';

import { useState } from 'react';
import Link from 'next/link';
import FileUpload from '@/components/FileUpload';

export default function UploadData() {
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
    <div className="card bg-white shadow-md border border-base-300">
      <div className="p-8">
        <h1 className="text-2xl font-normal text-base-content mb-4">Update Tour Guide Database</h1>
        <p className="text-base-content mb-8">Upload a CSV file containing tour guide information to populate the database.</p>
        
        <FileUpload 
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
        
        {uploadResult && (
          <div className="mt-6 p-4 bg-success/20 text-success rounded-md">
            <h3 className="font-medium mb-2">Upload Successful!</h3>
            <p>Your tour guide data has been successfully processed and stored in the database.</p>
            <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto">
              {JSON.stringify(uploadResult, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm">
            <a 
              href="/tour-guides-template.csv" 
              download
              className="text-base-content hover:text-base-content font-normal"
            >
              Download template
            </a>
          </div>
          <Link 
            href="/tour-guides"
            className="btn btn-primary"
          >
            View Tour Guides
          </Link>
        </div>
      </div>
    </div>
  );
} 