import { AuthButton } from "@/components/auth-button";
import { Card } from "@/components/ui/card";
import { Music2Icon, Zap, Headphones, Settings } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home - Professional Sound Board & Audio Control',
  description: 'Get started with Virtual Stream Deck - the ultimate professional sound board for streamers, content creators, and audio professionals. Free, customizable, and easy to use.',
  openGraph: {
    title: 'Virtual Stream Deck - Professional Sound Board & Audio Control',
    description: 'Get started with Virtual Stream Deck - the ultimate professional sound board for streamers, content creators, and audio professionals.',
  },
};

export default function Home() {
  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-background/90 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[80vh] flex-col items-center justify-center text-center px-4">
            <div className="glassmorphism rounded-full p-4 sm:p-6 mb-6 sm:mb-8">
              <Music2Icon className="h-12 w-12 sm:h-16 sm:w-16 text-primary animate-pulse" />
            </div>
            <h1 className="mb-4 text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-primary">
              Virtual Stream Deck
            </h1>
            <h2 className="mb-6 sm:mb-8 text-base sm:text-lg text-muted-foreground max-w-2xl">
              Professional sound board with customizable hotkeys and real-time audio control for streamers and content creators
            </h2>
            <Card className="glassmorphism p-4 sm:p-6 w-full max-w-sm sm:max-w-md">
              <AuthButton />
            </Card>
          </div>
        </div>
      </main>
      
      <section className="py-16 px-4 sm:px-6 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Virtual Stream Deck?</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              The ultimate sound board solution for professional streamers, content creators, and audio enthusiasts
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="glassmorphism rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Instant audio playback with customizable hotkeys for seamless streaming and content creation
              </p>
            </div>
            
            <div className="text-center">
              <div className="glassmorphism rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Headphones className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Professional Audio</h3>
              <p className="text-muted-foreground">
                Support for multiple audio formats with high-quality playback and real-time audio control
              </p>
            </div>
            
            <div className="text-center">
              <div className="glassmorphism rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Settings className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fully Customizable</h3>
              <p className="text-muted-foreground">
                Drag and drop interface with customizable keys, colors, and labels for your perfect setup
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}