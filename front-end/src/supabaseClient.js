// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vwlegdiccexoeozabozp.supabase.co' // Yahan apni URL paste karein
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3bGVnZGljY2V4b2VvemFib3pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MTUxNjgsImV4cCI6MjA3MjM5MTE2OH0.pHZ0nQFzvwrVBKvxb1MnZRbaFXAS6Krkc1xV80bCjWA' // Yahan apni anon key paste karein

export const supabase = createClient(supabaseUrl, supabaseAnonKey)