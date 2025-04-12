import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/layout/Hero';
import DatabaseMatches from '@/components/matching/DatabaseMatches';
import IndividualMatch from '@/components/matching/IndividualMatch';
import RecentMatches from '@/components/matching/RecentMatches';
import Footer from '@/components/footer/footer';

export default function Home() {
  return (
    <div className="flex-1 bg-base-300 flex flex-col min-h-screen">
      <Navbar />
      
      {/* Main Content */}
      <main className="p-8 flex-1 max-w-7xl mx-auto w-full">
        <Hero />
        <IndividualMatch />
        <DatabaseMatches />
        <RecentMatches />
        <Footer />
      </main>
    </div>
  );
} 
