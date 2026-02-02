import { supabase } from '@/lib/supabase';

export interface StudentVueCredentials {
  id?: string;
  user_id: string;
  district_url: string;
  username: string;
  password: string;
  created_at?: string;
  updated_at?: string;
}

// Simple encryption for password (in production, use proper encryption)
const encryptPassword = (password: string): string => {
  return btoa(password); // Basic encoding - replace with proper encryption in production
};

const decryptPassword = (encryptedPassword: string): string => {
  try {
    return atob(encryptedPassword);
  } catch {
    return encryptedPassword;
  }
};

export const saveStudentVueCredentials = async (
  userId: string,
  districtUrl: string,
  username: string,
  password: string
): Promise<boolean> => {
  try {
    const encryptedPassword = encryptPassword(password);
    
    const { error } = await supabase
      .from('studentvue_credentials')
      .upsert({
        user_id: userId,
        district_url: districtUrl,
        username: username,
        password: encryptedPassword,
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error saving StudentVUE credentials:', error);
      return false;
    }

    console.log('✅ StudentVUE credentials saved to Supabase');
    return true;
  } catch (error) {
    console.error('Error saving StudentVUE credentials:', error);
    return false;
  }
};

export const getStudentVueCredentials = async (
  userId: string
): Promise<{
  districtUrl: string;
  username: string;
  password: string;
} | null> => {
  try {
    const { data, error } = await supabase
      .from('studentvue_credentials')
      .select('district_url, username, password')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No credentials found
        console.log('🔍 No StudentVUE credentials found in Supabase');
        return null;
      }
      console.error('Error fetching StudentVUE credentials:', error);
      return null;
    }

    if (!data) {
      console.log('🔍 No StudentVUE credentials found in Supabase');
      return null;
    }

    const decryptedPassword = decryptPassword(data.password);
    
    console.log('✅ StudentVUE credentials retrieved from Supabase');
    return {
      districtUrl: data.district_url,
      username: data.username,
      password: decryptedPassword,
    };
  } catch (error) {
    console.error('Error fetching StudentVUE credentials:', error);
    return null;
  }
};

export const deleteStudentVueCredentials = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('studentvue_credentials')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting StudentVUE credentials:', error);
      return false;
    }

    console.log('✅ StudentVUE credentials deleted from Supabase');
    return true;
  } catch (error) {
    console.error('Error deleting StudentVUE credentials:', error);
    return false;
  }
};
