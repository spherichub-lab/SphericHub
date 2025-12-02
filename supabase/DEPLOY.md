# Deploying Supabase Edge Functions

## Prerequisites
- Supabase CLI installed (`npm install -g supabase`)
- Supabase project created
- Service Role Key from Supabase Dashboard

## Steps to Deploy

### 1. Login to Supabase CLI
```bash
npx supabase login
```

### 2. Link to Your Project
```bash
npx supabase link --project-ref pfvxitfsqpcchdfdojyi
```

### 3. Deploy Edge Functions
```bash
npx supabase functions deploy create-user
npx supabase functions deploy update-user
npx supabase functions deploy delete-user
```

### 4. Set Environment Variables
The Edge Functions need access to the Service Role Key. Set it in your Supabase Dashboard:

1. Go to Project Settings > Edge Functions
2. Add the following secret:
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: Your service role key from Project Settings > API

### 5. Test the Functions
After deployment, test by creating a user through the admin panel in your app.

## Function URLs
After deployment, your functions will be available at:
- `https://pfvxitfsqpcchdfdojyi.supabase.co/functions/v1/create-user`
- `https://pfvxitfsqpcchdfdojyi.supabase.co/functions/v1/update-user`
- `https://pfvxitfsqpcchdfdojyi.supabase.co/functions/v1/delete-user`

## Troubleshooting
- If you get authentication errors, make sure you're logged in as an admin user
- If functions fail, check the Supabase Dashboard > Edge Functions > Logs
- Ensure SUPABASE_SERVICE_ROLE_KEY is set correctly in the dashboard
