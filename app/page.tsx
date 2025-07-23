import { AuthButton } from "@/components/auth-button";
import { Card } from "@/components/ui/card";
import { Music2Icon } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background/90 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex min-h-[80vh] flex-col items-center justify-center text-center px-4">
          <div className="glassmorphism rounded-full p-4 sm:p-6 mb-6 sm:mb-8">
            <Music2Icon className="h-12 w-12 sm:h-16 sm:w-16 text-primary animate-pulse" />
          </div>
          <h1 className="mb-4 text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-primary">
            Virtual Stream Deck
          </h1>
          <p className="mb-6 sm:mb-8 text-base sm:text-lg text-muted-foreground max-w-2xl">
            Your customizable sound board with a sleek interface
          </p>
          <Card className="glassmorphism p-4 sm:p-6 w-full max-w-sm sm:max-w-md">
            <AuthButton />
          </Card>
        </div>
      </div>
    </main>
  );
}