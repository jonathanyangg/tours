export default function BulkMatch() {
  return (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 mb-8">
      <div className="p-6">
        <h2 className="text-xl font-light text-gray-200 mb-2">Bulk Match with CSV Upload</h2>
        <p className="text-sm text-gray-400 mb-6">Upload a CSV file containing student information to perform bulk matching.</p>
        
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-600 rounded-lg bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="mb-4 text-center text-gray-300 font-light">Drag and drop your CSV file here or click to browse</p>
          <input type="file" accept=".csv" className="file-input file-input-bordered w-full max-w-xs bg-gray-700 border-gray-600 text-gray-200" />
        </div>
        
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm">
            <a href="#" className="text-gray-400 hover:text-gray-200 font-light">Download template</a>
          </div>
          <button className="btn bg-gray-600 text-white hover:bg-gray-500 border-none">Upload & Match</button>
        </div>
      </div>
    </div>
  );
} 