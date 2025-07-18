import { AuthButton } from "@/components/auth-button";
import { Card } from "@/components/ui/card";
import { Music2Icon } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background/90 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
          <div className="glassmorphism rounded-full p-6 mb-8">
            <Music2Icon className="h-16 w-16 text-primary animate-pulse" />
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-primary sm:text-6xl">
            Virtual Stream Deck
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Your customizable sound board with a sleek interface
          </p>
          <Card className="glassmorphism p-6 w-full max-w-md">
            <AuthButton />
          </Card>
        </div>
      </div>
    </main>
  );
}