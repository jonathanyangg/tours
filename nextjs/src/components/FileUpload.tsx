'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { uploadTourGuides } from '@/services/api';

interface FileUploadProps {
  onUploadSuccess?: (data: any) => void;
  onUploadError?: (error: Error) => void;
}

export default function FileUpload({ onUploadSuccess, onUploadError }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const result = await uploadTourGuides(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error.message);
      
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div 
        className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg shadow-md ${
          isDragging 
            ? 'border-primary bg-primary/10' 
            : 'border-base-300 bg-base-100'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-12 w-12 mb-4 ${isDragging ? 'text-primary' : 'text-base-content/50'}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
          />
        </svg>
        
        {isUploading ? (
          <div className="w-full max-w-xs">
            <div className="mb-2 text-center text-base-content/80 font-normal">
              Uploading... {uploadProgress}%
            </div>
            <div className="w-full bg-base-300 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <p className="mb-4 text-center text-base-content/80 font-normal">
            Drag and drop your CSV file here or click to browse
          </p>
        )}
        
        <input 
          type="file" 
          accept=".csv" 
          className="hidden focus:outline-none" 
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-error/20 text-error-content rounded-md">
          {error}
        </div>
      )}
    </div>
  );
} 