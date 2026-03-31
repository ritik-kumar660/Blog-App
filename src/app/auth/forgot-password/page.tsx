"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { forgotPassword } from "@/actions/auth";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const res = await forgotPassword(email);

    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    } else {
      // Success - Redirect to reset page with email in query
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden">
      {/* Background animated elements */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none" 
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        className="w-full max-w-md z-10"
      >
        <Card className="shadow-2xl bg-card border border-border/50 backdrop-blur-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-extrabold tracking-tight text-center text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
              Forgot Password
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Enter your email and we&apos;ll send you a 6-digit reset code.
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
                <Label htmlFor="email" className="text-foreground/80">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-border/50 text-foreground placeholder:text-muted-foreground/30 focus-visible:ring-primary/50 text-base"
                />
              </div>
              <Button 
                className="w-full font-bold shadow-sm hover:shadow-md transition-all h-11" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Sending Code..." : "Send Reset Code"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 pb-6">
            <p className="text-center text-sm text-muted-foreground w-full">
              Remember your password?{" "}
              <Link href="/auth/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Back to Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
