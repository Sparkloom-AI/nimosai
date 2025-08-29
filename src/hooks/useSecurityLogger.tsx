import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type SecurityEventType = 
  | 'login_attempt'
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'password_reset_request'
  | 'password_change'
  | 'account_creation'
  | 'suspicious_activity';

interface SecurityEvent {
  event_type: SecurityEventType;
  user_id?: string;
  email?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
}

export const useSecurityLogger = () => {
  const { user } = useAuth();

  const logSecurityEvent = async (event: SecurityEvent) => {
    try {
      // Get client IP and user agent
      const userAgent = navigator.userAgent;
      
      const eventData = {
        ...event,
        user_id: event.user_id || user?.id,
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
        metadata: {
          ...event.metadata,
          url: window.location.href,
          referrer: document.referrer
        }
      };

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Security Event:', eventData);
      }

      // In production, you could send this to a logging service
      // For now, we'll use Supabase edge functions or a dedicated logging table
      
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  return { logSecurityEvent };
};