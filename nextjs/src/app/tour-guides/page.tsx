import Navbar from '@/components/layout/Navbar';
import TourGuides from '@/components/tour-guides/TourGuides';
import Footer from '@/components/layout/Footer';
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function TourGuidesPage() {

  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }
  
  return (
    <div className="flex-1 bg-white flex flex-col min-h-screen">
      <Navbar />
      <main className="p-8 flex-1 max-w-7xl mx-auto w-full">
        <TourGuides />
      </main>
      <Footer />
    </div>
  );
} 