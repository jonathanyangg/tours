'use client';

import Navbar from '@/components/layout/Navbar';
import UploadData from '@/components/upload/UploadData';
import Footer from '@/components/layout/Footer';

export default function UploadPage() {
  return (
    <div className="flex-1 bg-white flex flex-col min-h-screen">
      <Navbar />
      <main className="p-8 flex-1 max-w-7xl mx-auto w-full">
        <UploadData />
      </main>
      <Footer />
    </div>
  );
} 