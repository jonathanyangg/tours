'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/login/actions';
import { Home, Eye, Upload, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/tour-guides', label: 'Tour Guides', icon: Eye },
    { href: '/upload', label: 'Upload', icon: Upload },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
        {/* Navigation Links */}
        <nav className="flex items-center space-x-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 hover:bg-accent hover:text-accent-foreground",
                isActive(href)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline-block">{label}</span>
            </Link>
          ))}
        </nav>

        {/* Simple Logout Button */}
        <form action={logout}>
          <button 
            type="submit" 
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-0"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline-block">Logout</span>
          </button>
        </form>
      </div>
    </header>
  );
}
