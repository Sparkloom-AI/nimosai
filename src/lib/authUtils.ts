import { User } from '@supabase/supabase-js';
import { timezones as dropdownTimezones } from '@/hooks/useIPLocationDetection';

export interface GoogleUserMetadata {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  fullName: string;
}

export interface SmartLocationDefaults {
  country: string;
  countryCode: string;
  phonePrefix: string;
  timezone: string;
  currency: string;
  language: string;
}

/**
 * Extract user data from Google OAuth metadata
 */
export const extractGoogleUserMetadata = (user: User): GoogleUserMetadata | null => {
  if (!user?.user_metadata) return null;

  const metadata = user.user_metadata;
  
  // Google provides these fields in user_metadata
  const fullName = metadata.full_name || metadata.name || '';
  const email = user.email || metadata.email || '';
  const avatarUrl = metadata.avatar_url || metadata.picture;
  
  // Smart name parsing
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    firstName,
    lastName,
    email,
    avatarUrl,
    fullName
  };
};

/**
 * Check if user signed up via Google OAuth
 */
export const isGoogleSignup = (user: User): boolean => {
  return user?.app_metadata?.provider === 'google';
};

/**
 * Get browser-based location defaults with comprehensive fallbacks
 */
export const getBrowserLocationDefaults = (): SmartLocationDefaults => {
  // Get timezone from browser
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
  
  // Convert IANA timezone to dropdown display label when possible
  const formatTimezoneForDropdown = (ianaTz: string): string => {
    try {
      if (!ianaTz) return '';
      
      // Enhanced mapping for better timezone detection
      const timezoneMapping: { [key: string]: string } = {
        'Asia/Jakarta': '(GMT +07:00) Jakarta',
        'Asia/Makassar': '(GMT +08:00) Makassar',
        'Asia/Jayapura': '(GMT +09:00) Jayapura',
        'America/New_York': '(GMT -05:00) New York',
        'Europe/London': '(GMT +00:00) London',
        'Australia/Sydney': '(GMT +10:00) Sydney',
        'Europe/Berlin': '(GMT +01:00) Berlin',
        'Asia/Tokyo': '(GMT +09:00) Tokyo',
        'Asia/Singapore': '(GMT +08:00) Singapore'
      };
      
      // Direct mapping first
      if (timezoneMapping[ianaTz]) {
        return timezoneMapping[ianaTz];
      }
      
      // Fallback to city-based matching
      const city = ianaTz.includes('/') ? ianaTz.split('/')[1].replace(/_/g, ' ') : ianaTz;
      const match = dropdownTimezones.find((tz) => tz.toLowerCase().includes(city.toLowerCase()));
      return match || '';
    } catch {
      return '';
    }
  };
  
  const displayTimezone = formatTimezoneForDropdown(timezone);
  
  // Get language from browser and normalize to dropdown language names
  const browserLanguage = navigator.language || 'en';
  const langCode = browserLanguage.split('-')[0];
  const languageMap: { [key: string]: string } = {
    ar: 'العربية', bg: 'Български', cs: 'Čeština', da: 'Dansk', de: 'Deutsch',
    el: 'Ελληνικά', en: 'English', es: 'Español', fi: 'Suomi', fr: 'Français',
    he: 'עברית', hr: 'Hrvatski', hu: 'Magyar', id: 'Indonesia', it: 'Italiano',
    ja: '日本語', ko: '한국어', lt: 'Lietuvių', nb: 'Norsk Bokmål', nl: 'Nederlands',
    pl: 'Polski', pt: 'Português (Brasil)', ro: 'Română', ru: 'Русский', sl: 'Slovenščina',
    sv: 'Svenska', th: 'ไทย', uk: 'Українська', vi: 'Tiếng Việt', zh: '中文'
  };
  const language = languageMap[langCode] || 'English';
  
  // Detect country from timezone or language
  let countryCode = 'US';
  let country = 'United States';
  
  // Try to extract country from timezone with better mapping
  if (timezone.includes('/')) {
    // Direct timezone to country mapping for better accuracy
    const timezoneToCountryMap: { [key: string]: { code: string; name: string } } = {
      'Asia/Jakarta': { code: 'ID', name: 'Indonesia' },
      'Asia/Makassar': { code: 'ID', name: 'Indonesia' },
      'Asia/Jayapura': { code: 'ID', name: 'Indonesia' },
      'America/New_York': { code: 'US', name: 'United States' },
      'America/Los_Angeles': { code: 'US', name: 'United States' },
      'America/Chicago': { code: 'US', name: 'United States' },
      'Europe/London': { code: 'GB', name: 'United Kingdom' },
      'Australia/Sydney': { code: 'AU', name: 'Australia' },
      'Europe/Berlin': { code: 'DE', name: 'Germany' },
      'Asia/Tokyo': { code: 'JP', name: 'Japan' },
      'Asia/Singapore': { code: 'SG', name: 'Singapore' }
    };
    
    // Check direct mapping first
    if (timezoneToCountryMap[timezone]) {
      countryCode = timezoneToCountryMap[timezone].code;
      country = timezoneToCountryMap[timezone].name;
    } else {
      // Fallback to region-based mapping
      const timezoneParts = timezone.split('/');
      const region = timezoneParts[0];
      
      const regionToCountry: { [key: string]: { code: string; name: string } } = {
        'Europe': { code: 'DE', name: 'Germany' },
        'Asia': { code: 'ID', name: 'Indonesia' }, // Changed default for Asia to Indonesia
        'America': { code: 'US', name: 'United States' },
        'Australia': { code: 'AU', name: 'Australia' },
        'Africa': { code: 'ZA', name: 'South Africa' }
      };
      
      if (regionToCountry[region]) {
        countryCode = regionToCountry[region].code;
        country = regionToCountry[region].name;
      }
    }
  }
  
  // Try to extract country from browser language if timezone didn't work
  if (browserLanguage.includes('-')) {
    const langCountry = browserLanguage.split('-')[1]?.toUpperCase();
    if (langCountry && langCountry.length === 2) {
      countryCode = langCountry;
      // Map common country codes to names
      const countryNames: { [key: string]: string } = {
        'US': 'United States',
        'GB': 'United Kingdom',
        'CA': 'Canada',
        'AU': 'Australia',
        'DE': 'Germany',
        'FR': 'France',
        'ES': 'Spain',
        'IT': 'Italy',
        'NL': 'Netherlands',
        'SE': 'Sweden',
        'NO': 'Norway',
        'DK': 'Denmark',
        'FI': 'Finland',
        'JP': 'Japan',
        'KR': 'South Korea',
        'CN': 'China',
        'IN': 'India',
        'BR': 'Brazil',
        'MX': 'Mexico',
        'AR': 'Argentina'
      };
      country = countryNames[countryCode] || country;
    }
  }
  
  // Get currency and phone prefix based on country
  const { currency, phonePrefix } = getCountryDefaults(countryCode);
  
  // If no timezone was found via formatting, use country-specific default
  let finalTimezone = displayTimezone;
  if (!finalTimezone) {
    const countryTimezoneDefaults: { [key: string]: string } = {
      'ID': '(GMT +07:00) Jakarta',
      'US': '(GMT -05:00) New York', 
      'GB': '(GMT +00:00) London',
      'AU': '(GMT +10:00) Sydney',
      'DE': '(GMT +01:00) Berlin',
      'JP': '(GMT +09:00) Tokyo',
      'SG': '(GMT +08:00) Singapore'
    };
    finalTimezone = countryTimezoneDefaults[countryCode] || '(GMT +00:00) UTC';
  }
  
  return {
    country,
    countryCode,
    phonePrefix,
    timezone: finalTimezone,
    currency,
    language
  };
};

/**
 * Get country-specific defaults (currency and phone prefix)
 */
export const getCountryDefaults = (countryCode: string): { currency: string; phonePrefix: string } => {
  const countryDefaults: { [key: string]: { currency: string; phonePrefix: string } } = {
    'US': { currency: 'USD', phonePrefix: '+1' },
    'CA': { currency: 'CAD', phonePrefix: '+1' },
    'GB': { currency: 'GBP', phonePrefix: '+44' },
    'AU': { currency: 'AUD', phonePrefix: '+61' },
    'DE': { currency: 'EUR', phonePrefix: '+49' },
    'FR': { currency: 'EUR', phonePrefix: '+33' },
    'ES': { currency: 'EUR', phonePrefix: '+34' },
    'IT': { currency: 'EUR', phonePrefix: '+39' },
    'NL': { currency: 'EUR', phonePrefix: '+31' },
    'AT': { currency: 'EUR', phonePrefix: '+43' },
    'BE': { currency: 'EUR', phonePrefix: '+32' },
    'FI': { currency: 'EUR', phonePrefix: '+358' },
    'IE': { currency: 'EUR', phonePrefix: '+353' },
    'PT': { currency: 'EUR', phonePrefix: '+351' },
    'SE': { currency: 'SEK', phonePrefix: '+46' },
    'NO': { currency: 'NOK', phonePrefix: '+47' },
    'DK': { currency: 'DKK', phonePrefix: '+45' },
    'CH': { currency: 'CHF', phonePrefix: '+41' },
    'JP': { currency: 'JPY', phonePrefix: '+81' },
    'KR': { currency: 'KRW', phonePrefix: '+82' },
    'CN': { currency: 'CNY', phonePrefix: '+86' },
    'IN': { currency: 'INR', phonePrefix: '+91' },
    'ID': { currency: 'IDR', phonePrefix: '+62' },
    'TH': { currency: 'THB', phonePrefix: '+66' },
    'MY': { currency: 'MYR', phonePrefix: '+60' },
    'SG': { currency: 'SGD', phonePrefix: '+65' },
    'PH': { currency: 'PHP', phonePrefix: '+63' },
    'VN': { currency: 'VND', phonePrefix: '+84' },
    'BR': { currency: 'BRL', phonePrefix: '+55' },
    'MX': { currency: 'MXN', phonePrefix: '+52' },
    'AR': { currency: 'ARS', phonePrefix: '+54' },
    'CL': { currency: 'CLP', phonePrefix: '+56' },
    'CO': { currency: 'COP', phonePrefix: '+57' },
    'PE': { currency: 'PEN', phonePrefix: '+51' },
    'ZA': { currency: 'ZAR', phonePrefix: '+27' },
    'EG': { currency: 'EGP', phonePrefix: '+20' },
    'NG': { currency: 'NGN', phonePrefix: '+234' },
    'KE': { currency: 'KES', phonePrefix: '+254' },
    'GH': { currency: 'GHS', phonePrefix: '+233' },
    'RU': { currency: 'RUB', phonePrefix: '+7' },
    'PL': { currency: 'PLN', phonePrefix: '+48' },
    'CZ': { currency: 'CZK', phonePrefix: '+420' },
    'HU': { currency: 'HUF', phonePrefix: '+36' },
    'RO': { currency: 'RON', phonePrefix: '+40' },
    'BG': { currency: 'BGN', phonePrefix: '+359' },
    'HR': { currency: 'EUR', phonePrefix: '+385' },
    'SI': { currency: 'EUR', phonePrefix: '+386' },
    'SK': { currency: 'EUR', phonePrefix: '+421' },
    'EE': { currency: 'EUR', phonePrefix: '+372' },
    'LV': { currency: 'EUR', phonePrefix: '+371' },
    'LT': { currency: 'EUR', phonePrefix: '+370' },
    'IS': { currency: 'ISK', phonePrefix: '+354' },
    'TR': { currency: 'TRY', phonePrefix: '+90' },
    'IL': { currency: 'ILS', phonePrefix: '+972' },
    'AE': { currency: 'AED', phonePrefix: '+971' },
    'SA': { currency: 'SAR', phonePrefix: '+966' },
    'QA': { currency: 'QAR', phonePrefix: '+974' },
    'KW': { currency: 'KWD', phonePrefix: '+965' },
    'BH': { currency: 'BHD', phonePrefix: '+973' },
    'OM': { currency: 'OMR', phonePrefix: '+968' },
    'JO': { currency: 'JOD', phonePrefix: '+962' },
    'LB': { currency: 'LBP', phonePrefix: '+961' },
    'HK': { currency: 'HKD', phonePrefix: '+852' },
    'TW': { currency: 'TWD', phonePrefix: '+886' },
    'NZ': { currency: 'NZD', phonePrefix: '+64' }
  };
  
  return countryDefaults[countryCode] || { currency: 'USD', phonePrefix: '+1' };
};

/**
 * Merge IP-based detection with browser-based detection
 */
export const mergeLocationData = (
  ipData: any,
  browserDefaults: SmartLocationDefaults
): SmartLocationDefaults => {
  return {
    country: ipData?.country || browserDefaults.country,
    countryCode: ipData?.countryCode || browserDefaults.countryCode,
    phonePrefix: ipData?.phonePrefix || browserDefaults.phonePrefix,
    // Prefer IP timezone over browser to reflect actual location
    timezone: ipData?.timezone || browserDefaults.timezone,
    currency: ipData?.currency || browserDefaults.currency,
    // Prefer browser for language, but fall back to IP label if needed
    language: browserDefaults.language || ipData?.language
  };
};