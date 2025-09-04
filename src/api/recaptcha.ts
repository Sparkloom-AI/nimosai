import { supabase } from '@/integrations/supabase/client';

interface RecaptchaVerificationResponse {
  success: boolean;
  error?: string;
  details?: string[];
}

export const verifyRecaptcha = async (token: string): Promise<RecaptchaVerificationResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-recaptcha', {
      body: { token }
    });

    if (error) {
      console.error('Error verifying reCAPTCHA:', error);
      return {
        success: false,
        error: 'Failed to verify reCAPTCHA'
      };
    }

    return data;
  } catch (error) {
    console.error('Network error verifying reCAPTCHA:', error);
    return {
      success: false,
      error: 'Network error occurred'
    };
  }
};