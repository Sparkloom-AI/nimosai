
import { supabase } from '@/integrations/supabase/client';

export const authApi = {
  /**
   * Check if an email exists in the profiles table
   */
  checkEmailExists: async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_email_exists', {
        email_address: email
      });

      if (error) {
        console.error('Error checking email existence:', error);
        throw error;
      }

      return data || false;
    } catch (error) {
      console.error('Failed to check email existence:', error);
      throw error;
    }
  }
};
