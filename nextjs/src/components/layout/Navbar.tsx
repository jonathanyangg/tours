'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/app/login/actions';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => {
    return pathname === path ? 'text-primary' : 'text-base-content/70 hover:text-primary';
  };

  const handleCredentialsClick = () => {
    router.push('/credentials');
  };

  return (
    <div className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex-1">
          <Link href="/" className="text-xl font-semibold tracking-wide text-base-content hover:text-base-content/60 hover:text-[1.3rem] transition-all duration-100">Home</Link>
        </div>
        <div className="flex-1 flex justify-center gap-4">
          <Link href="/tour-guides" className="btn btn-ghost text-base-content hover:bg-base-content/10 transition-all duration-200 hover:scale-105 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Tour Guides
          </Link>
          <Link href="/upload" className="btn btn-ghost text-base-content hover:bg-base-content/10 transition-all duration-200 hover:scale-105 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Update Tour Guide Database
          </Link>
        </div>
        <div className="flex-1 flex justify-end">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost p-0 h-10 w-10 rounded-full bg-gradient-to-br from-primary/90 to-primary hover:from-primary hover:to-primary/80 transition-all duration-300 transform hover:scale-105 shadow-md">
              <span className="text-base-100 text-sm font-medium">P</span>
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-xl w-52 mt-3 border border-base-200 overflow-hidden">
              <li className="mb-1 flex justify-center">
                <button onClick={handleCredentialsClick} className="btn btn-ghost w-full justify-start gap-2 text-sm font-medium text-neutral-700 hover:text-primary normal-case h-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  API Credentials
                </button>
              </li>
              <li className="flex justify-center">
                <form action={logout} className="w-full">
                  <button type="submit" className="btn btn-ghost w-full justify-start gap-2 text-sm font-medium text-neutral-700 hover:text-primary active:bg-base-200 active:text-primary normal-case h-12">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </form>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
