import { supabase } from '@/integrations/supabase/client';

export const createAdminUser = async () => {
  try {
    // Create admin user through Supabase auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'junichiroalexandra27@gmail.com',
      password: 'iwakiwak',
      user_metadata: { name: 'Junichiro Alexandra' },
      email_confirm: true
    });

    if (error) {
      console.error('Error creating admin user:', error);
      return { error };
    }

    // Update the profile to make them admin
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'admin', name: 'Junichiro Alexandra' })
        .eq('id', data.user.id);

      if (profileError) {
        console.error('Error updating profile to admin:', profileError);
        return { error: profileError };
      }
    }

    console.log('Admin user created successfully');
    return { error: null };
  } catch (error) {
    console.error('Exception creating admin user:', error);
    return { error };
  }
};