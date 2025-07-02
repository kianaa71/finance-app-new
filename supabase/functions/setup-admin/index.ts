
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting admin setup...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Check if admin user already exists
    console.log('🔍 Checking if admin user already exists...');
    const { data: existingUser, error: checkError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (checkError) {
      console.error('❌ Error checking existing users:', checkError);
      throw checkError;
    }

    const adminExists = existingUser.users.some(user => user.email === 'admin@financeapp.com');
    
    if (adminExists) {
      console.log('⚠️ Admin user already exists');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Admin user sudah ada di sistem' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Create admin user
    console.log('📝 Creating admin user in auth.users...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@financeapp.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        name: 'Administrator'
      }
    });

    if (authError) {
      console.error('❌ Error creating user:', authError);
      throw authError;
    }

    console.log('✅ User created successfully:', authData.user.email);

    // Create profile
    console.log('📝 Creating profile in public.profiles...');
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          name: 'Administrator',
          email: 'admin@financeapp.com',
          role: 'admin'
        }
      ])
      .select();

    if (profileError) {
      console.error('❌ Error creating profile:', profileError);
      throw profileError;
    }

    console.log('✅ Profile created successfully:', profileData);

    // Test login to verify everything works
    console.log('🔍 Testing login...');
    const { data: loginData, error: loginError } = await supabaseAdmin.auth.signInWithPassword({
      email: 'admin@financeapp.com',
      password: 'admin123'
    });

    if (loginError) {
      console.error('⚠️ Login test failed:', loginError);
      // Don't throw here, user creation was successful
    } else {
      console.log('✅ Login test successful');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin user berhasil dibuat!',
        data: {
          email: authData.user.email,
          role: 'admin',
          created_at: authData.user.created_at
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Terjadi kesalahan saat membuat admin user',
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
