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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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

    // Add scroll event listener
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleCredentialsClick = () => {
    router.push('/credentials');
    setIsDropdownOpen(false);
  };

  return (
    <div className={`sticky top-0 z-50 transition-all duration-300 border-b border-base-300 ${
      isScrolled ? 'backdrop-blur-md bg-white/75' : 'bg-white/90'
    }`}>
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center space-x-0.5 sm:space-x-1">
            <Link 
              href="/" 
              className={`group relative flex items-center rounded-md px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200 ${
                isActive('/') 
                  ? 'text-primary bg-primary/4' 
                  : 'text-base-content/80 hover:text-primary hover:bg-primary/4'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
              {isActive('/') && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary"></span>
              )}
            </Link>
            
            <Link 
              href="/tour-guides" 
              className={`group relative flex items-center rounded-md px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200 ${
                isActive('/tour-guides') 
                  ? 'text-primary bg-primary/4' 
                  : 'text-base-content/80 hover:text-primary hover:bg-primary/4'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Tour Guides</span>
              {isActive('/tour-guides') && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary"></span>
              )}
            </Link>
            
            <Link 
              href="/upload" 
              className={`group relative flex items-center rounded-md px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200 ${
                isActive('/upload') 
                  ? 'text-primary bg-primary/4' 
                  : 'text-base-content/80 hover:text-primary hover:bg-primary/4'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Upload</span>
              {isActive('/upload') && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary"></span>
              )}
            </Link>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center overflow-hidden rounded-full bg-primary/90 text-primary-content transition-all duration-300 ease-out hover:scale-105 hover:shadow-md ${isDropdownOpen ? 'ring-2 ring-accent-content' : ''}`}
            >
              <span className="text-xs sm:text-sm font-medium">{userInitial}</span>
            </button>
            
            {isDropdownOpen && (
              <div 
                className="animate-fadeIn absolute right-0 mt-2 w-48 sm:w-52 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <button
                  onClick={handleCredentialsClick}
                  className="flex w-full items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-base-content hover:bg-base-200"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-base-content/70" 
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
                  <span>API Credentials</span>
                </button>
                
                <form action={logout} className="w-full">
                  <button 
                    type="submit" 
                    className="flex w-full items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-error hover:bg-error/4"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-3.5 w-3.5 sm:h-4 sm:w-4" 
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
                    <span>Logout</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
