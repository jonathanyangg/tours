export default function Hero() {
  return (
    <div className="overflow-hidden rounded-xl bg-gradient-to-br from-white to-base-200 p-1 shadow-md border border-base-300">
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-8 sm:p-10 md:p-12">
        <div className="max-w-2xl mx-auto text-center relative">
          <div className="absolute -top-12 -right-16 w-64 h-64 bg-accent-content/10 rounded-full blur-3xl opacity-30" />
          <div className="absolute -left-8 top-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl opacity-50" />
          
          <div className="relative inline-flex mb-5 items-center justify-center p-1 overflow-hidden rounded-lg bg-gradient-to-r from-base-300 to-primary/10 before:absolute before:inset-0 before:animate-[spin_4s_linear_infinite]">
            <div className="relative z-10 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-md bg-white text-primary shadow-sm">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 sm:h-7 sm:w-7" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="1.5" 
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
                />
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary mb-3 relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              Match-AI
            </span>
          </h1>
          
          <p className="text-base-content/80 text-base sm:text-lg max-w-xl mx-auto relative">
            Match prospective students with the perfect tour guides based on their interests, background, and preferences using our intelligent matching system.
          </p>
          
        </div>
      </div>
    </div>
  );
} 