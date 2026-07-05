import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { invitedEmail, token } = await req.json();

    if (!invitedEmail || !token) {
      throw new Error('Missing required fields: invitedEmail or token');
    }

    const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:5173';
    
    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if user already exists
    // (In a large project this would be better served via an RPC call, 
    // but for most projects listUsers will cover the first page of users)
    let isExistingUser = false;
    
    try {
      // First try to invite them
      const inviteUrl = `${APP_URL}/join?token=${token}`;
      const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(invitedEmail, {
        redirectTo: inviteUrl,
        data: { project_invite_token: token }
      });

      if (error) {
        // If the error says they already exist, we gracefully catch it
        if (error.message.toLowerCase().includes('already exists') || error.status === 400 || error.status === 422) {
          isExistingUser = true;
          console.log(`User ${invitedEmail} already exists. Bypassing email invite.`);
        } else {
          throw error;
        }
      } else {
        console.log(`Successfully sent Supabase Auth invite to ${invitedEmail}`);
      }
    } catch (e) {
      console.error('Error calling inviteUserByEmail:', e);
      throw e;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: isExistingUser ? 'Invite added for existing user' : 'Invitation email sent via Supabase',
        isNewUser: !isExistingUser
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    );
  }
});
