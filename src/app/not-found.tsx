import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="z-10 space-y-8 bg-card border border-border/50 p-12 rounded-3xl max-w-lg shadow-sm">
        <div className="space-y-4 shadow-sm">
          <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/20">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Page not found
          </h2>
          <p className="text-muted-foreground max-w-xs mx-auto text-sm md:text-base">
            The page you&apos;re looking for doesn&apos;t exist, has been moved, or is temporarily unavailable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 border-t border-border/20">
          <Link href="/">
            <Button className="w-full sm:w-auto font-medium shadow-sm hover:shadow-md transition-shadow">
              Back to Homepage
            </Button>
          </Link>
          <Link href="/trending">
            <Button variant="outline" className="w-full sm:w-auto bg-background border-border/50 hover:bg-muted/30 transition-colors">
              Explore Trending
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
