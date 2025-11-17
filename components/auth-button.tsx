"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/db/supabase/client";

export function AuthButton() {
  const supabase = createClient();

  const handleSignIn = async () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${baseUrl}/auth/callback`,
        queryParams: {
          prompt: 'consent' 
        }    
      },
    });
  };

  return (
    <Button
      size="lg"
      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
      onClick={handleSignIn}
    >
      Sign in with Google
    </Button>
  );
}