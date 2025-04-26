import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import VisitingForm from '@/components/visiting-form/VisitingForm';

export default function VisitingFormPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <VisitingForm />
      </main>
      <Footer />
    </div>
  );
} 