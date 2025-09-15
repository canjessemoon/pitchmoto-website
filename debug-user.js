const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual values
const SUPABASE_URL = 'https://mksktpujwwrvndinencl.supabase.co';
const SUPABASE_SECRET_KEY = 'sb_secret_RtkpszPB5waXAzM5NtFPew_A9nffWW1';

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

async function checkUser() {
  const email = 'Jdmoon+testfounder1@gmail.com';
  
  console.log('Checking user profile for:', email);
  
  try {
    // Check auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.error('Auth error:', authError);
      return;
    }
    
    const authUser = authUsers.users.find(u => u.email === email);
    if (authUser) {
      console.log('Auth User found:', {
        id: authUser.id,
        email: authUser.email,
        confirmed_at: authUser.confirmed_at,
        user_metadata: authUser.user_metadata
      });
      
      // Check user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();
        
      if (profileError) {
        console.error('Profile error:', profileError);
        console.log('No profile found - need to create one');
        
        // Create profile
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || null,
            user_type: 'founder' // Set as founder since they signed up as founder
          })
          .select()
          .single();
          
        if (createError) {
          console.error('Failed to create profile:', createError);
        } else {
          console.log('Created profile:', newProfile);
        }
      } else {
        console.log('Profile found:', profile);
        
        // Update user_type if it's wrong
        if (profile.user_type !== 'founder') {
          console.log('Fixing user_type from', profile.user_type, 'to founder');
          const { data: updated, error: updateError } = await supabase
            .from('user_profiles')
            .update({ user_type: 'founder' })
            .eq('user_id', authUser.id)
            .select()
            .single();
            
          if (updateError) {
            console.error('Failed to update profile:', updateError);
          } else {
            console.log('Updated profile:', updated);
          }
        }
      }
    } else {
      console.log('Auth user not found');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUser();