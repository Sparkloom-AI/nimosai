export interface Package {
  id: string;
  studio_id: string;
  name: string;
  description?: string;
  category: string;
  services: string[]; // Array of service IDs
  price: number;
  discount_type: 'fixed' | 'percentage';
  discount_value: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServicePackage {
  id: string;
  service_id: string;
  quantity: number;
}