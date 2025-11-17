"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useKeyConfig } from "@/features/streamdeck/ui/hooks/useKeyConfig";
import { useSoundStore } from "@/shared/store";
import { toast } from "sonner";

export function KeyConfig() {
  const { sounds, updateKey, selectedKey } = useSoundStore();
  const [state, events] = useKeyConfig(selectedKey, sounds, { updateKey });
  const { config } = state;

  if (!selectedKey) {
    return (
      <Card className="h-full glassmorphism">
        <CardHeader>
          <CardTitle>Key Configuration</CardTitle>
          <CardDescription>Select a key to configure</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleSave = async () => {
    const res = await events.save();
    if (res.ok) {
      toast.success("Key configuration saved");
    } else {
      console.error("[KeyConfig] Error saving:", res.error);
      toast.error("Failed to save key configuration");
    }
  };

  return (
    <Card className="h-full glassmorphism">
      <CardHeader>
        <CardTitle>Key Configuration</CardTitle>
        <CardDescription>Customize selected key</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
        <div className="space-y-2">
          <Label htmlFor="sound" className="text-sm sm:text-base">Sound</Label>
          <Select
            value={config?.sound_id || ""}
            onValueChange={(value) => events.setSoundId(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a sound" />
            </SelectTrigger>
            <SelectContent>
              {sounds.map((sound) => (
                <SelectItem key={sound.id} value={sound.id}>
                  {sound.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="label" className="text-sm sm:text-base">Label</Label>
          <Input
            id="label"
            data-testid="label-input"
            value={config?.label || ""}
            onChange={(e) => events.setLabel(e.target.value)}
            className="text-sm sm:text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="color" className="text-sm sm:text-base">Color</Label>
          <Input
            id="color"
            data-testid="color-input"
            type="color"
            value={config?.color || "#00ffff"}
            onChange={(e) => events.setColor(e.target.value)}
            className="h-10 sm:h-12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hotkey" className="text-sm sm:text-base">Hotkey</Label>
          <Input
            id="hotkey"
            data-testid="hotkey-input"
            value={config?.hotkey || ""}
            onChange={(e) => events.setHotkey(e.target.value)}
            placeholder="e.g.: ctrl+1, shift+a"
            className="text-sm sm:text-base"
          />
          <p className="text-xs sm:text-sm text-muted-foreground">
            Format: use combinations like <code className="text-xs">ctrl+1</code>, <code className="text-xs">shift+a</code>, <code className="text-xs">alt+s</code>. 
            All keys must be lowercase. Do not use spaces or commas.
          </p>
        </div>
        <Button
          className="w-full text-sm sm:text-base py-2 sm:py-3"
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}