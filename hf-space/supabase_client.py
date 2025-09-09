from supabase import create_client
import os

SUPABASE_URL = os.getenv("SUPABASE_URL",'https://qrbetchmydpzhduukktg.supabase.co')
SUPABASE_KEY = os.getenv("SUPABASE_KEY", 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyYmV0Y2hteWRwemhkdXVra3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3Nzk1ODYsImV4cCI6MjA2OTM1NTU4Nn0.Ej6R3VJwyF_QjYEks4Y_TPMPC3ASNKJEZow-ZLquP2I' )  # service role key

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
