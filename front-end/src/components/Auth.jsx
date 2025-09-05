// src/components/Auth.jsx
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../supabaseClient';
import React from 'react';

const Auth = () => {
  return (
    <div style={{ maxWidth: '420px', margin: '50px auto' }}>
      <SupabaseAuth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['google']} // Yahan Google login on kiya hai
        theme="dark"
      />
    </div>
  );
};

export default Auth;