import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSecurityLogger } from './useSecurityLogger';

interface SecurityCheck {
  isAllowed: boolean;
  reason?: string;
}

export const useEnhancedSecurity = () => {
  const [securityState, setSecurityState] = useState({
    isBlocked: false,
    lastCheck: null as Date | null,
    attempts: 0
  });
  const { logSecurityEvent } = useSecurityLogger();

  // Check rate limiting for sensitive operations
  const checkRateLimit = useCallback(async (
    actionType: string = 'general',
    maxAttempts: number = 10,
    windowMinutes: number = 15
  ): Promise<SecurityCheck> => {
    try {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        p_action_type: actionType,
        p_max_attempts: maxAttempts,
        p_window_minutes: windowMinutes
      });

      if (error) {
        console.error('Rate limit check failed:', error);
        return { isAllowed: false, reason: 'Security check failed' };
      }

      if (!data) {
        setSecurityState(prev => ({
          ...prev,
          isBlocked: true,
          lastCheck: new Date(),
          attempts: prev.attempts + 1
        }));
        
        await logSecurityEvent({
          event_type: 'suspicious_activity',
          metadata: { action_type: actionType, attempts: maxAttempts, reason: 'rate_limit_exceeded' }
        });
        
        return { 
          isAllowed: false, 
          reason: `Too many ${actionType} attempts. Please wait before trying again.` 
        };
      }

      return { isAllowed: true };
    } catch (error) {
      console.error('Security check error:', error);
      return { isAllowed: false, reason: 'Security validation failed' };
    }
  }, [logSecurityEvent]);

  // Validate studio access with enhanced logging
  const validateStudioAccess = useCallback(async (
    studioId: string,
    action: string = 'access'
  ): Promise<SecurityCheck> => {
    try {
      const { data, error } = await supabase.rpc('validate_studio_access_secure', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_studio_id: studioId,
        p_action: action
      });

      if (error) {
        console.error('Studio access validation failed:', error);
        return { isAllowed: false, reason: 'Access validation failed' };
      }

      if (!data) {
        await logSecurityEvent({
          event_type: 'suspicious_activity',
          metadata: { studio_id: studioId, action, reason: 'access_denied' }
        });
        
        return { 
          isAllowed: false, 
          reason: 'You do not have permission to access this studio' 
        };
      }

      return { isAllowed: true };
    } catch (error) {
      console.error('Studio access check error:', error);
      return { isAllowed: false, reason: 'Access check failed' };
    }
  }, [logSecurityEvent]);

  // Enhanced input validation with security logging
  const validateSecureInput = useCallback((
    input: string,
    inputType: string = 'general',
    maxLength: number = 1000
  ): SecurityCheck => {
    // Check input length
    if (input.length > maxLength) {
      logSecurityEvent({
        event_type: 'suspicious_activity',
        metadata: { 
          input_type: inputType, 
          reason: 'excessive_length',
          length: input.length 
        }
      });
      return { 
        isAllowed: false, 
        reason: `Input too long (max ${maxLength} characters)` 
      };
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /expression\s*\(/i,
      /%3cscript/i,
      /vbscript:/i,
      /data:\s*text\/html/i,
      /&#/,
      /\x00-\x08\x0b\x0c\x0e-\x1f/
    ];

    const foundPattern = suspiciousPatterns.find(pattern => pattern.test(input));
    if (foundPattern) {
      logSecurityEvent({
        event_type: 'suspicious_activity',
        metadata: { 
          input_type: inputType,
          pattern: foundPattern.toString(),
          value: input.substring(0, 50) + '...'
        }
      });
      return { 
        isAllowed: false, 
        reason: 'Input contains potentially harmful content' 
      };
    }

    return { isAllowed: true };
  }, [logSecurityEvent]);

  // Reset security state
  const resetSecurityState = useCallback(() => {
    setSecurityState({
      isBlocked: false,
      lastCheck: null,
      attempts: 0
    });
  }, []);

  return {
    securityState,
    checkRateLimit,
    validateStudioAccess,
    validateSecureInput,
    resetSecurityState
  };
};