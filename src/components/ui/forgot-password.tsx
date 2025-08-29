
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRateLimiter } from '@/hooks/useRateLimiter';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Rate limiting for password reset requests
  const resetLimiter = useRateLimiter({
    maxAttempts: 3,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 60 * 60 * 1000 // 1 hour
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check rate limit
    if (!resetLimiter.checkRateLimit('password reset')) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('Password reset requested for:', email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });

      if (error) {
        console.log('Password reset failed for:', email, error.message);
        
        // Enhanced error handling
        if (error.message.includes('Email rate limit exceeded')) {
          toast.error('Too many reset requests. Please wait before trying again.');
        } else {
          toast.error('Unable to send reset email. Please try again.');
        }
      } else {
        console.log('Password reset email sent for:', email);
        toast.success('Password reset link sent to your email');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <form
        onSubmit={handleSubmit}
        className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]"
      >
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
          <div>
            <Link
              to="/"
              aria-label="go home"
            >
              {/* Add your logo here if needed */}
            </Link>
            <h1 className="mb-1 mt-4 text-xl font-semibold">Recover Password</h1>
            <p className="text-sm">Enter your email to receive a reset link</p>
          </div>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="block text-sm"
              >
                Email
              </Label>
              <Input
                type="email"
                required
                name="email"
                id="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">We'll send you a link to reset your password.</p>
          </div>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            Remembered your password?
            <Button
              asChild
              variant="link"
              className="px-2"
            >
              <Link to="/auth">Log in</Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  );
}
