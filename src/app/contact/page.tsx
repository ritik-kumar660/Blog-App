'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSuccess(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl relative">
      <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/3 blur-[100px] opacity-30">
        <div className="aspect-square w-[600px] rounded-full bg-primary/40 pointer-events-none" />
      </div>

      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight">
          Get in Touch
        </h1>
        <p className="text-lg text-muted-foreground mx-auto max-w-2xl">
          Have a question about publishing? Want to report a bug or feature request? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="bg-card border border-border/50 p-8 sm:p-12 rounded-3xl shadow-xl relative overflow-hidden">
        {isSuccess && (
          <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <div className="h-16 w-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
            <p className="text-muted-foreground mb-6">We&apos;ll get back to you as soon as possible.</p>
            <Button onClick={() => setIsSuccess(false)} variant="outline">
              Send another message
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Full Name</label>
              <input 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={handleChange}
                required
                className="flex h-10 w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors" 
                placeholder="Jane Doe" 
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email Address</label>
              <input 
                id="email" 
                name="email" 
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="flex h-10 w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors" 
                placeholder="jane@example.com" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Subject</label>
            <input 
              id="subject" 
              name="subject" 
              value={formData.subject}
              onChange={handleChange}
              required
              className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors" 
              placeholder="How can we help?" 
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Message</label>
              <textarea 
                id="message" 
                name="message" 
                value={formData.message}
                onChange={handleChange}
                required
                className="flex min-h-[150px] w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-y" 
                placeholder="Type your message here." 
              />
          </div>

          <Button type="submit" className="w-full sm:w-auto px-8" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </div>
    </div>
  );
}
