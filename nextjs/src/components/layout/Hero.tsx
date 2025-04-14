export default function Hero() {
  return (
    <div className="card bg-white shadow-lg border border-base-300 mb-8">
      <div className="p-12 text-center">
        <div className="max-w-2xl mx-auto">
          {/* <div className="mb-6">
            <div className="w-20 h-20 mx-auto rounded-lg bg-white flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-base-content/70" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
          </div> */}
          <h1 className="text-3xl tracking-wide text-base-content mb-4 whitespace-nowrap font-medium">AI Tour Guide Matching System</h1>
          <p className="text-base-content font-light">Match prospective students with the perfect tour guides based on their interests, background, and preferences.</p>
        </div>
      </div>
    </div>
  );
} 