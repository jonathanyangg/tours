'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'text-primary' : 'text-base-content/70 hover:text-primary';
  };

  return (
    <div className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex-1">
          <Link href="/" className="text-xl font-semibold tracking-wide text-base-content hover:text-base-content/60 hover:text-[1.3rem] transition-all duration-100">Home</Link>
        </div>
        <div className="flex-1 flex justify-center gap-4">
          <Link href="/tour-guides" className="btn btn-ghost text-base-content hover:bg-base-content/10 transition-all duration-200 hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Tour Guides
          </Link>
          <Link href="/upload" className="btn btn-ghost text-base-content hover:bg-base-content/10 transition-all duration-200 hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Update Tour Guide Database
          </Link>
          <Link
            href="/visitingform"
            className="btn btn-ghost text-base-content hover:bg-base-content/10 transition-all duration-200 hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Register for Tour
          </Link>
        </div>
        <div className="flex-1 flex justify-end">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar border border-base-300 hover:border-base-content/80 transition-all duration-200 hover:scale-105">
              <div className="w-10 rounded-full bg-white">
                <div className="text-base-content flex items-center justify-center h-full font-normal">U</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
