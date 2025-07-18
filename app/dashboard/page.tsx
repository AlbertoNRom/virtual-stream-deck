import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { SoundLibrary } from '@/components/sound-library';
import { StreamDeckGrid } from '@/components/stream-deck-grid';
import { KeyConfig } from '@/components/key-config';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default async function Dashboard() {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();

  if (!user) {
    redirect('/');
  }

  const signOut = async () => {
    'use server';
    const supabase = createClient();
    await (await supabase).auth.signOut();
    redirect('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/90 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary">Dashboard</h1>
            <p className="text-muted-foreground">Welcome, <b>{user.user_metadata.full_name ?? user.email}</b></p>
          </div>
          <form action={signOut}>
            <Button variant="ghost" className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>
        
        <div className="grid grid-cols-12 gap-6">
          {/* Sound Library */}
          <div className="col-span-3">
            <SoundLibrary />
          </div>
          
          {/* Stream Deck Grid */}
          <div className="col-span-6">
            <div className="glassmorphism rounded-lg p-6">
              <StreamDeckGrid config={{ rows: 3, columns: 3 }} />
            </div>
          </div>
          
          {/* Key Configuration */}
          <div className="col-span-3">
            <KeyConfig selectedKey={null} />
          </div>
        </div>
      </div>
    </div>
  );
}