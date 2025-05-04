import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/layout/Hero';
import DatabaseMatches from '@/components/matching/DatabaseMatches';
import IndividualMatch from '@/components/matching/IndividualMatch';
import RecentMatches from '@/components/matching/RecentMatches';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      
      {/* Main Content */}
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <div className="space-y-4">
          <Hero />
          <DatabaseMatches />
          <RecentMatches />
          <IndividualMatch />
        </div>
      </main>
      <Footer />
    </div>
  );
} 
