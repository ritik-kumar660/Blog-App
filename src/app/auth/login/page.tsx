"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
// Note: We use next-auth/react for client side sign-in to prevent full page reloads and handle errors easily
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleCredentialsLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
      } else {
        // Success
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError("Invalid email or password");
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden">
      {/* Background animated elements */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 blur-[120px] rounded-full pointer-events-none" 
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
              Welcome back
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Enter your email and password to log in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4 p-3 rounded-md bg-destructive/20 border border-destructive/30 text-destructive text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <form className="space-y-5" onSubmit={handleCredentialsLogin}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground/80">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="bg-background border-border/50 text-foreground placeholder:text-muted-foreground/30 focus-visible:ring-primary/50"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground/80">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-medium text-primary hover:underline hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  className="bg-black/30 border-white/10 text-white focus-visible:ring-primary/50" 
                />
              </div>
              <Button 
                className="w-full font-bold shadow-sm hover:shadow-md transition-all h-10" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log in"}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-center space-x-2">
              <div className="h-px flex-1 bg-border/20" />
              <span className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">
                Or continue with
              </span>
              <div className="h-px flex-1 bg-border/20" />
            </div>

            <Button 
              variant="outline" 
              onClick={() => signIn("google", { redirectTo: "/dashboard" })}
              className="mt-6 w-full bg-background border-border/50 hover:bg-muted/50 text-foreground transition-all duration-300 shadow-sm"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 pb-6">
            <p className="text-center text-sm text-muted-foreground w-full">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
