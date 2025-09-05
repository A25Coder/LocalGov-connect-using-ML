// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qrbetchmydpzhduukktg.supabase.co' // Yahan apni URL paste karein
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyYmV0Y2hteWRwemhkdXVra3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3Nzk1ODYsImV4cCI6MjA2OTM1NTU4Nn0.Ej6R3VJwyF_QjYEks4Y_TPMPC3ASNKJEZow-ZLquP2I' // Yahan apni anon key paste karein

export const supabase = createClient(supabaseUrl, supabaseAnonKey)