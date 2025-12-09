import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = 'https://ktfvfulefozcecmemqaj.supabase.co'
export const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZnZmdWxlZm96Y2VjbWVtcWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MzY0NDAsImV4cCI6MjA0OTAxMjQ0MH0.JM9h8bLFPm9hPrNxOl8IlAC4uW4_8TRi0PHkAKKfE8Y'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
