import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Service-role klient til brug i API-routes og cron-funktioner
// Bypasser RLS — brug kun server-side
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
