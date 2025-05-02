'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/app/login/actions';
import { getUserEmail } from '@/services/api';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userInitial, setUserInitial] = useState('');

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const email = await getUserEmail();
        setUserInitial(email.charAt(0).toUpperCase());
      } catch (error) {
        console.error('Error fetching user email:', error);
        setUserInitial('?'); // Fallback initial if there's an error
      }
    };

    fetchUserEmail();
  }, []);

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
            <div 
              tabIndex={0} 
              role="button" 
              className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/15 transition-all duration-200 ring-2 ring-primary/20 hover:ring-primary/30 cursor-pointer"
            >
              <span className="text-primary text-sm font-medium">{userInitial}</span>
            </div>
            <ul 
              tabIndex={0} 
              className="dropdown-content z-[1] mt-2 p-1 bg-white rounded-lg w-48 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-black/5"
            >
              <li>
                <button 
                  onClick={handleCredentialsClick} 
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-150 cursor-pointer"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 text-gray-500" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="1.5" 
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" 
                    />
                  </svg>
                  API Credentials
                </button>
              </li>
              <li>
                <form action={logout} className="w-full">
                  <button 
                    type="submit" 
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors duration-150 cursor-pointer"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="1.5" 
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                      />
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
