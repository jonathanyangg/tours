import { notFound } from 'next/navigation';
import Footer from '@/components/layout/Footer';
import VisitingForm from '@/components/visiting-form/VisitingForm';

// School mapping configuration
const SCHOOL_MAPPING: Record<string, { ceeb: string; name: string }> = {
  'lawrenceville': {
    ceeb: '310680',
    name: 'The Lawrenceville School'
  },
  'princeton-day': {
    ceeb: '311265', 
    name: 'Princeton Day School'
  }
};

interface PageProps {
  params: Promise<{
    school: string;
  }>;
}

export default async function SchoolVisitingFormPage({ params }: PageProps) {
  const { school } = await params;
  
  // Validate school parameter
  if (!SCHOOL_MAPPING[school]) {
    notFound();
  }
  
  const schoolInfo = SCHOOL_MAPPING[school];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <VisitingForm 
          schoolCeeb={schoolInfo.ceeb}
          schoolName={schoolInfo.name}
        />
      </main>
      <Footer />
    </div>
  );
}

// Generate static params for known schools (optional optimization)
export function generateStaticParams() {
  return Object.keys(SCHOOL_MAPPING).map((school) => ({
    school,
  }));
} 