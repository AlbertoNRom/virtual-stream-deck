"use client";

import { useSoundStore } from "@/lib/store";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

export function useRemoveSound() {
  const [isRemoving, setIsRemoving] = useState(false);
  const removeSoundFromStore = useSoundStore((state) => state.removeSound);
  const setStreamDeckKeys = useSoundStore((state) => state.setStreamDeckKeys);
  const streamDeckKeys = useSoundStore((state) => state.streamDeckKeys);
  const supabase = createClient();

  const removeSound = async (soundId: string) => {
    try {
      setIsRemoving(true);
      
      // Get the sound URL to delete from storage
      const { data: soundData, error: soundError } = await supabase
        .from("sounds")
        .select("url")
        .eq("id", soundId)
        .single();

      if (soundError) throw soundError;

      // Delete from database (this will cascade delete stream_deck_keys due to foreign key constraint)
      const { error: deleteError } = await supabase
        .from("sounds")
        .delete()
        .eq("id", soundId);

      if (deleteError) throw deleteError;

      // Extract the path from the URL to delete from storage
      if (soundData?.url) {
        // Extract the file path from the URL
        // URL format: https://supabase-url/storage/v1/object/public/vsd-bucket/user-id/filename.mp3
        try {
          const url = new URL(soundData.url);
          const pathParts = url.pathname.split('/public/vsd-bucket/');

          if (pathParts.length > 1) {
            const storagePath = pathParts[1];
            
            // Skip deletion of shared sample sounds
            if (storagePath.includes('/shared/')) {
              console.log("Skipping deletion of shared sample sound:", storagePath);
              // Continue with the rest of the function without deleting from storage
            } else {
            console.log("Deleting file from storage:", storagePath);
            
            const { error: storageError } = await supabase.storage
              .from("vsd-bucket")
              .remove([storagePath]);
            
            if (storageError) {
              console.error("Failed to delete from storage:", storageError);
              // Continue anyway as the database record is deleted
            } else {
              console.log("Successfully deleted file from storage:", storagePath);
            }
            }
          } else {
            console.error("Could not extract storage path from URL:", soundData.url);
          }
        } catch (error) {
          console.error("Error parsing sound URL:", error);
        }
      }

      // Update the store
      removeSoundFromStore(soundId);
      
      // Update stream deck keys in the store
      setStreamDeckKeys(streamDeckKeys.filter(key => key.sound_id !== soundId));
      
      toast.success("Sound removed successfully");
    } catch (error) {
      console.error("Remove error:", error instanceof Error ? error.message : 'Unknown');
      toast.error("Failed to remove sound");
    } finally {
      setIsRemoving(false);
    }
  };

  return { removeSound, isRemoving };
}