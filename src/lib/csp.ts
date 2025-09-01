// Content Security Policy configuration
export const CSP_CONFIG = {
  // Core directives
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for chart components and React
    "'unsafe-eval'", // Required for Vite dev mode
    "https://cdn.jsdelivr.net", // Chart.js and other CDN resources
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for dynamic styling and Tailwind
    "https://fonts.googleapis.com",
  ],
  'img-src': [
    "'self'",
    "data:", // For base64 images
    "https:", // Allow HTTPS images
    "blob:", // For blob URLs
  ],
  'connect-src': [
    "'self'",
    "https://*.supabase.co", // Supabase backend
    "https://*.google.com", // Google Maps and services
    "https://api.ipify.org", // IP detection service
    "https://api.openai.com", // OpenAI API (if called from client)
  ],
  'font-src': [
    "'self'",
    "data:",
    "https://fonts.gstatic.com",
  ],
  'frame-src': ["'none'"], // Prevent iframe embedding
  'object-src': ["'none'"], // Prevent object/embed elements
  'base-uri': ["'self'"], // Restrict base tag
  'form-action': ["'self'"], // Restrict form submissions
  'frame-ancestors': ["'none'"], // Prevent being framed
  'upgrade-insecure-requests': [], // Upgrade HTTP to HTTPS
};

// Generate CSP header string
export const generateCSPHeader = (): string => {
  return Object.entries(CSP_CONFIG)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
};

// Security headers for API responses
export const getSecurityHeaders = () => ({
  'Content-Security-Policy': generateCSPHeader(),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
});