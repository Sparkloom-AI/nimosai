import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface LocationData {
  country: string;
  countryCode: string;
  phonePrefix: string;
  timezone: string;
  currency: string;
  language: string;
}

interface LocationSettingsProps {
  value: LocationData;
  onChange: (data: LocationData) => void;
}

const countries = [
  { code: 'ID', name: 'Indonesia', phone: '+62', timezone: '(GMT +07:00) Jakarta', currency: 'Indonesian Rupiah - IDR', flag: '🇮🇩', language: 'Indonesia', gmtOffset: 7 },
  { code: 'US', name: 'United States', phone: '+1', timezone: '(GMT -05:00) New York', currency: 'US Dollar - USD', flag: '🇺🇸', language: 'English', gmtOffset: -5 },
  { code: 'GB', name: 'United Kingdom', phone: '+44', timezone: '(GMT +00:00) London', currency: 'British Pound - GBP', flag: '🇬🇧', language: 'English', gmtOffset: 0 },
  { code: 'AU', name: 'Australia', phone: '+61', timezone: '(GMT +10:00) Sydney', currency: 'Australian Dollar - AUD', flag: '🇦🇺', language: 'English', gmtOffset: 10 },
  { code: 'DE', name: 'Germany', phone: '+49', timezone: '(GMT +01:00) Berlin', currency: 'Euro - EUR', flag: '🇩🇪', language: 'Deutsch', gmtOffset: 1 },
  { code: 'FR', name: 'France', phone: '+33', timezone: '(GMT +01:00) Paris', currency: 'Euro - EUR', flag: '🇫🇷', language: 'français', gmtOffset: 1 },
  { code: 'IT', name: 'Italy', phone: '+39', timezone: '(GMT +01:00) Rome', currency: 'Euro - EUR', flag: '🇮🇹', language: 'italiano', gmtOffset: 1 },
  { code: 'ES', name: 'Spain', phone: '+34', timezone: '(GMT +01:00) Madrid', currency: 'Euro - EUR', flag: '🇪🇸', language: 'español', gmtOffset: 1 },
  { code: 'NL', name: 'Netherlands', phone: '+31', timezone: '(GMT +01:00) Amsterdam', currency: 'Euro - EUR', flag: '🇳🇱', language: 'Nederlands', gmtOffset: 1 },
  { code: 'JP', name: 'Japan', phone: '+81', timezone: '(GMT +09:00) Tokyo', currency: 'Japanese Yen - JPY', flag: '🇯🇵', language: '日本語', gmtOffset: 9 },
  { code: 'KR', name: 'South Korea', phone: '+82', timezone: '(GMT +09:00) Seoul', currency: 'South Korean Won - KRW', flag: '🇰🇷', language: 'English', gmtOffset: 9 },
  { code: 'CN', name: 'China', phone: '+86', timezone: '(GMT +08:00) Beijing', currency: 'Chinese Yuan - CNY', flag: '🇨🇳', language: '中文', gmtOffset: 8 },
  { code: 'IN', name: 'India', phone: '+91', timezone: '(GMT +05:30) New Delhi', currency: 'Indian Rupee - INR', flag: '🇮🇳', language: 'English', gmtOffset: 5.5 },
  { code: 'SG', name: 'Singapore', phone: '+65', timezone: '(GMT +08:00) Singapore', currency: 'Singapore Dollar - SGD', flag: '🇸🇬', language: 'English', gmtOffset: 8 },
  { code: 'MY', name: 'Malaysia', phone: '+60', timezone: '(GMT +08:00) Kuala Lumpur', currency: 'Malaysian Ringgit - MYR', flag: '🇲🇾', language: 'English', gmtOffset: 8 },
  { code: 'TH', name: 'Thailand', phone: '+66', timezone: '(GMT +07:00) Bangkok', currency: 'Thai Baht - THB', flag: '🇹🇭', language: 'English', gmtOffset: 7 },
  { code: 'VN', name: 'Vietnam', phone: '+84', timezone: '(GMT +07:00) Ho Chi Minh City', currency: 'Vietnamese Dong - VND', flag: '🇻🇳', language: 'Tiếng Việt', gmtOffset: 7 },
  { code: 'PH', name: 'Philippines', phone: '+63', timezone: '(GMT +08:00) Manila', currency: 'Philippine Peso - PHP', flag: '🇵🇭', language: 'English', gmtOffset: 8 },
  { code: 'BR', name: 'Brazil', phone: '+55', timezone: '(GMT -03:00) São Paulo', currency: 'Brazilian Real - BRL', flag: '🇧🇷', language: 'português (Brasil)', gmtOffset: -3 },
  { code: 'MX', name: 'Mexico', phone: '+52', timezone: '(GMT -06:00) Mexico City', currency: 'Mexican Peso - MXN', flag: '🇲🇽', language: 'español', gmtOffset: -6 },
  { code: 'CA', name: 'Canada', phone: '+1', timezone: '(GMT -05:00) Toronto', currency: 'Canadian Dollar - CAD', flag: '🇨🇦', language: 'English', gmtOffset: -5 },
  { code: 'RU', name: 'Russia', phone: '+7', timezone: '(GMT +03:00) Moscow', currency: 'Russian Ruble - RUB', flag: '🇷🇺', language: 'русский', gmtOffset: 3 },
  { code: 'AR', name: 'Argentina', phone: '+54', timezone: '(GMT -03:00) Buenos Aires', currency: 'Argentine Peso - ARS', flag: '🇦🇷', language: 'español', gmtOffset: -3 },
  { code: 'CL', name: 'Chile', phone: '+56', timezone: '(GMT -03:00) Santiago', currency: 'Chilean Peso - CLP', flag: '🇨🇱', language: 'español', gmtOffset: -3 },
  { code: 'CO', name: 'Colombia', phone: '+57', timezone: '(GMT -05:00) Bogotá', currency: 'Colombian Peso - COP', flag: '🇨🇴', language: 'español', gmtOffset: -5 },
  { code: 'PE', name: 'Peru', phone: '+51', timezone: '(GMT -05:00) Lima', currency: 'Peruvian Sol - PEN', flag: '🇵🇪', language: 'español', gmtOffset: -5 },
  { code: 'ZA', name: 'South Africa', phone: '+27', timezone: '(GMT +02:00) Johannesburg', currency: 'South African Rand - ZAR', flag: '🇿🇦', language: 'English', gmtOffset: 2 },
  { code: 'EG', name: 'Egypt', phone: '+20', timezone: '(GMT +02:00) Cairo', currency: 'Egyptian Pound - EGP', flag: '🇪🇬', language: 'العربية', gmtOffset: 2 },
  { code: 'NG', name: 'Nigeria', phone: '+234', timezone: '(GMT +01:00) Lagos', currency: 'Nigerian Naira - NGN', flag: '🇳🇬', language: 'English', gmtOffset: 1 },
  { code: 'KE', name: 'Kenya', phone: '+254', timezone: '(GMT +03:00) Nairobi', currency: 'Kenyan Shilling - KES', flag: '🇰🇪', language: 'English', gmtOffset: 3 },
  { code: 'MA', name: 'Morocco', phone: '+212', timezone: '(GMT +00:00) Casablanca', currency: 'Moroccan Dirham - MAD', flag: '🇲🇦', language: 'العربية', gmtOffset: 0 },
  { code: 'TR', name: 'Turkey', phone: '+90', timezone: '(GMT +03:00) Istanbul', currency: 'Turkish Lira - TRY', flag: '🇹🇷', language: 'English', gmtOffset: 3 },
  { code: 'SA', name: 'Saudi Arabia', phone: '+966', timezone: '(GMT +03:00) Riyadh', currency: 'Saudi Riyal - SAR', flag: '🇸🇦', language: 'العربية', gmtOffset: 3 },
  { code: 'AE', name: 'United Arab Emirates', phone: '+971', timezone: '(GMT +04:00) Dubai', currency: 'UAE Dirham - AED', flag: '🇦🇪', language: 'العربية', gmtOffset: 4 },
  { code: 'IL', name: 'Israel', phone: '+972', timezone: '(GMT +02:00) Jerusalem', currency: 'Israeli Shekel - ILS', flag: '🇮🇱', language: 'עברית', gmtOffset: 2 },
];

// Comprehensive timezone list from GMT-11:00 to GMT+14:00
const allTimezones = [
  { name: '(GMT -11:00) Midway Island', gmtOffset: -11 },
  { name: '(GMT -10:00) Hawaii', gmtOffset: -10 },
  { name: '(GMT -09:30) Marquesas Islands', gmtOffset: -9.5 },
  { name: '(GMT -09:00) Alaska', gmtOffset: -9 },
  { name: '(GMT -08:00) Pacific Time (US & Canada)', gmtOffset: -8 },
  { name: '(GMT -07:00) Mountain Time (US & Canada)', gmtOffset: -7 },
  { name: '(GMT -06:00) Central Time (US & Canada)', gmtOffset: -6 },
  { name: '(GMT -06:00) Mexico City', gmtOffset: -6 },
  { name: '(GMT -05:00) Eastern Time (US & Canada)', gmtOffset: -5 },
  { name: '(GMT -05:00) New York', gmtOffset: -5 },
  { name: '(GMT -05:00) Toronto', gmtOffset: -5 },
  { name: '(GMT -05:00) Bogotá', gmtOffset: -5 },
  { name: '(GMT -05:00) Lima', gmtOffset: -5 },
  { name: '(GMT -04:30) Caracas', gmtOffset: -4.5 },
  { name: '(GMT -04:00) Atlantic Time (Canada)', gmtOffset: -4 },
  { name: '(GMT -04:00) Santiago', gmtOffset: -4 },
  { name: '(GMT -03:30) Newfoundland', gmtOffset: -3.5 },
  { name: '(GMT -03:00) Brazil', gmtOffset: -3 },
  { name: '(GMT -03:00) São Paulo', gmtOffset: -3 },
  { name: '(GMT -03:00) Buenos Aires', gmtOffset: -3 },
  { name: '(GMT -02:00) Mid-Atlantic', gmtOffset: -2 },
  { name: '(GMT -01:00) Azores', gmtOffset: -1 },
  { name: '(GMT +00:00) Greenwich Mean Time', gmtOffset: 0 },
  { name: '(GMT +00:00) London', gmtOffset: 0 },
  { name: '(GMT +00:00) Casablanca', gmtOffset: 0 },
  { name: '(GMT +01:00) Central European Time', gmtOffset: 1 },
  { name: '(GMT +01:00) Berlin', gmtOffset: 1 },
  { name: '(GMT +01:00) Paris', gmtOffset: 1 },
  { name: '(GMT +01:00) Rome', gmtOffset: 1 },
  { name: '(GMT +01:00) Madrid', gmtOffset: 1 },
  { name: '(GMT +01:00) Amsterdam', gmtOffset: 1 },
  { name: '(GMT +01:00) Lagos', gmtOffset: 1 },
  { name: '(GMT +02:00) Eastern European Time', gmtOffset: 2 },
  { name: '(GMT +02:00) Cairo', gmtOffset: 2 },
  { name: '(GMT +02:00) Johannesburg', gmtOffset: 2 },
  { name: '(GMT +02:00) Jerusalem', gmtOffset: 2 },
  { name: '(GMT +03:00) Moscow', gmtOffset: 3 },
  { name: '(GMT +03:00) Istanbul', gmtOffset: 3 },
  { name: '(GMT +03:00) Riyadh', gmtOffset: 3 },
  { name: '(GMT +03:00) Nairobi', gmtOffset: 3 },
  { name: '(GMT +03:30) Tehran', gmtOffset: 3.5 },
  { name: '(GMT +04:00) Dubai', gmtOffset: 4 },
  { name: '(GMT +04:00) Baku', gmtOffset: 4 },
  { name: '(GMT +04:30) Kabul', gmtOffset: 4.5 },
  { name: '(GMT +05:00) Pakistan', gmtOffset: 5 },
  { name: '(GMT +05:30) India', gmtOffset: 5.5 },
  { name: '(GMT +05:30) New Delhi', gmtOffset: 5.5 },
  { name: '(GMT +05:45) Nepal', gmtOffset: 5.75 },
  { name: '(GMT +06:00) Bangladesh', gmtOffset: 6 },
  { name: '(GMT +06:30) Myanmar', gmtOffset: 6.5 },
  { name: '(GMT +07:00) Bangkok', gmtOffset: 7 },
  { name: '(GMT +07:00) Jakarta', gmtOffset: 7 },
  { name: '(GMT +07:00) Ho Chi Minh City', gmtOffset: 7 },
  { name: '(GMT +08:00) China Standard Time', gmtOffset: 8 },
  { name: '(GMT +08:00) Beijing', gmtOffset: 8 },
  { name: '(GMT +08:00) Singapore', gmtOffset: 8 },
  { name: '(GMT +08:00) Kuala Lumpur', gmtOffset: 8 },
  { name: '(GMT +08:00) Manila', gmtOffset: 8 },
  { name: '(GMT +08:00) Perth', gmtOffset: 8 },
  { name: '(GMT +08:45) Eucla', gmtOffset: 8.75 },
  { name: '(GMT +09:00) Japan Standard Time', gmtOffset: 9 },
  { name: '(GMT +09:00) Tokyo', gmtOffset: 9 },
  { name: '(GMT +09:00) Seoul', gmtOffset: 9 },
  { name: '(GMT +09:30) Adelaide', gmtOffset: 9.5 },
  { name: '(GMT +10:00) Australian Eastern Time', gmtOffset: 10 },
  { name: '(GMT +10:00) Sydney', gmtOffset: 10 },
  { name: '(GMT +10:30) Lord Howe Island', gmtOffset: 10.5 },
  { name: '(GMT +11:00) Solomon Islands', gmtOffset: 11 },
  { name: '(GMT +11:30) Norfolk Island', gmtOffset: 11.5 },
  { name: '(GMT +12:00) New Zealand', gmtOffset: 12 },
  { name: '(GMT +12:45) Chatham Islands', gmtOffset: 12.75 },
  { name: '(GMT +13:00) Tonga', gmtOffset: 13 },
  { name: '(GMT +14:00) Line Islands', gmtOffset: 14 },
];

