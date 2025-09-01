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
      
      // Get client IP from headers (if available via proxy)
      const getClientIP = async (): Promise<string | null> => {
        try {
          // Try to get IP from ipify service (respects privacy)
          const response = await fetch('https://api.ipify.org?format=json', {
            method: 'GET',
            signal: AbortSignal.timeout(2000) // 2 second timeout
          });
          const data = await response.json();
          return data.ip || null;
        } catch {
          return null; // Silent fallback if IP detection fails
        }
      };

      const clientIP = await getClientIP();
      
      const eventData = {
        event_type: event.event_type,
        user_id: event.user_id || user?.id,
        user_agent: userAgent.substring(0, 255), // Limit length
        event_details: {
          ...event.metadata,
          url: window.location.origin, // Only origin, not full path
          timestamp: new Date().toISOString(),
          client_ip: clientIP, // Add IP for geographic context
          user_agent_full: userAgent.substring(0, 500) // More context for analysis
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