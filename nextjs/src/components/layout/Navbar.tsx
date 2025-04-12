import Link from 'next/link';

export default function Navbar() {
  return (
    <div className="navbar bg-base-200 border-b border-base-300 sticky top-0 z-50 shadow-md">
      <div className="flex-1 m-2">
        <Link href="/" className="text-xl font-normal tracking-wide text-base-content">Home</Link>
      </div>
      <div className="flex-none gap-8">
        <Link href="/tour-guides" className="btn btn-ghost text-base-content hover:bg-base-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View Tour Guides
        </Link>
        <Link href="/upload" className="btn btn-ghost text-base-content hover:bg-base-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Update Tour Guide Database
        </Link>
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full bg-base-300">
              <div className="text-base-content flex items-center justify-center h-full font-normal">U</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

