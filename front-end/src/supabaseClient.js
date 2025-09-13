// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = '' // Yahan apni URL paste karein
const supabaseAnonKey = ''// Yahan apni anon key paste karein

export const supabase = createClient(supabaseUrl, supabaseAnonKey)