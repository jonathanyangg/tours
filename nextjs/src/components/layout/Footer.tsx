export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-base-300 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="text-center">
          <p className="text-base-content/60 text-sm">
            © {year} solve-AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}