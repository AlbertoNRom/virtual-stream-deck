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
import { useRemoveSound } from "@/lib/hooks/use-remove-sound";
import { useSoundUpload } from "@/lib/hooks/use-sound-upload";
import { useSoundStore } from "@/lib/store";
import type { StreamDeckKey } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { Key, Play, Search, Square, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

export function SoundLibrary() {
  const [search, setSearch] = useState("");
  const { 
    sounds, 
    setSounds, 
    playSound, 
    stopSound, 
    currentlyPlayingId,
    streamDeckKeys,
    setSelectedKey
  } = useSoundStore();

  const { uploadSound, isUploading } = useSoundUpload();
  const { removeSound, isRemoving } = useRemoveSound();
  
  // Estado para el sonido seleccionado actualmente
  const [selectedSoundId, setSelectedSoundId] = useState<string | null>(null);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'audio/*': ['.mp3', '.wav']
    },
    onDrop: async (acceptedFiles) => {
      if (sounds.length >= 9) {
        toast.error('You have reached the limit of 9 sounds. Delete some to add more.');
        return;
      }

      const remainingSlots = 9 - sounds.length;
      const filesToUpload = acceptedFiles.slice(0, remainingSlots);
      
      if (acceptedFiles.length > remainingSlots) {
        toast.warning(`Solo se cargarán ${remainingSlots} de ${acceptedFiles.length} sonidos debido al límite.`);
      }
      
      for (const file of filesToUpload) {
        await uploadSound(file);
      }
    },
    disabled: sounds.length >= 9 
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
    if (currentlyPlayingId === soundId) {
      stopSound(soundId);
    } else {
      playSound(soundId);
    }
  };

  // El evento 'end' ahora se maneja en el store

  const handleDelete = (soundId: string) => {
    removeSound(soundId);
    
    // Si el sonido eliminado era el seleccionado, deseleccionarlo
    if (selectedSoundId === soundId) {
      setSelectedSoundId(null);
    }
  };
  
  // Function to select a sound and configure a key
  const handleSelectSound = async (soundId: string) => {
    // If the sound is already selected, deselect it
    if (selectedSoundId === soundId) {
      setSelectedSoundId(null);
      setSelectedKey(null); // Reset KeyConfig state
      toast.info("Key configuration cancelled");
      return;
    }
    
    // Select the new sound
    setSelectedSoundId(soundId);
    
    // Get current streamDeckKeys state
    const currentStreamDeckKeys = useSoundStore.getState().streamDeckKeys;
    
    // Check if a key with this sound already exists
    const existingKey = currentStreamDeckKeys.find(key => key.sound_id === soundId);
    
    if (existingKey) {
      // If a key with this sound already exists, select it
      setSelectedKey(existingKey);
      toast.info("Key selected for configuration");
    } else {
      // If no key with this sound exists, create a new one
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error("User not authenticated");
          return;
        }
        
        // Get the current highest position
        const highestPosition = currentStreamDeckKeys.length > 0 
          ? Math.max(...currentStreamDeckKeys.map(key => key.position)) 
          : -1;
        
        const newPosition = highestPosition + 1;
        
        // Get the sound name
        const sound = sounds.find(s => s.id === soundId);
        
        if (!sound) {
          toast.error("Sound not found");
          return;
        }
        
        // Create a new key
        const newKey: Omit<StreamDeckKey, 'id' | 'created_at'> = {
          user_id: user.id,
          sound_id: soundId,
          position: newPosition,
          label: sound.name,
          color: "#FF5733", // Default color
          icon: null,
          hotkey: null
        };
        
        const { data: insertedKey, error } = await supabase
          .from('stream_deck_keys')
          .insert(newKey)
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        // Update store and select the new key
        const { setStreamDeckKeys } = useSoundStore.getState();
        setStreamDeckKeys([...currentStreamDeckKeys, insertedKey]);
        setSelectedKey(insertedKey);
        
        toast.success("New key created and selected");
      } catch (error) {
        console.error("Error creating key:", error);
        toast.error("Error creating key");
      }
    }
  };

  return (
    <Card className="h-full glassmorphism">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl">Sound Library</CardTitle>
        <CardDescription className="text-sm sm:text-base">Manage your sound collection</CardDescription>
        <div className="flex flex-col gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sounds..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-sm sm:text-base"
            />
          </div>
          <Button 
            variant="outline" 
            className="shrink-0 text-sm sm:text-base"
            onClick={() => {
              const input = document.querySelector('input[type="file"]') as HTMLInputElement;
              if (input) {
                input.click();
              }
            }}
            disabled={sounds.length >= 9}
          >
            <Upload className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Upload</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center transition-colors ${
            isDragActive ? "border-primary bg-primary/10" : "border-muted"
          } ${
            sounds.length >= 9 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-4 text-muted-foreground" />
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isUploading
              ? "Uploading..."
              : sounds.length >= 9
                ? "Sound limit reached. Delete some to add more."
                : "Drag & drop audio files here, or click to select files"}
          </p>
          <div className="mt-1 sm:mt-2 text-xs text-muted-foreground">
            <p>Supported formats: MP3, WAV | Max size: 5MB | Limit: {sounds.length}/9 sounds</p>
          </div>
        </div>

        {/* Show warning when user is close to the limit */}
        {sounds.length >= 7 && sounds.length < 9 && (
          <div className="p-2 sm:p-3 mb-2 sm:mb-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-xs sm:text-sm">
            <p className="font-medium text-yellow-500">Warning! You are close to the sound limit</p>
            <p className="text-xs text-muted-foreground mt-1">You have {sounds.length} of 9 allowed sounds.</p>
          </div>
        )}
        
        {/* Show error when user reaches the limit */}
        {sounds.length >= 9 && (
          <div className="p-2 sm:p-3 mb-2 sm:mb-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs sm:text-sm">
            <p className="font-medium text-red-500">You have reached the sound limit</p>
            <p className="text-xs text-muted-foreground mt-1">Delete some sounds to add more.</p>
          </div>
        )}
        
        <div className="space-y-1 sm:space-y-2">
          {filteredSounds.map((sound) => (
            <div
              key={sound.id}
              className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50"
            >
              <span className="truncate flex-1 text-sm sm:text-base">{sound.name}</span>
              <div className="flex gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePlay(sound.id)}
                  className="h-8 w-8 sm:h-10 sm:w-10"
                >
                  {currentlyPlayingId === sound.id ? (
                    <Square className="h-3 w-3 sm:h-4 sm:w-4" />
                  ) : (
                    <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`
                    h-8 w-8 sm:h-10 sm:w-10
                    transition-colors duration-200
                    hover:bg-primary/10 hover:text-primary
                    active:bg-primary/30 active:text-primary
                    ${selectedSoundId === sound.id ? 'bg-primary/20 text-primary ring-1 ring-primary' : ''}
                  `}
                  onClick={() => handleSelectSound(sound.id)}
                  title="Select to configure key"
                >
                  <Key className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(sound.id)}
                  disabled={isRemoving}
                  className="h-8 w-8 sm:h-10 sm:w-10"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}