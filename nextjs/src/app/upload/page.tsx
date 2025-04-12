'use client';

import Navbar from '@/components/layout/Navbar';
import UploadData from '@/components/upload/UploadData';

export default function UploadPage() {
  return (
    <div className="flex-1 bg-base-300 flex flex-col min-h-screen">
      <Navbar />
      <main className="p-8 flex-1 max-w-7xl mx-auto w-full">
        <UploadData />
      </main>
    </div>
  );
} 