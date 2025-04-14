'use client';

import Navbar from '@/components/layout/Navbar';
import TourGuides from '@/components/tour-guides/TourGuides';

export default function TourGuidesPage() {
  return (
    <div className="flex-1 bg-white flex flex-col min-h-screen">
      <Navbar />
      <main className="p-8 flex-1 max-w-7xl mx-auto w-full">
        <TourGuides />
      </main>
    </div>
  );
} 