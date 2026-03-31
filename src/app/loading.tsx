export default function Loading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-6">
      <div className="relative flex items-center justify-center">
        {/* Pulsating outer ring */}
        <div className="absolute h-16 w-16 animate-ping rounded-full bg-primary/20" />
        {/* Inner spinning circle */}
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted/30 border-t-primary" />
        {/* Center dot */}
        <div className="absolute h-2 w-2 rounded-full bg-primary" />
      </div>
      <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground animate-pulse">
        Loading...
      </p>
    </div>
  );
}
