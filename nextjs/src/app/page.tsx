import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/layout/Hero';
import DatabaseMatches from '@/components/matching/DatabaseMatches';
import BulkMatch from '@/components/matching/BulkMatch';
import IndividualMatch from '@/components/matching/IndividualMatch';
import RecentMatches from '@/components/matching/RecentMatches';

export default function Home() {
  return (
    <div className="flex-1 bg-gray-900 flex flex-col min-h-screen">
      <Navbar />
      
      {/* Main Content */}
      <main className="p-8 flex-1 max-w-7xl mx-auto w-full">
        <Hero />
        <DatabaseMatches />
        <IndividualMatch />
        <BulkMatch />
        <RecentMatches />
      </main>
    </div>
  );
} 
