"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

export function AuthButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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