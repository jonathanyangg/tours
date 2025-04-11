import Link from 'next/link';

export default function Navbar() {
  return (
    <div className="navbar bg-gray-800 border-b border-gray-700">
      <div className="flex-1">
        <Link href="/" className="text-xl font-light tracking-wide text-gray-200">Tour Guide Matcher</Link>
      </div>
      <div className="flex-none gap-8">
        <Link href="/upload" className="btn btn-ghost text-gray-200 hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Update tour guide database
        </Link>
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full bg-gray-700">
              <div className="text-gray-300 flex items-center justify-center h-full font-light">U</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

