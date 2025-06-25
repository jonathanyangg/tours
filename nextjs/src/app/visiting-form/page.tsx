import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { GraduationCap, ExternalLink } from 'lucide-react';
import Footer from '@/components/layout/Footer';

export default function VisitingFormPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-8">
            <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold">
              <GraduationCap className="h-7 w-7 text-primary" />
              Select Your School
            </CardTitle>
            <CardDescription className="text-base mt-2 max-w-2xl mx-auto">
              Please select your school to access the tour registration form.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <Link href="/lawrenceville/visiting-form">
                <Button 
                  variant="outline" 
                  className="w-full h-16 text-left justify-between hover:bg-primary/5 border-2"
                >
                  <div>
                    <div className="font-semibold">The Lawrenceville School</div>
                    <div className="text-sm text-muted-foreground">Register for campus tour</div>
                  </div>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
              
              <Link href="/princeton-day/visiting-form">
                <Button 
                  variant="outline" 
                  className="w-full h-16 text-left justify-between hover:bg-primary/5 border-2"
                >
                  <div>
                    <div className="font-semibold">Princeton Day School</div>
                    <div className="text-sm text-muted-foreground">Register for campus tour</div>
                  </div>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="text-center text-sm text-muted-foreground mt-8">
              Don&apos;t see your school? Contact us for assistance.
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
} 