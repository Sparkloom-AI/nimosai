import { useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface RateLimitConfig {
  maxAttempts: number;
  windowMinutes: number;
  actionType: string;
}

interface RateLimitResult {
  isAllowed: boolean;
  remainingAttempts?: number;
  resetTime?: Date;
}

export const useEnhancedRateLimiter = (config: RateLimitConfig) => {
  const { user } = useAuth();
  const lastCheckRef = useRef<number>(0);

  const checkRateLimit = useCallback(async (): Promise<RateLimitResult> => {
    // Throttle checks to avoid spam
    const now = Date.now();
    if (now - lastCheckRef.current < 1000) {
      return { isAllowed: true };
    }
    lastCheckRef.current = now;

    try {
      const { data, error } = await supabase.rpc('enhanced_rate_limit_check', {
        p_user_id: user?.id || null,
        p_ip_address: null, // Client-side doesn't have access to IP
        p_action_type: config.actionType,
        p_max_attempts: config.maxAttempts,
        p_window_minutes: config.windowMinutes
      });

      if (error) {
        console.error('Rate limit check failed:', error);
        // Allow action if rate limit check fails to avoid blocking users
        return { isAllowed: true };
      }

      if (!data) {
        toast.error(`Rate limit exceeded for ${config.actionType}. Please try again later.`);
        return { isAllowed: false };
      }

      return { isAllowed: data };
    } catch (error) {
      console.error('Rate limit error:', error);
      // Allow action if there's an error to avoid blocking users
      return { isAllowed: true };
    }
  }, [config, user?.id]);

  return { checkRateLimit };
};

// Pre-configured rate limiters for common actions
export const useLoginRateLimiter = () => useEnhancedRateLimiter({
  maxAttempts: 5,
  windowMinutes: 15,
  actionType: 'login_attempt'
});

export const usePasswordResetRateLimiter = () => useEnhancedRateLimiter({
  maxAttempts: 3,
  windowMinutes: 60,
  actionType: 'password_reset'
});

export const useRegistrationRateLimiter = () => useEnhancedRateLimiter({
  maxAttempts: 3,
  windowMinutes: 60,
  actionType: 'registration'
});

export const useClientCreationRateLimiter = () => useEnhancedRateLimiter({
  maxAttempts: 10,
  windowMinutes: 5,
  actionType: 'client_creation'
});