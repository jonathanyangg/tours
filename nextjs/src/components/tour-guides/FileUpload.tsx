'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { uploadTourGuides } from '@/services/api';
import { UploadResult } from '@/types/api';

interface FileUploadProps {
  onUploadSuccess?: (result: UploadResult) => void;
  onUploadError?: (error: Error) => void;
}

export default function FileUpload({ onUploadSuccess, onUploadError }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
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
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      handleFileUpload(file);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);
      handleFileUpload(file);
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
          return prev + 5;
        });
      }, 200);

      const result = await uploadTourGuides(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
      
      // Reset after a successful upload
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setFileName(null);
      }, 2000);
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error.message);
      setIsUploading(false);
      
      if (onUploadError) {
        onUploadError(error);
      }
    }
  };

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div 
        className={`group relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-xl transition-all duration-300 ${
          isDragging 
            ? 'border-primary bg-primary/5 scale-[1.02] shadow-lg' 
            : isUploading 
              ? 'border-primary bg-primary/5 shadow-md' 
              : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5 hover:shadow-md'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10 flex flex-col items-center">
          {isUploading ? (
            <div className="w-full max-w-xs">
              <div className="flex items-center mb-2">
                <svg 
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  ></circle>
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-center text-foreground font-medium">
                  Uploading {fileName && <span className="text-primary">{fileName}</span>}
                </span>
              </div>
              
              <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="absolute inset-0 bg-primary rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%`, transform: uploadProgress === 100 ? 'scaleX(1)' : 'scaleX(0.98)' }}
                ></div>
                <div 
                  className="absolute inset-0 bg-white/30 opacity-25 overflow-hidden"
                  style={{ transform: 'translateX(-100%)', animation: 'shimmer 1.5s infinite' }}
                ></div>
              </div>
              
              <p className="mt-1 text-xs text-primary/70 text-right">{uploadProgress}%</p>
            </div>
          ) : (
            <>
              <div 
                className={`mb-4 p-3 rounded-full ${
                  isDragging ? 'bg-primary/10 text-primary' : 'bg-primary/10 text-primary group-hover:scale-110'
                } transition-all duration-300`}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="1.5" 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                  />
                </svg>
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-foreground font-medium">
                  {isDragging ? 'Drop your file here' : 'Drag & drop your CSV file'}
                </p>
                <p className="text-sm text-muted-foreground">
                  or <span className="text-primary underline">browse files</span>
                </p>
              </div>
            </>
          )}
          
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center animate-fadeIn">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2 flex-shrink-0" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
} 