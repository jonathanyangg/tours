export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto max-w-screen-2xl py-6 px-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            © {year} solve-AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}