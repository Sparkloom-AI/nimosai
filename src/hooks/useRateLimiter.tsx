import { useRef } from 'react';
import { toast } from 'sonner';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RateLimitState {
  attempts: number;
  windowStart: number;
  blockedUntil?: number;
}

export const useRateLimiter = (config: RateLimitConfig) => {
  const stateRef = useRef<RateLimitState>({
    attempts: 0,
    windowStart: Date.now()
  });

  const checkRateLimit = (action: string = 'action'): boolean => {
    const now = Date.now();
    const state = stateRef.current;

    // Check if currently blocked
    if (state.blockedUntil && now < state.blockedUntil) {
      const remainingMs = state.blockedUntil - now;
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      toast.error(`Too many attempts. Please wait ${remainingSeconds} seconds before trying again.`);
      return false;
    }

    // Reset window if expired
    if (now - state.windowStart > config.windowMs) {
      state.attempts = 0;
      state.windowStart = now;
      state.blockedUntil = undefined;
    }

    // Check if limit exceeded
    if (state.attempts >= config.maxAttempts) {
      const blockDuration = config.blockDurationMs || config.windowMs;
      state.blockedUntil = now + blockDuration;
      
      const blockMinutes = Math.ceil(blockDuration / 60000);
      toast.error(`Too many ${action} attempts. You're temporarily blocked for ${blockMinutes} minute(s).`);
      return false;
    }

    // Increment attempts
    state.attempts++;
    return true;
  };

  const reset = () => {
    stateRef.current = {
      attempts: 0,
      windowStart: Date.now()
    };
  };

  return { checkRateLimit, reset };
};