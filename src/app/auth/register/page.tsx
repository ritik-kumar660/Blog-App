"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { registerUser, verifyOTP, resendOTP } from "@/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Registration States
  const [step, setStep] = useState<"details" | "otp">("details");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    
    const formData = new FormData(e.currentTarget);
    const emailStr = formData.get("email") as string;
    const result = await registerUser(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else if (result?.step === 'otp') {
      setRegisteredEmail(emailStr);
      setStep("otp");
      setSuccessMsg("Verification code sent to your inbox!");
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    const result = await verifyOTP(registeredEmail, otpCode);
    
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      setSuccessMsg("Email verified! Redirecting...");
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    
    const result = await resendOTP(registeredEmail);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccessMsg("A new verification code has been dispatched.");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/20 blur-[120px] rounded-full pointer-events-none" 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        className="w-full max-w-md z-10"
      >
        <Card className="shadow-2xl bg-card border border-border/50 backdrop-blur-2xl overflow-hidden relative">
          
          <AnimatePresence mode="wait">
            {step === "details" ? (
              <motion.div 
                key="step-details"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
              >
                <CardHeader className="space-y-1">
                  <CardTitle className="text-3xl font-extrabold tracking-tight text-center text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
                    Create an account
                  </CardTitle>
                  <CardDescription className="text-center text-muted-foreground">
                    Enter your details below to get started.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 rounded-md bg-destructive/20 border border-destructive/30 text-destructive text-sm text-center">
                      {error}
                    </motion.div>
                  )}

                  <form className="space-y-5" onSubmit={handleRegister}>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground/80">Name</Label>
                      <Input
                        id="name" name="name" placeholder="John Doe" required disabled={isLoading}
                        className="bg-background border-border/50 text-foreground placeholder:text-muted-foreground/30 focus-visible:ring-primary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground/80">Email</Label>
                      <Input
                        id="email" name="email" type="email" placeholder="m@example.com" required disabled={isLoading}
                        className="bg-background border-border/50 text-foreground placeholder:text-muted-foreground/30 focus-visible:ring-primary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-foreground/80">Password</Label>
                      <Input
                        id="password" name="password" type="password" required disabled={isLoading}
                        className="bg-black/30 border-white/10 text-white focus-visible:ring-primary/50"
                      />
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full font-bold shadow-sm hover:shadow-md transition-all h-10 border-transparent">
                      {isLoading ? "Dispatching Validation..." : "Sign Up"}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 pb-6">
                  <p className="text-center text-sm text-muted-foreground w-full">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">Log in</Link>
                  </p>
                </CardFooter>
              </motion.div>
            ) : (
              <motion.div 
                key="step-otp"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
              >
                <CardHeader className="space-y-1">
                  <CardTitle className="text-3xl font-extrabold tracking-tight text-center text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">
                    Verify Email
                  </CardTitle>
                  <CardDescription className="text-center text-muted-foreground">
                    We just sent a 6-digit pin to <strong className="text-foreground">{registeredEmail}</strong>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 rounded-md bg-destructive/20 border border-destructive/30 text-destructive text-sm text-center">
                      {error}
                    </motion.div>
                  )}
                  {successMsg && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 rounded-md bg-green-500/20 border border-green-500/30 text-green-400 text-sm text-center">
                      {successMsg}
                    </motion.div>
                  )}

                  <form className="space-y-5" onSubmit={handleVerify}>
                    <div className="space-y-2">
                      <Label htmlFor="otp" className="text-foreground/80">6-Digit Code</Label>
                      <Input
                        id="otp" 
                        name="otp" 
                        autoFocus
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))} // Numeric only
                        placeholder="••••••" 
                        required 
                        disabled={isLoading}
                        className="bg-background border-border/50 text-foreground text-center text-2xl tracking-[1em] focus-visible:ring-primary/50"
                      />
                    </div>
                    
                    <Button type="submit" disabled={isLoading || otpCode.length !== 6} className="w-full font-bold shadow-sm h-10 border-transparent">
                      {isLoading ? "Verifying..." : "Confirm & Authenticate"}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 pb-6 pt-2">
                  <p className="text-center text-sm text-muted-foreground w-full mb-2">
                    Didn&apos;t receive the email? Check spam or
                  </p>
                  <button 
                    onClick={handleResend} 
                    disabled={isLoading}
                    className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors underline disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                  <button 
                    onClick={() => setStep('details')} 
                    disabled={isLoading}
                    className="mt-6 text-xs text-muted-foreground hover:text-foreground transition-colors pt-4"
                  >
                    &larr; Change Email Address
                  </button>
                </CardFooter>
              </motion.div>
            )}
          </AnimatePresence>

        </Card>
      </motion.div>
    </div>
  );
}
