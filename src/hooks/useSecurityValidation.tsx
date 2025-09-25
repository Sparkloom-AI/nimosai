import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  validateAndSanitizeEmail, 
  validatePassword, 
  validateName,
  detectSuspiciousActivity,
  sanitizeErrorMessage 
} from '@/lib/security';
import { useSecurityLogger } from './useSecurityLogger';

interface ValidationResult {
  isValid: boolean;
  sanitizedValue?: string;
  error?: string;
}

export const useSecurityValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const { logSecurityEvent } = useSecurityLogger();

  const validateEmail = useCallback(async (email: string): Promise<ValidationResult> => {
    setIsValidating(true);
    try {
      if (detectSuspiciousActivity(email)) {
        await logSecurityEvent({
          event_type: 'suspicious_activity',
          metadata: { input_type: 'email', pattern: 'xss_attempt' }
        });
        return { isValid: false, error: 'Invalid email format' };
      }

      const sanitized = validateAndSanitizeEmail(email);
      return { isValid: true, sanitizedValue: sanitized };
    } catch (error) {
      return { isValid: false, error: sanitizeErrorMessage(error as Error) };
    } finally {
      setIsValidating(false);
    }
  }, [logSecurityEvent]);

  const validatePasswordInput = useCallback(async (password: string): Promise<ValidationResult> => {
    setIsValidating(true);
    try {
      if (detectSuspiciousActivity(password)) {
        await logSecurityEvent({
          event_type: 'suspicious_activity',
          metadata: { input_type: 'password', pattern: 'xss_attempt' }
        });
        return { isValid: false, error: 'Invalid password format' };
      }

      validatePassword(password);
      return { isValid: true, sanitizedValue: password };
    } catch (error) {
      return { isValid: false, error: sanitizeErrorMessage(error as Error) };
    } finally {
      setIsValidating(false);
    }
  }, [logSecurityEvent]);

  const validateNameInput = useCallback(async (name: string): Promise<ValidationResult> => {
    setIsValidating(true);
    try {
      if (detectSuspiciousActivity(name)) {
        await logSecurityEvent({
          event_type: 'suspicious_activity',
          metadata: { input_type: 'name', pattern: 'xss_attempt' }
        });
        return { isValid: false, error: 'Invalid name format' };
      }

      const sanitized = validateName(name);
      return { isValid: true, sanitizedValue: sanitized };
    } catch (error) {
      return { isValid: false, error: sanitizeErrorMessage(error as Error) };
    } finally {
      setIsValidating(false);
    }
  }, [logSecurityEvent]);

  const validateForm = useCallback(async (data: Record<string, string>): Promise<{
    isValid: boolean;
    sanitizedData?: Record<string, string>;
    errors?: Record<string, string>;
  }> => {
    const results: Record<string, ValidationResult> = {};
    const errors: Record<string, string> = {};
    const sanitizedData: Record<string, string> = {};

    for (const [key, value] of Object.entries(data)) {
      if (key.includes('email')) {
        results[key] = await validateEmail(value);
      } else if (key.includes('password')) {
        results[key] = await validatePasswordInput(value);
      } else if (key.includes('name') || key.includes('Name')) {
        // Skip security validation for empty required fields - let form validation handle it
        if (value.trim() === '') {
          results[key] = { isValid: true, sanitizedValue: value };
        } else {
          results[key] = await validateNameInput(value);
        }
      } else {
        // Generic validation for other fields
        if (detectSuspiciousActivity(value)) {
          results[key] = { isValid: false, error: 'Invalid input format' };
        } else {
          results[key] = { isValid: true, sanitizedValue: value.trim() };
        }
      }

      if (!results[key].isValid) {
        errors[key] = results[key].error || 'Invalid input';
      } else {
        sanitizedData[key] = results[key].sanitizedValue || value;
      }
    }

    const isValid = Object.values(results).every(result => result.isValid);
    
    if (!isValid) {
      Object.values(errors).forEach(error => toast.error(error));
    }

    return {
      isValid,
      sanitizedData: isValid ? sanitizedData : undefined,
      errors: isValid ? undefined : errors
    };
  }, [validateEmail, validatePasswordInput, validateNameInput]);

  return {
    validateEmail,
    validatePassword: validatePasswordInput,
    validateName: validateNameInput,
    validateForm,
    isValidating
  };
};