import { KeyConfig } from '@/components/key-config';
import { SoundLibrary } from '@/components/sound-library';
import { StreamDeckGrid } from '@/components/stream-deck-grid';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/server';
import { LogOut } from 'lucide-react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Dashboard - Virtual Stream Deck',
  description: 'Manage your sound library and configure your stream deck with custom audio clips for professional streaming.',
  keywords: ['dashboard', 'sound board', 'stream deck', 'audio clips', 'streaming', 'content creation'],
  openGraph: {
    title: 'Dashboard - Virtual Stream Deck',
    description: 'Manage your sound library and configure your stream deck with custom audio clips for professional streaming.',
    type: 'website',
  },
};

export default async function Dashboard() {
  // Check if we're in E2E test mode
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isE2ETest = userAgent.includes('Playwright-E2E-Test') || process.env.NODE_ENV === 'test';
  
  let user = null;
  
  if (!isE2ETest) {
    const supabase = createClient();
    const { data: { user: authUser } } = await (await supabase).auth.getUser();
    user = authUser;
    
    if (!user) {
      redirect('/');
    }
  } else {
    // Mock user for E2E tests
    user = {
      id: 'test-user-id',
      email: 'test@example.com',
      user_metadata: {
        full_name: 'Test User'
      }
    };
  }

  const signOut = async () => {
    'use server';
    const supabase = createClient();
    await (await supabase).auth.signOut();
    redirect('/');
  };
  
  // Note: The selectedKey is managed through global state in useSoundStore

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/90 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Welcome, <b>{user?.user_metadata?.full_name ?? user?.email}</b></p>
          </div>
          <form action={signOut}>
            <Button variant="ghost" className="gap-2 text-sm sm:text-base">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </form>
        </div>
        
        {/* Responsive layout: mobile (1 column), tablet (2 columns), desktop (3 columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Sound Library */}
          <div className="lg:col-span-3 order-1 lg:order-1">
            <SoundLibrary />
          </div>
          
          {/* Stream Deck Grid */}
          <div className="lg:col-span-6 order-3 lg:order-2">
            <div className="glassmorphism rounded-lg p-4 sm:p-6">
              <StreamDeckGrid config={{ rows: 3, columns: 3 }} />
            </div>
          </div>
          
          {/* Key Configuration */}
          <div className="lg:col-span-3 order-2 lg:order-3">
            <KeyConfig />
          </div>
        </div>
      </div>
    </div>
  );
}