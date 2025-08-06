"use client";

import { useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { GridConfig, StreamDeckKey } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSoundStore } from "@/lib/store";
import { useStreamDeckHotkeys } from "@/lib/hooks/use-hotkeys";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface StreamDeckGridProps {
  config: GridConfig;
}

function SortableItem({ id, keyData, config }: { id: string; keyData: StreamDeckKey; config: GridConfig }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const { setSelectedKey, playSound } = useSoundStore();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    //backgroundColor: keyData?.color || "hsl(var(--background))",
    backgroundImage: `linear-gradient(135deg, ${keyData?.color || "hsl(var(--background))"}, transparent)`,
    gridColumn: "span 1",
    gridRow: "span 1",
  };

  const handleClick = () => {
    if (keyData) {
      setSelectedKey(keyData);
      if (keyData.sound_id) {
        playSound(keyData.sound_id);
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "grid-key group relative cursor-grab touch-none",
        "h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 rounded-lg sm:rounded-xl border-2 border-border p-2 sm:p-4 md:p-6 shadow-xl",
        "transition-all duration-200 ease-in-out hover:shadow-2xl",
        "flex items-center justify-center text-center",
        "active:cursor-grabbing active:scale-95",
        "hover:z-10 hover:border-primary hover:bg-opacity-80",
        isDragging && "opacity-50 shadow-2xl"
      )}
      onClick={handleClick}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-transparent via-black/10 to-black/20 opacity-60" />
      <div className="absolute inset-0 rounded-xl bg-black/10 opacity-0 transition-opacity group-hover:opacity-20" />
      <span className="z-10 text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-foreground drop-shadow-md break-words">
        {keyData?.label || `Key ${Number.parseInt(id.split("-")[1]) + 1}`}
      </span>
    </div>
  );
}

export function StreamDeckGrid({ config }: StreamDeckGridProps) {
  const { streamDeckKeys, setStreamDeckKeys } = useSoundStore();

  useStreamDeckHotkeys();

  useEffect(() => {
    const loadKeys = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("stream_deck_keys")
        .select("*")
        .order("position");

      if (error) {
        toast.error("Failed to load stream deck configuration");
        return;
      }

      setStreamDeckKeys(data);
    };

    loadKeys();
  }, [setStreamDeckKeys]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = streamDeckKeys.findIndex(
      (k) => `key-${k.position}` === active.id
    );
    const newIndex = streamDeckKeys.findIndex(
      (k) => `key-${k.position}` === over.id
    );

    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = arrayMove(streamDeckKeys, oldIndex, newIndex).map(
      (item, index) => ({
        ...item,
        position: index,
      })
    );

    setStreamDeckKeys(newItems);

    const supabase = createClient();
    const { error } = await supabase
      .from("stream_deck_keys")
      .upsert(newItems);

    if (error) {
      toast.error("Failed to save key positions");
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={streamDeckKeys.map(item => `key-${item.position}`)}
        strategy={rectSortingStrategy}
      >
        <div
          data-testid="stream-deck-grid"
          className="grid gap-2 sm:gap-4 md:gap-6 lg:gap-8 p-2 sm:p-4 md:p-6 lg:p-8"
          style={{
            gridTemplateColumns: `repeat(${config.columns}, minmax(0, 1fr))`,
          }}
        >
          {streamDeckKeys.length === 0 ? (
            <div className="col-span-full text-center text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground">
              No keys configured. Click to add new keys.
            </div>
          ) : streamDeckKeys.map((item) => (
            <SortableItem
              key={`key-${item.position}`}
              id={`key-${item.position}`}
              keyData={item}
              config={config}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}