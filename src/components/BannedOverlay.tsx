"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Mail, Phone, LogOut, ArrowRight } from "lucide-react";
import { signOut } from "next-auth/react";

export default function BannedOverlay() {
  const contactEmail = "ritikkumarharhar660@gmail.com";
  const contactPhone = "+91 9263583729";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-destructive/20 bg-card p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>

          <h1 className="mb-2 text-3xl font-bold tracking-tight">Account Suspended</h1>
          <p className="mb-8 text-muted-foreground">
            Your account has been flagged for violating our community guidelines. 
            Access to our services has been restricted. If you believe this is a mistake, 
            please contact our team for a review.
          </p>

          <div className="grid w-full gap-4 mb-8">
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center justify-between rounded-xl border border-border bg-accent/50 p-4 transition-all hover:bg-accent hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Support</p>
                  <p className="font-semibold">{contactEmail}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </a>

            <a
              href={`tel:${contactPhone}`}
              className="flex items-center justify-between rounded-xl border border-border bg-accent/50 p-4 transition-all hover:bg-accent hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <Phone className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Call Support</p>
                  <p className="font-semibold">{contactPhone}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </a>
          </div>

          <div className="flex w-full gap-4">
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive px-6 py-3 font-semibold text-destructive-foreground transition-all hover:opacity-90 active:scale-95"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
          
          <p className="mt-6 text-xs text-muted-foreground">
            Account ID tracking is active. Misuse of the review process may result in a permanent ban.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
