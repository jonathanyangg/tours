import FileUpload from '@/components/FileUpload';
import WeaviateTest from '@/components/WeaviateTest';

export default function TestPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-white">Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-white">Upload Tour Guides</h2>
          <FileUpload 
            onUploadSuccess={(data) => console.log('Upload success:', data)}
            onUploadError={(error) => console.error('Upload error:', error)}
          />
        </div>
        
        <div>
          <WeaviateTest />
        </div>
      </div>
    </div>
  );
} 