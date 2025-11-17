"use client";

import { useStreamDeckHotkeys } from "@/lib/hooks/useHotkeys";
import { useSoundLibrary } from "@/lib/hooks/useSoundLibrary";
import { useSoundStore } from "@/lib/store";
import type { GridConfig, StreamDeckKey } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect } from "react";
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

  const className = cn(
    "relative aspect-square w-full p-2 sm:p-4 rounded-md shadow-sm cursor-grab",
    isDragging ? "opacity-75" : "hover:shadow-md",
    "flex items-center justify-center text-center select-none",
    "bg-primary/5 border border-primary/10"
  );

  return (
    <button
      ref={setNodeRef}
      style={style}
      className={className}
      {...attributes}
      {...listeners}
      type="button"
      onClick={handleClick}
      aria-label={keyData.label || `Key ${keyData.position + 1}`}
    >
      <span className="text-xs sm:text-sm md:text-base lg:text-lg font-medium">
        {keyData.label || `Key ${keyData.position + 1}`}
      </span>
    </button>
  );
}

export function StreamDeckGrid({ config }: StreamDeckGridProps) {
  const { streamDeckKeys } = useSoundStore();

  const { loadInitialKeys, reorderKeys } = useSoundLibrary();

  useStreamDeckHotkeys();

  useEffect(() => {
    loadInitialKeys().catch(() => {
      toast.error("Failed to load stream deck configuration");
    });
  }, [loadInitialKeys]);

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

    try {
      await reorderKeys(newItems);
    } catch {
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