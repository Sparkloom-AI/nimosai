// Security utilities for the application
import { z } from 'zod';

// Input validation schemas
export const emailSchema = z.string().email('Invalid email address').max(254);
export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters').max(128);
export const nameSchema = z.string().min(1, 'This field is required').max(100);
export const phoneSchema = z.string().regex(/^\+?[\d\s\-()]+$/, 'Invalid phone number').max(20);

// Enhanced sanitization functions
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>'"&]/g, '') // Remove potential XSS characters
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/vbscript:/gi, '') // Remove vbscript protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
};

export const sanitizeEmail = (email: string): string => {
  return email
    .toLowerCase()
    .trim()
    .replace(/[<>'"&]/g, '')
    .substring(0, 254); // RFC 5321 limit
};

export const sanitizePhone = (phone: string): string => {
  return phone
    .trim()
    .replace(/[^\d\s\-()+ ]/g, '') // Only allow phone-related characters
    .substring(0, 20);
};

// Security event types for logging
export const SECURITY_EVENTS = {
  LOGIN_ATTEMPT: 'login_attempt',
  LOGIN_SUCCESS: 'login_success', 
  LOGIN_FAILURE: 'login_failure',
  LOGOUT: 'logout',
  PASSWORD_RESET_REQUEST: 'password_reset_request',
  PASSWORD_CHANGE: 'password_change',
  ACCOUNT_CREATION: 'account_creation',
  ROLE_ASSIGNED: 'role_assigned',
  ROLE_REMOVED: 'role_removed',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  ACCESS_DENIED: 'access_denied'
} as const;

export type SecurityEventType = typeof SECURITY_EVENTS[keyof typeof SECURITY_EVENTS];

// Rate limiting configuration
export const RATE_LIMITS = {
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000 // 30 minutes
  },
  PASSWORD_RESET: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000 // 1 hour
  },
  REGISTRATION: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000 // 1 hour
  }
} as const;

// Content Security Policy helpers
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", "data:", "https:"],
  'connect-src': ["'self'", "https://*.supabase.co", "https://*.google.com"],
  'font-src': ["'self'", "data:"],
  'frame-src': ["'none'"]
};

// Validation helpers
export const validateAndSanitizeEmail = (email: string): string => {
  const sanitized = sanitizeEmail(email);
  emailSchema.parse(sanitized);
  return sanitized;
};

export const validatePassword = (password: string): void => {
  passwordSchema.parse(password);
};

export const validateName = (name: string): string => {
  const sanitized = sanitizeInput(name);
  nameSchema.parse(sanitized);
  return sanitized;
};

// Error message sanitization - remove sensitive information
export const sanitizeErrorMessage = (error: Error | string): string => {
  const message = typeof error === 'string' ? error : error.message;
  
  // Remove specific error details that could leak information
  if (message.includes('JWT')) return 'Authentication error';
  if (message.includes('database')) return 'Service temporarily unavailable';
  if (message.includes('constraint')) return 'Invalid request';
  if (message.includes('permission')) return 'Access denied';
  
  return message;
};

// Security headers for API responses
export const getSecurityHeaders = () => ({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
});

// Check if user input appears suspicious
export const detectSuspiciousActivity = (input: string): boolean => {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /expression\s*\(/i,
    /%3cscript/i,
    /vbscript:/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(input));
};