// Studio and business types
export interface Studio {
  id: string;
  name: string;
  description?: string;
  business_category: string;
  phone?: string;
  email?: string;
  website?: string;
  timezone: string;
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