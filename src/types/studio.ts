// Studio and business types
export interface Studio {
  id: string;
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  timezone: string;
  country: string;
  currency: string;
  tax_included: boolean;
  default_team_language: string;
  default_client_language: string;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  studio_id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessCategory {
  id: string;
  name: string;
  description?: string;
}