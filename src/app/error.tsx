"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center space-y-6">
      <div className="space-y-2">
        <h2 className="text-4xl font-black tracking-tight text-foreground">Something went wrong!</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          We&apos;ve encountered an unexpected error. Don&apos;t worry, your data is safe. 
          Please try refreshing or returning to the home page.
        </p>
      </div>
      
      <div className="flex gap-4">
        <Button
          onClick={() => reset()}
          className="font-bold shadow-sm hover:shadow-md transition-all px-8 h-12"
        >
          Try again
        </Button>
        <Button
          variant="outline"
          onClick={() => window.location.href = "/"}
          className="font-bold px-8 h-12 border-border/50"
        >
          Go Home
        </Button>
      </div>
      
      {error.digest && (
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/30 font-mono pt-12">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}
