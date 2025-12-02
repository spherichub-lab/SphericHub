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

        // Verify the user is authenticated
        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            throw new Error('Not authenticated')
        }

        // Get the request body
        const { user_id, full_name, role, company_id, active, password } = await req.json()

        if (!user_id) {
            throw new Error('Missing required field: user_id')
        }

        // Check if user is updating themselves or if they're an admin
        const isUpdatingSelf = user.id === user_id

        if (!isUpdatingSelf) {
            // Check if user is admin
            const { data: profile } = await supabaseClient
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (!profile || profile.role !== 'admin') {
                throw new Error('Not authorized - admin access required to update other users')
            }
        }

        // Try multiple possible secret names for the service role key
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
            || Deno.env.get('SERVICE_ROLE_KEY')
            || Deno.env.get('SUPABASE_SERVICE_KEY')

        if (!serviceRoleKey) {
            throw new Error('Service role key not configured. Please add SUPABASE_SERVICE_ROLE_KEY secret in Edge Functions settings.')
        }

        // Create a Supabase Admin client (SERVICE_ROLE_KEY)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            serviceRoleKey,
        )

        // Update profile fields if provided
        const profileUpdates: any = {}
        if (full_name !== undefined) profileUpdates.full_name = full_name
        if (role !== undefined) profileUpdates.role = role
        if (company_id !== undefined) profileUpdates.company_id = company_id
        if (active !== undefined) profileUpdates.active = active

        let profileData = null
        if (Object.keys(profileUpdates).length > 0) {
            const { data, error: profileError } = await supabaseAdmin
                .from('profiles')
                .update(profileUpdates)
                .eq('id', user_id)
                .select()
                .single()

            if (profileError) {
                throw profileError
            }
            profileData = data
        }

        // Update password if provided - ALWAYS use Admin client
        if (password && password.trim() !== '') {
            const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
                user_id,
                { password: password }
            )

            if (passwordError) {
                throw new Error(`Password update failed: ${passwordError.message}`)
            }
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