// Comprehensive list of world currencies
const worldCurrencies = [
  'Afghan Afghani - AFN',
  'Albanian Lek - ALL',
  'Algerian Dinar - DZD',
  'Angolan Kwanza - AOA',
  'Argentine Peso - ARS',
  'Armenian Dram - AMD',
  'Aruban Florin - AWG',
  'Australian Dollar - AUD',
  'Azerbaijani Manat - AZN',
  'Bahamian Dollar - BSD',
  'Bahraini Dinar - BHD',
  'Bangladeshi Taka - BDT',
  'Barbadian Dollar - BBD',
  'Belarusian Ruble - BYN',
  'Belize Dollar - BZD',
  'Bermudian Dollar - BMD',
  'Bhutanese Ngultrum - BTN',
  'Bolivian Boliviano - BOB',
  'Bosnia-Herzegovina Convertible Mark - BAM',
  'Botswanan Pula - BWP',
  'Brazilian Real - BRL',
  'British Pound - GBP',
  'Brunei Dollar - BND',
  'Bulgarian Lev - BGN',
  'Burundian Franc - BIF',
  'Cambodian Riel - KHR',
  'Canadian Dollar - CAD',
  'Cape Verdean Escudo - CVE',
  'Cayman Islands Dollar - KYD',
  'CFA Franc BCEAO - XOF',
  'CFA Franc BEAC - XAF',
  'CFP Franc - XPF',
  'Chilean Peso - CLP',
  'Chinese Yuan - CNY',
  'Colombian Peso - COP',
  'Comorian Franc - KMF',
  'Congolese Franc - CDF',
  'Costa Rican Colón - CRC',
  'Croatian Kuna - HRK',
  'Cuban Peso - CUP',
  'Czech Koruna - CZK',
  'Danish Krone - DKK',
  'Djiboutian Franc - DJF',
  'Dominican Peso - DOP',
  'East Caribbean Dollar - XCD',
  'Egyptian Pound - EGP',
  'Eritrean Nakfa - ERN',
  'Estonian Kroon - EEK',
  'Ethiopian Birr - ETB',
  'Euro - EUR',
  'Falkland Islands Pound - FKP',
  'Fijian Dollar - FJD',
  'Gambian Dalasi - GMD',
  'Georgian Lari - GEL',
  'Ghanaian Cedi - GHS',
  'Gibraltar Pound - GIP',
  'Guatemalan Quetzal - GTQ',
  'Guinean Franc - GNF',
  'Guyanaese Dollar - GYD',
  'Haitian Gourde - HTG',
  'Honduran Lempira - HNL',
  'Hong Kong Dollar - HKD',
  'Hungarian Forint - HUF',
  'Icelandic Króna - ISK',
  'Indian Rupee - INR',
  'Indonesian Rupiah - IDR',
  'Iranian Rial - IRR',
  'Iraqi Dinar - IQD',
  'Israeli Shekel - ILS',
  'Jamaican Dollar - JMD',
  'Japanese Yen - JPY',
  'Jordanian Dinar - JOD',
  'Kazakhstani Tenge - KZT',
  'Kenyan Shilling - KES',
  'Kuwaiti Dinar - KWD',
  'Kyrgystani Som - KGS',
  'Laotian Kip - LAK',
  'Latvian Lats - LVL',
  'Lebanese Pound - LBP',
  'Lesotho Loti - LSL',
  'Liberian Dollar - LRD',
  'Libyan Dinar - LYD',
  'Lithuanian Litas - LTL',
  'Macanese Pataca - MOP',
  'Macedonian Denar - MKD',
  'Malagasy Ariary - MGA',
  'Malawian Kwacha - MWK',
  'Malaysian Ringgit - MYR',
  'Maldivian Rufiyaa - MVR',
  'Mauritanian Ouguiya - MRO',
  'Mauritian Rupee - MUR',
  'Mexican Peso - MXN',
  'Moldovan Leu - MDL',
  'Mongolian Tugrik - MNT',
  'Moroccan Dirham - MAD',
  'Mozambican Metical - MZN',
  'Myanmar Kyat - MMK',
  'Namibian Dollar - NAD',
  'Nepalese Rupee - NPR',
  'Netherlands Antillean Guilder - ANG',
  'New Taiwan Dollar - TWD',
  'New Zealand Dollar - NZD',
  'Nicaraguan Córdoba - NIO',
  'Nigerian Naira - NGN',
  'North Korean Won - KPW',
  'Norwegian Krone - NOK',
  'Omani Rial - OMR',
  'Pakistani Rupee - PKR',
  'Panamanian Balboa - PAB',
  'Papua New Guinean Kina - PGK',
  'Paraguayan Guarani - PYG',
  'Peruvian Sol - PEN',
  'Philippine Peso - PHP',
  'Polish Złoty - PLN',
  'Qatari Riyal - QAR',
  'Romanian Leu - RON',
  'Russian Ruble - RUB',
  'Rwandan Franc - RWF',
  'Saint Helena Pound - SHP',
  'Samoan Tālā - WST',
  'São Tomé and Príncipe Dobra - STD',
  'Saudi Riyal - SAR',
  'Serbian Dinar - RSD',
  'Seychellois Rupee - SCR',
  'Sierra Leonean Leone - SLL',
  'Singapore Dollar - SGD',
  'Slovak Koruna - SKK',
  'Solomon Islands Dollar - SBD',
  'Somali Shilling - SOS',
  'South African Rand - ZAR',
  'South Korean Won - KRW',
  'Sri Lankan Rupee - LKR',
  'Sudanese Pound - SDG',
  'Surinamese Dollar - SRD',
  'Swazi Lilangeni - SZL',
  'Swedish Krona - SEK',
  'Swiss Franc - CHF',
  'Syrian Pound - SYP',
  'Tajikistani Somoni - TJS',
  'Tanzanian Shilling - TZS',
  'Thai Baht - THB',
  'Tongan Paʻanga - TOP',
  'Trinidad and Tobago Dollar - TTD',
  'Tunisian Dinar - TND',
  'Turkish Lira - TRY',
  'Turkmenistani Manat - TMT',
  'Ugandan Shilling - UGX',
  'Ukrainian Hryvnia - UAH',
  'UAE Dirham - AED',
  'US Dollar - USD',
  'Uruguayan Peso - UYU',
  'Uzbekistani Som - UZS',
  'Vanuatu Vatu - VUV',
  'Venezuelan Bolívar - VEF',
  'Vietnamese Dong - VND',
  'Yemeni Rial - YER',
  'Zambian Kwacha - ZMK',
  'Zimbabwean Dollar - ZWL',
].sort(); // Sort alphabetically

const languages = [
  { code: 'bg', name: 'български', flag: '🇧🇬' },
  { code: 'cs', name: 'čeština', flag: '🇨🇿' },
  { code: 'da', name: 'dansk', flag: '🇩🇰' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'español', flag: '🇪🇸' },
  { code: 'fi', name: 'suomi', flag: '🇫🇮' },
  { code: 'fr', name: 'français', flag: '🇫🇷' },
  { code: 'hr', name: 'hrvatski', flag: '🇭🇷' },
  { code: 'hu', name: 'magyar', flag: '🇭🇺' },
  { code: 'it', name: 'italiano', flag: '🇮🇹' },
  { code: 'nb', name: 'norsk bokmål', flag: '🇳🇴' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'polski', flag: '🇵🇱' },
  { code: 'pt', name: 'português (Brasil)', flag: '🇧🇷' },
  { code: 'ro', name: 'română', flag: '🇷🇴' },
  { code: 'sv', name: 'svenska', flag: '🇸🇪' },
  { code: 'ru', name: 'русский', flag: '🇷🇺' },
  { code: 'uk', name: 'українська', flag: '🇺🇦' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'sl', name: 'slovenščina', flag: '🇸🇮' },
  { code: 'lt', name: 'lietuvių', flag: '🇱🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

const detectLocationFromTimezone = (): LocationData => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const timezoneCountryMap: { [key: string]: string } = {
    'Asia/Jakarta': 'ID',
    'America/New_York': 'US',
    'America/Los_Angeles': 'US',
    'America/Chicago': 'US',
    'Europe/London': 'GB',
    'Australia/Sydney': 'AU',
    'Europe/Berlin': 'DE',
    'Europe/Paris': 'FR',
    'Europe/Rome': 'IT',
    'Europe/Madrid': 'ES',
    'Europe/Amsterdam': 'NL',
    'Asia/Tokyo': 'JP',
    'Asia/Seoul': 'KR',
    'Asia/Shanghai': 'CN',
    'Asia/Kolkata': 'IN',
    'Asia/Singapore': 'SG',
    'Asia/Kuala_Lumpur': 'MY',
    'Asia/Bangkok': 'TH',
    'Asia/Ho_Chi_Minh': 'VN',
    'Asia/Manila': 'PH',
    'America/Sao_Paulo': 'BR',
    'America/Mexico_City': 'MX',
    'America/Toronto': 'CA',
  };

  const detectedCountryCode = timezoneCountryMap[timezone] || '';
  const country = countries.find(c => c.code === detectedCountryCode);
  
  if (country) {
    return {
      country: country.name,
      countryCode: country.code,
      phonePrefix: country.phone,
      timezone: country.timezone,
      currency: country.currency,
      language: country.language
    };
  }

  return {
    country: '',
    countryCode: '',
    phonePrefix: '',
    timezone: '',
    currency: '',
    language: 'English'
  };
};

export const LocationSettings: React.FC<LocationSettingsProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState(value);

  useEffect(() => {
    if (!value.country) {
      const detected = detectLocationFromTimezone();
      onChange(detected);
    }
  }, []);

  const handleSave = () => {
    onChange(tempSettings);
    setIsOpen(false);
  };

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      setTempSettings(prev => ({
        ...prev,
        country: country.name,
        countryCode: country.code,
        phonePrefix: country.phone,
        timezone: country.timezone,
        currency: country.currency,
        language: country.language,
      }));
    }
  };

  // Sort timezones by GMT offset
  const sortedTimezones = allTimezones.sort((a, b) => a.gmtOffset - b.gmtOffset);

  return (
    <div className="flex items-center justify-between p-3 border rounded-md">
      <span>{value.country || 'Select country'}</span>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="link" className="text-primary p-0 h-auto">
            Edit
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Location Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="country" className="text-sm font-medium">Country</Label>
              <Select value={tempSettings.countryCode} onValueChange={handleCountryChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timezone" className="text-sm font-medium">Time zone</Label>
              <Select value={tempSettings.timezone} onValueChange={(value) => setTempSettings(prev => ({ ...prev, timezone: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {sortedTimezones.map((timezone) => (
                    <SelectItem key={timezone.name} value={timezone.name}>
                      {timezone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
              <Select value={tempSettings.currency} onValueChange={(value) => setTempSettings(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {worldCurrencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="language" className="text-sm font-medium">Language</Label>
              <Select value={tempSettings.language} onValueChange={(value) => setTempSettings(prev => ({ ...prev, language: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.name}>
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { detectLocationFromTimezone };
