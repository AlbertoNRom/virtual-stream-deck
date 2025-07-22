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
        toast.error('Has alcanzado el límite de 9 sonidos. Elimina alguno para añadir más.');
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
  
  // Función para seleccionar un sonido y configurar una tecla
  const handleSelectSound = async (soundId: string) => {
    // Si el sonido ya está seleccionado, lo deseleccionamos
    if (selectedSoundId === soundId) {
      setSelectedSoundId(null);
      setSelectedKey(null); // Restablecer el estado de KeyConfig
      toast.info("Configuración de tecla cancelada");
      return;
    }
    
    // Seleccionar el nuevo sonido
    setSelectedSoundId(soundId);
    
    // Obtener el estado actual de streamDeckKeys
    const currentStreamDeckKeys = useSoundStore.getState().streamDeckKeys;
    
    // Buscar si ya existe una tecla con este sonido
    const existingKey = currentStreamDeckKeys.find(key => key.sound_id === soundId);
    
    if (existingKey) {
      // Si ya existe una tecla con este sonido, seleccionarla
      setSelectedKey(existingKey);
      toast.info("Tecla seleccionada para configuración");
    } else {
      // Si no existe una tecla con este sonido, crear una nueva
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error("Usuario no autenticado");
          return;
        }
        
        // Obtener la posición más alta actual
        const highestPosition = currentStreamDeckKeys.length > 0 
          ? Math.max(...currentStreamDeckKeys.map(key => key.position)) 
          : -1;
        
        const newPosition = highestPosition + 1;
        
        // Obtener el nombre del sonido
        const sound = sounds.find(s => s.id === soundId);
        
        if (!sound) {
          toast.error("Sonido no encontrado");
          return;
        }
        
        // Crear una nueva tecla
        const newKey: Omit<StreamDeckKey, 'id' | 'created_at'> = {
          user_id: user.id,
          sound_id: soundId,
          position: newPosition,
          label: sound.name,
          color: "#FF5733", // Color por defecto
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
        
        // Actualizar el store y seleccionar la nueva tecla
        const { setStreamDeckKeys } = useSoundStore.getState();
        setStreamDeckKeys([...currentStreamDeckKeys, insertedKey]);
        setSelectedKey(insertedKey);
        
        toast.success("Nueva tecla creada y seleccionada");
      } catch (error) {
        console.error("Error al crear la tecla:", error);
        toast.error("Error al crear la tecla");
      }
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
          } ${
            sounds.length >= 9 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isUploading
              ? "Uploading..."
              : sounds.length >= 9
                ? "Límite de sonidos alcanzado. Elimina alguno para añadir más."
                : "Drag & drop audio files here, or click to select files"}
          </p>
          <div className="mt-2 text-xs text-muted-foreground">
            <p>Supported formats: MP3, WAV | Tamaño máximo: 2MB | Límite: {sounds.length}/9 sonidos</p>
          </div>
        </div>

        {/* Mostrar advertencia cuando el usuario esté cerca del límite */}
        {sounds.length >= 7 && sounds.length < 9 && (
          <div className="p-3 mb-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm">
            <p className="font-medium text-yellow-500">¡Atención! Estás cerca del límite de sonidos</p>
            <p className="text-xs text-muted-foreground mt-1">Tienes {sounds.length} de 9 sonidos permitidos.</p>
          </div>
        )}
        
        {/* Mostrar error cuando el usuario alcance el límite */}
        {sounds.length >= 9 && (
          <div className="p-3 mb-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm">
            <p className="font-medium text-red-500">Has alcanzado el límite de sonidos</p>
            <p className="text-xs text-muted-foreground mt-1">Elimina algún sonido para poder añadir más.</p>
          </div>
        )}
        
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
                  {currentlyPlayingId === sound.id ? (
                    <Square className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`
                    transition-colors duration-200
                    hover:bg-primary/10 hover:text-primary
                    active:bg-primary/30 active:text-primary
                    ${selectedSoundId === sound.id ? 'bg-primary/20 text-primary ring-1 ring-primary' : ''}
                  `}
                  onClick={() => handleSelectSound(sound.id)}
                  title="Seleccionar para configurar tecla"
                >
                  <Key className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(sound.id)}
                  disabled={isRemoving}
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