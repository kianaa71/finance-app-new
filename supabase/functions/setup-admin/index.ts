
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
    
    console.log('🔍 Environment check:', { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!serviceRoleKey 
    });
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Check if admin user already exists
    console.log('🔍 Checking if admin user already exists...');
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError);
      throw new Error(`Failed to check existing users: ${listError.message}`);
    }

    const adminExists = existingUsers.users.some(user => user.email === 'admin@financeapp.com');
    
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
    console.log('📝 Creating admin user...');
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
      throw new Error(`Failed to create user: ${authError.message}`);
    }

    console.log('✅ User created successfully:', authData.user.email);

    // Wait a moment for user creation to fully process
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create profile with explicit role casting
    console.log('📝 Creating profile...');
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
      
      // If profile creation fails, clean up the user
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        console.log('🧹 Cleaned up user after profile creation failure');
      } catch (cleanupError) {
        console.error('❌ Failed to cleanup user:', cleanupError);
      }
      
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    console.log('✅ Profile created successfully:', profileData);

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
