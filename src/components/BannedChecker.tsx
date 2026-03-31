"use client";

import { useSession } from "next-auth/react";
import BannedOverlay from "./BannedOverlay";

export default function BannedChecker({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const isBanned = (session?.user as any)?.isBanned;

  if (isBanned) {
    return (
      <>
        <BannedOverlay />
        <div className="flex-1 flex items-center justify-center p-20">
          <p className="text-muted-foreground italic">Restricted Access</p>
        </div>
      </>
    );
  }

  return <>{children}</>;
}
