"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { StreamDeckKey } from "@/lib/types";
import { useSoundStore } from "@/lib/store";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface KeyConfigProps {
  selectedKey: StreamDeckKey | null;
}

export function KeyConfig({ selectedKey }: KeyConfigProps) {
  const [config, setConfig] = useState(selectedKey);
  const { sounds, updateKey } = useSoundStore();

  useEffect(() => {
    setConfig(selectedKey);
  }, [selectedKey]);

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
    if (!config) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("stream_deck_keys")
        .update(config)
        .eq("id", config.id);

      if (error) throw error;

      updateKey(config);
      toast.success("Key configuration saved");
    } catch (error) {
      toast.error("Failed to save key configuration");
    }
  };

  return (
    <Card className="h-full glassmorphism">
      <CardHeader>
        <CardTitle>Key Configuration</CardTitle>
        <CardDescription>Customize selected key</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sound">Sound</Label>
          <Select
            value={config?.sound_id || ""}
            onValueChange={(value) =>
              setConfig(config ? { ...config, sound_id: value } : null)
            }
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
          <Label htmlFor="label">Label</Label>
          <Input
            id="label"
            value={config?.label || ""}
            onChange={(e) =>
              setConfig(config ? { ...config, label: e.target.value } : null)
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            type="color"
            value={config?.color || "#00ffff"}
            onChange={(e) =>
              setConfig(config ? { ...config, color: e.target.value } : null)
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hotkey">Hotkey</Label>
          <Input
            id="hotkey"
            value={config?.hotkey || ""}
            onChange={(e) =>
              setConfig(config ? { ...config, hotkey: e.target.value } : null)
            }
          />
        </div>
        <Button
          className="w-full"
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}