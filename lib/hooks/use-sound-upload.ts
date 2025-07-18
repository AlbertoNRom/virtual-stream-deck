"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useSoundStore } from "@/lib/store";
import type { Sound } from "@/lib/types";
import { toast } from "sonner";

export function useSoundUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const addSound = useSoundStore((state) => state.addSound);
  const supabase = createClient();

  const uploadSound = async (file: File) => {
    try {
      setIsUploading(true);
      const { data: { user }} = await supabase.auth.getUser();

      // Upload to Supabase Storage
      const filename = `${user?.id}/${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("vsd-bucket")
        .upload(filename, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("sounds")
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
          name: file.name,
          url: publicUrl,
          duration: audio.duration,
          tags: []
        })
        .select()
        .single();

      if (dbError) throw dbError;
      
      const { data: insertedKeys, error: keyError } = await supabase
        .from('stream_deck_keys')
        .insert({
          user_id: user?.id,
          sound_id: soundData.id,
          position: 1, // Default position
          label: file.name,
          color: "#FF5733", // Default color
          icon: "sound effect", // Default icon
          hotkey: "Ctrl+1" // Default hotkey
        })
        .select().single();

      if (keyError) throw keyError;

     

      // Add to store
      addSound(soundData as Sound);
      toast.success("Sound uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error.message);
      toast.error("Failed to upload sound");
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadSound, isUploading };
}