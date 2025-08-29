import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  enabled?: boolean;
}

export const useSessionTimeout = ({
  timeoutMinutes = 60, // 1 hour default
  warningMinutes = 5,
  enabled = true
}: UseSessionTimeoutOptions = {}) => {
  const { user, signOut } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();
  const activityRef = useRef<number>(Date.now());

  const resetTimer = () => {
    if (!enabled || !user) return;

    activityRef.current = Date.now();
    
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    // Set warning timer
    warningRef.current = setTimeout(() => {
      toast.warning(
        `Your session will expire in ${warningMinutes} minutes due to inactivity`,
        { duration: 10000 }
      );
    }, (timeoutMinutes - warningMinutes) * 60 * 1000);

    // Set logout timer
    timeoutRef.current = setTimeout(async () => {
      toast.error('Session expired due to inactivity');
      await signOut();
    }, timeoutMinutes * 60 * 1000);
  };

  useEffect(() => {
    if (!enabled || !user) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initial timer setup
    resetTimer();

    return () => {
      // Cleanup
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [enabled, user, timeoutMinutes, warningMinutes]);

  return { resetTimer };
};