'use client';

import { useState } from 'react';
import Link from 'next/link';
import FileUpload from '@/components/tour-guides/FileUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 

  CheckCircle2, 
  Download, 
  Users,
  Database
} from 'lucide-react';

export default function UploadData() {
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUploadSuccess = (data: any) => {
    setUploadResult(data);
    setUploadError(null);
  };

  const handleUploadError = (error: Error) => {
    setUploadError(error.message);
    setUploadResult(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Update Tour Guide Database
        </CardTitle>
        <CardDescription>
          Upload a CSV file containing tour guide information to populate the database.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <FileUpload 
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
        
        {uploadResult && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium text-green-800">Upload Successful!</div>
                <p className="text-green-700">
                  Your tour guide data has been successfully processed and stored in the database.
                </p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-green-600 hover:text-green-800">
                    View details
                  </summary>
                  <pre className="mt-2 p-3 bg-white border rounded text-xs overflow-auto text-slate-600">
                    {JSON.stringify(uploadResult, null, 2)}
                  </pre>
                </details>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Separator />
        
        <div className="flex justify-between items-center">
          <Button variant="outline" asChild className="flex items-center gap-2">
            <a href="/tour-guides-template.csv" download>
              <Download className="h-4 w-4" />
              Download Template
            </a>
          </Button>
          
          <Button asChild className="flex items-center gap-2">
            <Link href="/tour-guides">
              <Users className="h-4 w-4" />
              View Tour Guides
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 