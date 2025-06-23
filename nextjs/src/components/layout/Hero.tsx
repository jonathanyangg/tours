import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Hero() {
  return (
    <div className={cn(
      "overflow-hidden rounded-xl bg-gradient-to-br from-background to-secondary/50 p-1 shadow-md border",
      "relative"
    )}>
      <div className="bg-background/60 backdrop-blur-sm rounded-lg p-8 sm:p-10 md:p-12">
        <div className="max-w-2xl mx-auto text-center relative">
          <div className="absolute -top-12 -right-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-30" />
          <div className="absolute -left-8 top-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl opacity-50" />
          
          <div className="relative inline-flex mb-6 items-center justify-center p-1 overflow-hidden rounded-lg bg-gradient-to-r from-muted to-primary/10 before:absolute before:inset-0 before:animate-[spin_4s_linear_infinite] before:bg-gradient-to-r before:from-primary/20 before:to-accent/20 before:rounded-lg">
            <div className="relative z-10 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-md bg-background text-primary shadow-sm border">
              <Users className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
              Match-AI
            </span>
          </h1>
          
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto relative leading-relaxed">
            Match prospective students with the perfect tour guides based on their interests, background, and preferences using our intelligent matching system.
          </p>
          
        </div>
      </div>
    </div>
  );
}