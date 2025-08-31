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
      // Get client IP and user agent (sanitized)
      const userAgent = navigator.userAgent;
      
      const eventData = {
        event_type: event.event_type,
        user_id: event.user_id || user?.id,
        user_agent: userAgent.substring(0, 255), // Limit length
        event_details: {
          ...event.metadata,
          url: window.location.origin, // Only origin, not full path
          timestamp: new Date().toISOString()
        },
        success: true
      };

      // Store security events in the database
      const { error } = await supabase
        .from('security_audit_log')
        .insert(eventData);

      if (error && process.env.NODE_ENV === 'development') {
        console.error('Failed to log security event:', error);
      }
      
    } catch (error) {
      // Silent failure in production
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to log security event:', error);
      }
    }
  };

  return { logSecurityEvent };
};