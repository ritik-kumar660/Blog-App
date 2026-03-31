"use client";

import { useState, Suspense } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { resetPassword } from "@/actions/auth";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await resetPassword(formData);

    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    }
  };

  if (success) {
    return (
      <Card className="shadow-2xl bg-card border border-border/50 backdrop-blur-2xl p-8 text-center">
        <h2 className="text-3xl font-bold text-primary mb-4">Password Reset!</h2>
        <p className="text-muted-foreground mb-6">
          Your password has been successfully updated. Redirecting to login...
        </p>
        <div className="animate-spin rounded-full border-4 border-muted/20 border-t-primary h-8 w-8 mx-auto" />
      </Card>
    );
  }

  return (
    <Card className="shadow-2xl bg-card border border-border/50 backdrop-blur-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-3xl font-extrabold tracking-tight text-center text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
          Reset Password
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Enter the code sent to your email and your new password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 rounded-md bg-destructive/20 border border-destructive/30 text-destructive text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground/80">Confirm Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={initialEmail}
              className="bg-background border-border/50 text-foreground placeholder:text-muted-foreground/30 focus-visible:ring-primary/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-foreground/80">6-Digit Reset Code</Label>
            <Input
              id="otp"
              name="otp"
              placeholder="••••••"
              maxLength={6}
              required
              className="bg-background border-border/50 text-foreground text-center text-2xl tracking-[0.5em] focus-visible:ring-primary/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground/80">New Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="bg-background border-border/50 text-foreground focus-visible:ring-primary/50"
            />
          </div>
          <Button 
            className="w-full font-bold shadow-sm hover:shadow-md transition-all h-11" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Updating Password..." : "Reset Password"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 pb-6">
        <p className="text-center text-sm text-muted-foreground w-full">
          Didn&apos;t get a code?{" "}
          <Link href="/auth/forgot-password" className="font-semibold text-primary hover:text-primary/80 transition-colors">
            Try again
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden">
      {/* Background animated elements */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/20 blur-[120px] rounded-full pointer-events-none" 
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        className="w-full max-w-md z-10"
      >
        <Suspense fallback={
          <Card className="shadow-2xl bg-card border border-border/50 backdrop-blur-2xl p-12 text-center flex flex-col items-center">
            <div className="animate-spin rounded-full border-4 border-muted/20 border-t-primary h-12 w-12 mb-4" />
            <p className="text-muted-foreground font-medium animate-pulse uppercase tracking-widest text-xs">Initializing Secure Link...</p>
          </Card>
        }>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
