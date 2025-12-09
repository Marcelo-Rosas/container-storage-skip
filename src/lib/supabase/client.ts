import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const SUPABASE_URL = 'https://ktfvfulefozcecmemqaj.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZnZmdWxlZm96Y2VjbWVtcWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MzY0NDAsImV4cCI6MjA0OTAxMjQ0MH0.JM9h8bLFPm9hPrNxOl8IlAC4uW4_8TRi0PHkAKKfE8Y'

// Import the supabase client like this:
// import { supabase } from "@/lib/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  },
)
