// External integration types
export interface WhatsAppMessage {
  from: string;
  to: string;
  text: string;
  timestamp: string;
  message_id: string;
}

export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customer_id?: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  created: number;
}