import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Get the authorization header
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('No authorization header')
        }

        // Create a Supabase client with the Auth context of the logged in user
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: authHeader },
                },
            }
        )

        // Verify the user is authenticated and is an admin
        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            throw new Error('Not authenticated')
        }

        // Check if user is admin
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || profile.role !== 'admin') {
            throw new Error('Not authorized - admin access required')
        }

        // Get the request body
        const { email, full_name, role, company_id } = await req.json()

        // Validate required fields
        if (!email || !full_name || !role || !company_id) {
            throw new Error('Missing required fields: email, full_name, role, company_id')
        }

        // Create a Supabase Admin client to create the user
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        )

        // Create the auth user with default password
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: '123456',
            email_confirm: true,
        })

        if (authError) {
            throw authError
        }

        if (!authData.user) {
            throw new Error('Failed to create auth user')
        }

        // Create the profile
        const { data: profileData, error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert([
                {
                    id: authData.user.id,
                    email,
                    full_name,
                    role,
                    company_id,
                    active: true,
                },
            ])
            .select()
            .single()

        if (profileError) {
            // If profile creation fails, delete the auth user
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
            throw profileError
        }

        return new Response(
            JSON.stringify({ data: profileData }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            },
        )
    }
})
