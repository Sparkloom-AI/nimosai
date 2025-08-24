import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { LocationSettings, detectLocationFromTimezone } from '@/components/auth/LocationSettings';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const professionalAccountSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  mobileNumber: z.string().min(1, 'Mobile number is required'),
  country: z.string().min(1, 'Country is required'),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

type EmailFormData = z.infer<typeof emailSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;
type ProfessionalAccountFormData = z.infer<typeof professionalAccountSchema>;

interface LocationData {
  country: string;
  countryCode: string;
  phonePrefix: string;
  timezone: string;
  currency: string;
  language: string;
}

// Comprehensive list of all world countries with phone prefixes, starting with the specific ones from the image
const phoneCountries = [
  { name: 'United States', code: 'US', phone: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', phone: '+44', flag: '🇬🇧' },
  { name: 'Canada', code: 'CA', phone: '+1', flag: '🇨🇦' },
  { name: 'Germany', code: 'DE', phone: '+49', flag: '🇩🇪' },
  { name: 'France', code: 'FR', phone: '+33', flag: '🇫🇷' },
  { name: 'Australia', code: 'AU', phone: '+61', flag: '🇦🇺' },
  { name: 'Afghanistan', code: 'AF', phone: '+93', flag: '🇦🇫' },
  { name: 'Åland Islands', code: 'AX', phone: '+358', flag: '🇦🇽' },
  { name: 'Albania', code: 'AL', phone: '+355', flag: '🇦🇱' },
  { name: 'Algeria', code: 'DZ', phone: '+213', flag: '🇩🇿' },
  { name: 'American Samoa', code: 'AS', phone: '+1 684', flag: '🇦🇸' },
  { name: 'Andorra', code: 'AD', phone: '+376', flag: '🇦🇩' },
  { name: 'Angola', code: 'AO', phone: '+244', flag: '🇦🇴' },
  { name: 'Anguilla', code: 'AI', phone: '+1 264', flag: '🇦🇮' },
  { name: 'Antarctica', code: 'AQ', phone: '+672', flag: '🇦🇶' },
  { name: 'Antigua And Barbuda', code: 'AG', phone: '+1 268', flag: '🇦🇬' },
  { name: 'Argentina', code: 'AR', phone: '+54', flag: '🇦🇷' },
  { name: 'Armenia', code: 'AM', phone: '+374', flag: '🇦🇲' },
  { name: 'Aruba', code: 'AW', phone: '+297', flag: '🇦🇼' },
  { name: 'Austria', code: 'AT', phone: '+43', flag: '🇦🇹' },
  { name: 'Azerbaijan', code: 'AZ', phone: '+994', flag: '🇦🇿' },
  { name: 'Bahamas', code: 'BS', phone: '+1 242', flag: '🇧🇸' },
  { name: 'Bahrain', code: 'BH', phone: '+973', flag: '🇧🇭' },
  { name: 'Bangladesh', code: 'BD', phone: '+880', flag: '🇧🇩' },
  { name: 'Barbados', code: 'BB', phone: '+1 246', flag: '🇧🇧' },
  { name: 'Belarus', code: 'BY', phone: '+375', flag: '🇧🇾' },
  { name: 'Belgium', code: 'BE', phone: '+32', flag: '🇧🇪' },
  { name: 'Belize', code: 'BZ', phone: '+501', flag: '🇧🇿' },
  { name: 'Benin', code: 'BJ', phone: '+229', flag: '🇧🇯' },
  { name: 'Bermuda', code: 'BM', phone: '+1 441', flag: '🇧🇲' },
  { name: 'Bhutan', code: 'BT', phone: '+975', flag: '🇧🇹' },
  { name: 'Bolivia', code: 'BO', phone: '+591', flag: '🇧🇴' },
  { name: 'Bosnia And Herzegovina', code: 'BA', phone: '+387', flag: '🇧🇦' },
  { name: 'Botswana', code: 'BW', phone: '+267', flag: '🇧🇼' },
  { name: 'Brazil', code: 'BR', phone: '+55', flag: '🇧🇷' },
  { name: 'British Indian Ocean Territory', code: 'IO', phone: '+246', flag: '🇮🇴' },
  { name: 'Brunei Darussalam', code: 'BN', phone: '+673', flag: '🇧🇳' },
  { name: 'Bulgaria', code: 'BG', phone: '+359', flag: '🇧🇬' },
  { name: 'Burkina Faso', code: 'BF', phone: '+226', flag: '🇧🇫' },
  { name: 'Burundi', code: 'BI', phone: '+257', flag: '🇧🇮' },
  { name: 'Cambodia', code: 'KH', phone: '+855', flag: '🇰🇭' },
  { name: 'Cameroon', code: 'CM', phone: '+237', flag: '🇨🇲' },
  { name: 'Cape Verde', code: 'CV', phone: '+238', flag: '🇨🇻' },
  { name: 'Cayman Islands', code: 'KY', phone: '+1 345', flag: '🇰🇾' },
  { name: 'Central African Republic', code: 'CF', phone: '+236', flag: '🇨🇫' },
  { name: 'Chad', code: 'TD', phone: '+235', flag: '🇹🇩' },
  { name: 'Chile', code: 'CL', phone: '+56', flag: '🇨🇱' },
  { name: 'China', code: 'CN', phone: '+86', flag: '🇨🇳' },
  { name: 'Christmas Island', code: 'CX', phone: '+61', flag: '🇨🇽' },
  { name: 'Cocos (Keeling) Islands', code: 'CC', phone: '+61', flag: '🇨🇨' },
  { name: 'Colombia', code: 'CO', phone: '+57', flag: '🇨🇴' },
  { name: 'Comoros', code: 'KM', phone: '+269', flag: '🇰🇲' },
  { name: 'Congo', code: 'CG', phone: '+242', flag: '🇨🇬' },
  { name: 'Congo, Democratic Republic', code: 'CD', phone: '+243', flag: '🇨🇩' },
  { name: 'Cook Islands', code: 'CK', phone: '+682', flag: '🇨🇰' },
  { name: 'Costa Rica', code: 'CR', phone: '+506', flag: '🇨🇷' },
  { name: 'Cote D\'Ivoire', code: 'CI', phone: '+225', flag: '🇨🇮' },
  { name: 'Croatia', code: 'HR', phone: '+385', flag: '🇭🇷' },
  { name: 'Cuba', code: 'CU', phone: '+53', flag: '🇨🇺' },
  { name: 'Cyprus', code: 'CY', phone: '+357', flag: '🇨🇾' },
  { name: 'Czech Republic', code: 'CZ', phone: '+420', flag: '🇨🇿' },
  { name: 'Denmark', code: 'DK', phone: '+45', flag: '🇩🇰' },
  { name: 'Djibouti', code: 'DJ', phone: '+253', flag: '🇩🇯' },
  { name: 'Dominica', code: 'DM', phone: '+1 767', flag: '🇩🇲' },
  { name: 'Dominican Republic', code: 'DO', phone: '+1 809', flag: '🇩🇴' },
  { name: 'Ecuador', code: 'EC', phone: '+593', flag: '🇪🇨' },
  { name: 'Egypt', code: 'EG', phone: '+20', flag: '🇪🇬' },
  { name: 'El Salvador', code: 'SV', phone: '+503', flag: '🇸🇻' },
  { name: 'Equatorial Guinea', code: 'GQ', phone: '+240', flag: '🇬🇶' },
  { name: 'Eritrea', code: 'ER', phone: '+291', flag: '🇪🇷' },
  { name: 'Estonia', code: 'EE', phone: '+372', flag: '🇪🇪' },
  { name: 'Ethiopia', code: 'ET', phone: '+251', flag: '🇪🇹' },
  { name: 'Falkland Islands', code: 'FK', phone: '+500', flag: '🇫🇰' },
  { name: 'Faroe Islands', code: 'FO', phone: '+298', flag: '🇫🇴' },
  { name: 'Fiji', code: 'FJ', phone: '+679', flag: '🇫🇯' },
  { name: 'Finland', code: 'FI', phone: '+358', flag: '🇫🇮' },
  { name: 'France', code: 'FR', phone: '+33', flag: '🇫🇷' },
  { name: 'French Guiana', code: 'GF', phone: '+594', flag: '🇬🇫' },
  { name: 'French Polynesia', code: 'PF', phone: '+689', flag: '🇵🇫' },
  { name: 'Gabon', code: 'GA', phone: '+241', flag: '🇬🇦' },
  { name: 'Gambia', code: 'GM', phone: '+220', flag: '🇬🇲' },
  { name: 'Georgia', code: 'GE', phone: '+995', flag: '🇬🇪' },
  { name: 'Germany', code: 'DE', phone: '+49', flag: '🇩🇪' },
  { name: 'Ghana', code: 'GH', phone: '+233', flag: '🇬🇭' },
  { name: 'Gibraltar', code: 'GI', phone: '+350', flag: '🇬🇮' },
  { name: 'Greece', code: 'GR', phone: '+30', flag: '🇬🇷' },
  { name: 'Greenland', code: 'GL', phone: '+299', flag: '🇬🇱' },
  { name: 'Grenada', code: 'GD', phone: '+1 473', flag: '🇬🇩' },
  { name: 'Guadeloupe', code: 'GP', phone: '+590', flag: '🇬🇵' },
  { name: 'Guam', code: 'GU', phone: '+1 671', flag: '🇬🇺' },
  { name: 'Guatemala', code: 'GT', phone: '+502', flag: '🇬🇹' },
  { name: 'Guernsey', code: 'GG', phone: '+44', flag: '🇬🇬' },
  { name: 'Guinea', code: 'GN', phone: '+224', flag: '🇬🇳' },
  { name: 'Guinea-Bissau', code: 'GW', phone: '+245', flag: '🇬🇼' },
  { name: 'Guyana', code: 'GY', phone: '+592', flag: '🇬🇾' },
  { name: 'Haiti', code: 'HT', phone: '+509', flag: '🇭🇹' },
  { name: 'Honduras', code: 'HN', phone: '+504', flag: '🇭🇳' },
  { name: 'Hong Kong', code: 'HK', phone: '+852', flag: '🇭🇰' },
  { name: 'Hungary', code: 'HU', phone: '+36', flag: '🇭🇺' },
  { name: 'Iceland', code: 'IS', phone: '+354', flag: '🇮🇸' },
  { name: 'India', code: 'IN', phone: '+91', flag: '🇮🇳' },
  { name: 'Indonesia', code: 'ID', phone: '+62', flag: '🇮🇩' },
  { name: 'Iran', code: 'IR', phone: '+98', flag: '🇮🇷' },
  { name: 'Iraq', code: 'IQ', phone: '+964', flag: '🇮🇶' },
  { name: 'Ireland', code: 'IE', phone: '+353', flag: '🇮🇪' },
  { name: 'Isle Of Man', code: 'IM', phone: '+44', flag: '🇮🇲' },
  { name: 'Israel', code: 'IL', phone: '+972', flag: '🇮🇱' },
  { name: 'Italy', code: 'IT', phone: '+39', flag: '🇮🇹' },
  { name: 'Jamaica', code: 'JM', phone: '+1 876', flag: '🇯🇲' },
  { name: 'Japan', code: 'JP', phone: '+81', flag: '🇯🇵' },
  { name: 'Jersey', code: 'JE', phone: '+44', flag: '🇯🇪' },
  { name: 'Jordan', code: 'JO', phone: '+962', flag: '🇯🇴' },
  { name: 'Kazakhstan', code: 'KZ', phone: '+7', flag: '🇰🇿' },
  { name: 'Kenya', code: 'KE', phone: '+254', flag: '🇰🇪' },
  { name: 'Kiribati', code: 'KI', phone: '+686', flag: '🇰🇮' },
  { name: 'Korea, Democratic People\'s Republic Of', code: 'KP', phone: '+850', flag: '🇰🇵' },
  { name: 'Korea, Republic Of', code: 'KR', phone: '+82', flag: '🇰🇷' },
  { name: 'Kosovo', code: 'XK', phone: '+383', flag: '🇽🇰' },
  { name: 'Kuwait', code: 'KW', phone: '+965', flag: '🇰🇼' },
  { name: 'Kyrgyzstan', code: 'KG', phone: '+996', flag: '🇰🇬' },
  { name: 'Lao People\'s Democratic Republic', code: 'LA', phone: '+856', flag: '🇱🇦' },
  { name: 'Latvia', code: 'LV', phone: '+371', flag: '🇱🇻' },
  { name: 'Lebanon', code: 'LB', phone: '+961', flag: '🇱🇧' },
  { name: 'Lesotho', code: 'LS', phone: '+266', flag: '🇱🇸' },
  { name: 'Liberia', code: 'LR', phone: '+231', flag: '🇱🇷' },
  { name: 'Libya', code: 'LY', phone: '+218', flag: '🇱🇾' },
  { name: 'Liechtenstein', code: 'LI', phone: '+423', flag: '🇱🇮' },
  { name: 'Lithuania', code: 'LT', phone: '+370', flag: '🇱🇹' },
  { name: 'Luxembourg', code: 'LU', phone: '+352', flag: '🇱🇺' },
  { name: 'Macao', code: 'MO', phone: '+853', flag: '🇲🇴' },
  { name: 'Macedonia', code: 'MK', phone: '+389', flag: '🇲🇰' },
  { name: 'Madagascar', code: 'MG', phone: '+261', flag: '🇲🇬' },
  { name: 'Malawi', code: 'MW', phone: '+265', flag: '🇲🇼' },
  { name: 'Malaysia', code: 'MY', phone: '+60', flag: '🇲🇾' },
  { name: 'Maldives', code: 'MV', phone: '+960', flag: '🇲🇻' },
  { name: 'Mali', code: 'ML', phone: '+223', flag: '🇲🇱' },
  { name: 'Malta', code: 'MT', phone: '+356', flag: '🇲🇹' },
  { name: 'Marshall Islands', code: 'MH', phone: '+692', flag: '🇲🇭' },
  { name: 'Martinique', code: 'MQ', phone: '+596', flag: '🇲🇶' },
  { name: 'Mauritania', code: 'MR', phone: '+222', flag: '🇲🇷' },
  { name: 'Mauritius', code: 'MU', phone: '+230', flag: '🇲🇺' },
  { name: 'Mayotte', code: 'YT', phone: '+262', flag: '🇾🇹' },
  { name: 'Mexico', code: 'MX', phone: '+52', flag: '🇲🇽' },
  { name: 'Micronesia', code: 'FM', phone: '+691', flag: '🇫🇲' },
  { name: 'Moldova', code: 'MD', phone: '+373', flag: '🇲🇩' },
  { name: 'Monaco', code: 'MC', phone: '+377', flag: '🇲🇨' },
  { name: 'Mongolia', code: 'MN', phone: '+976', flag: '🇲🇳' },
  { name: 'Montenegro', code: 'ME', phone: '+382', flag: '🇲🇪' },
  { name: 'Montserrat', code: 'MS', phone: '+1 664', flag: '🇲🇸' },
  { name: 'Morocco', code: 'MA', phone: '+212', flag: '🇲🇦' },
  { name: 'Mozambique', code: 'MZ', phone: '+258', flag: '🇲🇿' },
  { name: 'Myanmar', code: 'MM', phone: '+95', flag: '🇲🇲' },
  { name: 'Namibia', code: 'NA', phone: '+264', flag: '🇳🇦' },
  { name: 'Nauru', code: 'NR', phone: '+686', flag: '🇳🇷' },
  { name: 'Nepal', code: 'NP', phone: '+977', flag: '🇳🇵' },
  { name: 'Netherlands', code: 'NL', phone: '+31', flag: '🇳🇱' },
  { name: 'Netherlands Antilles', code: 'AN', phone: '+599', flag: '🇦🇳' },
  { name: 'New Caledonia', code: 'NC', phone: '+687', flag: '🇳🇨' },
  { name: 'New Zealand', code: 'NZ', phone: '+64', flag: '🇳🇿' },
  { name: 'Nicaragua', code: 'NI', phone: '+505', flag: '🇳🇮' },
  { name: 'Niger', code: 'NE', phone: '+227', flag: '🇳🇪' },
  { name: 'Nigeria', code: 'NG', phone: '+234', flag: '🇳🇬' },
  { name: 'Niue', code: 'NU', phone: '+683', flag: '🇳🇺' },
  { name: 'Norfolk Island', code: 'NF', phone: '+672', flag: '🇳🇫' },
  { name: 'Northern Mariana Islands', code: 'MP', phone: '+1 670', flag: '🇲🇵' },
  { name: 'Norway', code: 'NO', phone: '+47', flag: '🇳🇴' },
  { name: 'Oman', code: 'OM', phone: '+968', flag: '🇴🇲' },
  { name: 'Pakistan', code: 'PK', phone: '+92', flag: '🇵🇰' },
  { name: 'Palau', code: 'PW', phone: '+680', flag: '🇵🇼' },
  { name: 'Palestinian Territory', code: 'PS', phone: '+970', flag: '🇵🇸' },
  { name: 'Panama', code: 'PA', phone: '+507', flag: '🇵🇦' },
  { name: 'Papua New Guinea', code: 'PG', phone: '+675', flag: '🇵🇬' },
  { name: 'Paraguay', code: 'PY', phone: '+595', flag: '🇵🇾' },
  { name: 'Peru', code: 'PE', phone: '+51', flag: '🇵🇪' },
  { name: 'Philippines', code: 'PH', phone: '+63', flag: '🇵🇭' },
  { name: 'Pitcairn', code: 'PN', phone: '+64', flag: '🇵🇳' },
  { name: 'Poland', code: 'PL', phone: '+48', flag: '🇵🇱' },
  { name: 'Portugal', code: 'PT', phone: '+351', flag: '🇵🇹' },
  { name: 'Puerto Rico', code: 'PR', phone: '+1 787', flag: '🇵🇷' },
  { name: 'Qatar', code: 'QA', phone: '+974', flag: '🇶🇦' },
  { name: 'Reunion', code: 'RE', phone: '+262', flag: '🇷🇪' },
  { name: 'Romania', code: 'RO', phone: '+40', flag: '🇷🇴' },
  { name: 'Russian Federation', code: 'RU', phone: '+7', flag: '🇷🇺' },
  { name: 'Rwanda', code: 'RW', phone: '+250', flag: '🇷🇼' },
  { name: 'Saint Barthelemy', code: 'BL', phone: '+590', flag: '🇧🇱' },
  { name: 'Saint Helena', code: 'SH', phone: '+290', flag: '🇸🇭' },
  { name: 'Saint Kitts And Nevis', code: 'KN', phone: '+1 869', flag: '🇰🇳' },
  { name: 'Saint Lucia', code: 'LC', phone: '+1 758', flag: '🇱🇨' },
  { name: 'Saint Martin', code: 'MF', phone: '+590', flag: '🇲🇫' },
  { name: 'Saint Pierre And Miquelon', code: 'PM', phone: '+508', flag: '🇵🇲' },
  { name: 'Saint Vincent And Grenadines', code: 'VC', phone: '+1 784', flag: '🇻🇨' },
  { name: 'Samoa', code: 'WS', phone: '+685', flag: '🇼🇸' },
  { name: 'San Marino', code: 'SM', phone: '+378', flag: '🇸🇲' },
  { name: 'Sao Tome And Principe', code: 'ST', phone: '+239', flag: '🇸🇹' },
  { name: 'Saudi Arabia', code: 'SA', phone: '+966', flag: '🇸🇦' },
  { name: 'Senegal', code: 'SN', phone: '+221', flag: '🇸🇳' },
  { name: 'Serbia', code: 'RS', phone: '+381', flag: '🇷🇸' },
  { name: 'Seychelles', code: 'SC', phone: '+248', flag: '🇸🇨' },
  { name: 'Sierra Leone', code: 'SL', phone: '+232', flag: '🇸🇱' },
  { name: 'Singapore', code: 'SG', phone: '+65', flag: '🇸🇬' },
  { name: 'Slovakia', code: 'SK', phone: '+421', flag: '🇸🇰' },
  { name: 'Slovenia', code: 'SI', phone: '+386', flag: '🇸🇮' },
  { name: 'Solomon Islands', code: 'SB', phone: '+677', flag: '🇸🇧' },
  { name: 'Somalia', code: 'SO', phone: '+252', flag: '🇸🇴' },
  { name: 'South Africa', code: 'ZA', phone: '+27', flag: '🇿🇦' },
  { name: 'South Georgia And Sandwich Isl.', code: 'GS', phone: '+500', flag: '🇬🇸' },
  { name: 'Spain', code: 'ES', phone: '+34', flag: '🇪🇸' },
  { name: 'Sri Lanka', code: 'LK', phone: '+94', flag: '🇱🇰' },
  { name: 'Sudan', code: 'SD', phone: '+249', flag: '🇸🇩' },
  { name: 'Suriname', code: 'SR', phone: '+597', flag: '🇸🇷' },
  { name: 'Svalbard And Jan Mayen', code: 'SJ', phone: '+47', flag: '🇸🇯' },
  { name: 'Swaziland', code: 'SZ', phone: '+268', flag: '🇸🇿' },
  { name: 'Sweden', code: 'SE', phone: '+46', flag: '🇸🇪' },
  { name: 'Switzerland', code: 'CH', phone: '+41', flag: '🇨🇭' },
  { name: 'Syrian Arab Republic', code: 'SY', phone: '+963', flag: '🇸🇾' },
  { name: 'Taiwan', code: 'TW', phone: '+886', flag: '🇹🇼' },
  { name: 'Tajikistan', code: 'TJ', phone: '+992', flag: '🇹🇯' },
  { name: 'Tanzania', code: 'TZ', phone: '+255', flag: '🇹🇿' },
  { name: 'Thailand', code: 'TH', phone: '+66', flag: '🇹🇭' },
  { name: 'Timor-Leste', code: 'TL', phone: '+670', flag: '🇹🇱' },
  { name: 'Togo', code: 'TG', phone: '+228', flag: '🇹🇬' },
  { name: 'Tokelau', code: 'TK', phone: '+690', flag: '🇹🇰' },
  { name: 'Tonga', code: 'TO', phone: '+676', flag: '🇹🇴' },
  { name: 'Trinidad And Tobago', code: 'TT', phone: '+1 868', flag: '🇹🇹' },
  { name: 'Tunisia', code: 'TN', phone: '+216', flag: '🇹🇳' },
  { name: 'Turkey', code: 'TR', phone: '+90', flag: '🇹🇷' },
  { name: 'Turkmenistan', code: 'TM', phone: '+993', flag: '🇹🇲' },
  { name: 'Turks And Caicos Islands', code: 'TC', phone: '+1 649', flag: '🇹🇨' },
  { name: 'Tuvalu', code: 'TV', phone: '+688', flag: '🇹🇻' },
  { name: 'Uganda', code: 'UG', phone: '+256', flag: '🇺🇬' },
  { name: 'Ukraine', code: 'UA', phone: '+380', flag: '🇺🇦' },
  { name: 'United Arab Emirates', code: 'AE', phone: '+971', flag: '🇦🇪' },
  { name: 'Uruguay', code: 'UY', phone: '+598', flag: '🇺🇾' },
  { name: 'Uzbekistan', code: 'UZ', phone: '+998', flag: '🇺🇿' },
  { name: 'Vanuatu', code: 'VU', phone: '+678', flag: '🇻🇺' },
  { name: 'Venezuela', code: 'VE', phone: '+58', flag: '🇻🇪' },
  { name: 'Viet Nam', code: 'VN', phone: '+84', flag: '🇻🇳' },
  { name: 'Virgin Islands, British', code: 'VG', phone: '+1 284', flag: '🇻🇬' },
  { name: 'Virgin Islands, U.S.', code: 'VI', phone: '+1 340', flag: '🇻🇮' },
  { name: 'Wallis And Futuna', code: 'WF', phone: '+681', flag: '🇼🇫' },
  { name: 'Western Sahara', code: 'EH', phone: '+212', flag: '🇪🇭' },
  { name: 'Yemen', code: 'YE', phone: '+967', flag: '🇾🇪' },
  { name: 'Zambia', code: 'ZM', phone: '+260', flag: '🇿🇲' },
  { name: 'Zimbabwe', code: 'ZW', phone: '+263', flag: '🇿🇼' },
];

const Auth = () => {
  const [step, setStep] = useState<'email' | 'password' | 'professional' | 'signup'>('email');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPhonePrefix, setSelectedPhonePrefix] = useState('');
  const [locationData, setLocationData] = useState<LocationData>({
    country: '',
    countryCode: '',
    phonePrefix: '',
    timezone: '',
    currency: '',
    language: 'English'
  });
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '' },
  });

  const professionalForm = useForm<ProfessionalAccountFormData>({
    resolver: zodResolver(professionalAccountSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      password: '',
      mobileNumber: '',
      country: '',
      agreeToTerms: false,
    },
  });

  // Auto-detect location on component mount
  useEffect(() => {
    const detected = detectLocationFromTimezone();
    setLocationData(detected);
    setSelectedPhonePrefix(detected.phonePrefix);
    professionalForm.setValue('country', detected.country);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const onEmailSubmit = async (data: EmailFormData) => {
    setEmail(data.email);
    setStep('professional');
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(email, data.password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password');
        } else {
          toast.error(error.message || 'Failed to sign in');
        }
      } else {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const onProfessionalAccountSubmit = async (data: ProfessionalAccountFormData) => {
    setIsLoading(true);
    try {
      const fullName = `${data.firstName} ${data.lastName}`;
      const { error } = await signUp(email, data.password, fullName);
      
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('An account with this email already exists. Please sign in instead.');
          setStep('password');
        } else {
          toast.error(error.message || 'Failed to create account');
        }
      } else {
        toast.success('Account created! Please check your email to verify your account.');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        toast.error(error.message || 'Failed to sign in with Google');
        setIsLoading(false);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (step === 'professional') {
      setStep('email');
      emailForm.setValue('email', email);
    } else if (step === 'password') {
      setStep('email');
      emailForm.setValue('email', email);
    } else {
      navigate('/');
    }
  };

  const handleLocationDataChange = (newLocationData: LocationData) => {
    setLocationData(newLocationData);
    setSelectedPhonePrefix(newLocationData.phonePrefix);
    professionalForm.setValue('country', newLocationData.country);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="mb-6 p-0 h-auto text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            {step !== 'professional' && (
              <>
                <h1 className="text-3xl font-bold mb-2">Nimos for professionals</h1>
                <p className="text-muted-foreground">
                  Create an account or log in to manage your business.
                </p>
              </>
            )}
          </div>

          {/* Email Step */}
          {step === 'email' && (
            <div className="space-y-6">
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Enter your email address"
                            type="email"
                            className="h-12 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base bg-foreground text-background hover:bg-foreground/90"
                    disabled={isLoading}
                  >
                    Continue
                  </Button>
                </form>
              </Form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">OR</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full h-12 text-base justify-start"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground mt-8">
                Are you a customer looking to book an appointment?{' '}
                <Button variant="link" className="p-0 h-auto text-primary">
                  Go to Nimos for customers
                </Button>
              </div>
            </div>
          )}

          {/* Professional Account Creation Step */}
          {step === 'professional' && (
            <div className="space-y-6">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold mb-2">Create a professional account</h1>
                <p className="text-muted-foreground text-sm">
                  You're almost there! Create your new account for{' '}
                  <span className="font-medium">{email}</span> by completing these details.
                </p>
              </div>

              <Form {...professionalForm}>
                <form onSubmit={professionalForm.handleSubmit(onProfessionalAccountSubmit)} className="space-y-5">
                  <FormField
                    control={professionalForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">First name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your first name"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={professionalForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Last name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your last name"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={professionalForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter a password"
                              className="h-11 pr-10"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={professionalForm.control}
                    name="mobileNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Mobile number</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <Select value={selectedPhonePrefix} onValueChange={setSelectedPhonePrefix}>
                              <SelectTrigger className="w-40 h-11 rounded-r-none border-r-0">
                                <SelectValue placeholder="Code">
                                  {selectedPhonePrefix || "Code"}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent className="max-h-60 overflow-y-auto">
                                {phoneCountries.map((country) => (
                                  <SelectItem key={`${country.code}-${country.phone}`} value={country.phone}>
                                    {country.flag} {country.name} {country.phone}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="Enter your mobile number"
                              className="h-11 rounded-l-none flex-1"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={professionalForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Country</FormLabel>
                        <FormControl>
                          <LocationSettings
                            value={locationData}
                            onChange={handleLocationDataChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={professionalForm.control}
                    name="agreeToTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-1"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            I agree to the{' '}
                            <Button variant="link" className="p-0 h-auto text-primary">
                              Privacy Policy
                            </Button>
                            ,{' '}
                            <Button variant="link" className="p-0 h-auto text-primary">
                              Terms of Service
                            </Button>
                            {' '}and{' '}
                            <Button variant="link" className="p-0 h-auto text-primary">
                              Terms of Business
                            </Button>
                            .
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base bg-foreground text-background hover:bg-foreground/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create account'}
                  </Button>
                </form>
              </Form>

              <div className="text-center text-xs text-muted-foreground">
                This site is protected by reCAPTCHA.<br />
                Google Privacy Policy and Terms of Service apply
              </div>
            </div>
          )}

          {/* Password Step */}
          {step === 'password' && (
            <div className="space-y-6">
              <div className="text-sm text-muted-foreground mb-4">
                <Mail className="w-4 h-4 inline mr-2" />
                {email}
              </div>
              
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Enter your password"
                            type="password"
                            className="h-12 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base bg-foreground text-background hover:bg-foreground/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Continue'}
                  </Button>
                </form>
              </Form>

              <div className="text-center">
                <Button 
                  variant="link" 
                  className="text-primary"
                  onClick={() => setStep('password')}
                >
                  Already have an account? Sign in
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Image/Background */}
      <div className="hidden lg:block flex-1 bg-muted relative overflow-hidden">
        <img
          src="/lovable-uploads/7499d942-cbd7-4aec-a6ab-9c473cecfe01.png"
          alt="Professional working"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-accent/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        
        {/* Optional: Add some elegant overlay content */}
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome to Nimos</h2>
          <p className="text-white/90 text-lg">Streamline your salon operations with our WhatsApp-first management platform</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
