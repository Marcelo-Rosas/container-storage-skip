import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vxzmwzhtklttorvlzhvb.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4em13emh0a2x0dG9ydmx6aHZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMDg5MjIsImV4cCI6MjA4MDg4NDkyMn0.VvROPp_NMMHnN77WEwYkWRmxDL_oKFNkIc1qyZuJf4w'

export const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase
