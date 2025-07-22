"use client";

import { useSoundStore } from "@/lib/store";
import type { Sound } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { capitalizeAndRemoveExtension } from "../utils";

export function useSoundUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const addSound = useSoundStore((state) => state.addSound);
  const supabase = createClient();

  const uploadSound = async (file: File) => {
    try {
      setIsUploading(true);
      const { data: { user }} = await supabase.auth.getUser();

      // Upload file to Supabase Storage
      const filename = `${user?.id}/${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("vsd-bucket")
        .upload(filename, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("vsd-bucket")
        .getPublicUrl(filename);

      if (!publicUrl) throw uploadError;

      // Create audio element to get duration
      const audio = new Audio(publicUrl);
      await new Promise((resolve) => {
        audio.addEventListener("loadedmetadata", resolve, { once: true });
      });

      // Insert into database
      const { data: soundData, error: dbError } = await supabase
        .from("sounds")
        .insert({
          user_id: user?.id,
          category: "effects", // Default category
          name: capitalizeAndRemoveExtension(file.name),
          url: publicUrl,
          duration: audio.duration,
          tags: []
        })
        .select()
        .single();

      if (dbError) throw dbError;
      
      // Get the current highest position to place the new key at the end
      const { data: existingKeys } = await supabase
        .from('stream_deck_keys')
        .select('position')
        .order('position', { ascending: false })
        .limit(1);
      
      const highestPosition = existingKeys && existingKeys.length > 0 ? existingKeys[0].position : -1;
      const newPosition = highestPosition + 1;
      
      // Create lowercase hotkey for compatibility with react-hotkeys-hook
      const dynamicHotkey = `ctrl+${newPosition + 1}`.toLowerCase();
      console.log(`[useSoundUpload] Assigning dynamic hotkey: ${dynamicHotkey}`);
      
      const { data: insertedKey, error: keyError } = await supabase
        .from('stream_deck_keys')
        .insert({
          user_id: user?.id,
          sound_id: soundData.id,
          position: newPosition, // Place at the end of the grid
          label: capitalizeAndRemoveExtension(file.name),
          color: "#FF5733", // Default color
          icon: "sound effect", // Default icon
          hotkey: dynamicHotkey // Dynamic hotkey based on position (in lowercase)
        })
        .select().single();

      if (keyError) throw keyError;

      // Add to store
      addSound(soundData as Sound);
      
      // Update the stream deck keys in the store
      const { setStreamDeckKeys, streamDeckKeys } = useSoundStore.getState();
      setStreamDeckKeys([...streamDeckKeys, insertedKey]);
      toast.success("Sound uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error instanceof Error ? error.message : 'Unknown');
      toast.error("Failed to upload sound");
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadSound, isUploading };
}