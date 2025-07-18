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
import { useSoundUpload } from "@/lib/hooks/use-sound-upload";
import { useSoundStore } from "@/lib/store";
import { createClient } from "@/utils/supabase/client";
import { Play, Search, Square, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

export function SoundLibrary() {
  const [search, setSearch] = useState("");
  const { sounds, setSounds, playSound, stopSound, removeSound } = useSoundStore();

  const { uploadSound, isUploading } = useSoundUpload();
  const [playingId, setPlayingId] = useState<string | null>(null);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'audio/*': ['.mp3', '.wav']
    },
    onDrop: async (acceptedFiles) => {
      for (const file of acceptedFiles) {
        await uploadSound(file);
      }
    }
  });

  useEffect(() => {
    const loadSounds = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("sounds")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load sounds");
        return;
      }

      setSounds(data);
    };

    loadSounds();
  }, [setSounds]);

  const filteredSounds = sounds.filter((sound) =>
    sound.name.toLowerCase().includes(search.toLowerCase())
  );

  const handlePlay = (soundId: string) => {
    if (playingId === soundId) {
      stopSound(soundId);
      setPlayingId(null);
    } else {
      if (playingId) {
        stopSound(playingId);
      }
      playSound(soundId);
      setPlayingId(soundId);
    }
  };

  useEffect(() => {
    // Add onend event listener to the currently playing sound
    if (playingId) {
      const { audioInstances } = useSoundStore.getState();
      const instance = audioInstances.get(playingId);
      
      if (instance) {
        // Set up onend callback
        instance.once('end', () => {
          setPlayingId(null);
        });
      }
    }
  }, [playingId]);

  const handleDelete = async (soundId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("sounds")
        .delete()
        .eq("id", soundId);

      if (error) throw error;

      removeSound(soundId);
      toast.success("Sound deleted successfully");
    } catch (error) {
      toast.error("Failed to delete sound");
    }
  };

  return (
    <Card className="h-full glassmorphism">
      <CardHeader>
        <CardTitle>Sound Library</CardTitle>
        <CardDescription>Manage your sound collection</CardDescription>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sounds..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button variant="outline" className="shrink-0">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragActive ? "border-primary bg-primary/10" : "border-muted"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isUploading
              ? "Uploading..."
              : "Drag & drop audio files here, or click to select files"}
          </p>
        </div>

        <div className="space-y-2">
          {filteredSounds.map((sound) => (
            <div
              key={sound.id}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
            >
              <span className="truncate flex-1">{sound.name}</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePlay(sound.id)}
                >
                  {playingId === sound.id ? (
                    <Square className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(sound.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}