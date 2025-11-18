'use client';

import type { StreamDeckKeyRow } from '@/db/supabase/schema';
import { useSoundLibrary } from '@/features/sounds/ui/hooks/useSoundLibrary';
import { useStreamDeckHotkeys } from '@/features/streamdeck/ui/hooks/useStreamDeckHotkeys';
import { useSoundStore } from '@/shared/store';
import { cn } from '@/shared/utils';
import {
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	TouchSensor,
	closestCenter,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	SortableContext,
	arrayMove,
	rectSortingStrategy,
	useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { use, useEffect } from 'react';
import { toast } from 'sonner';

type GridConfig = { rows: number; columns: number };
interface StreamDeckGridProps {
	config: GridConfig;
	initialKeysPromise?: Promise<StreamDeckKeyRow[]>;
}

const SortableItem = ({
	id,
	keyData,
}: {
	id: string;
	keyData: StreamDeckKeyRow;
}) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id,
		transition: null, // Desactivar transición para evitar doble animación
	});

	const { setSelectedKey, playSound } = useSoundStore();

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		//backgroundColor: keyData?.color || "hsl(var(--background))",
		backgroundImage: `linear-gradient(135deg, ${keyData?.color || 'hsl(var(--background))'}, transparent)`,
		gridColumn: 'span 1',
		gridRow: 'span 1',
		touchAction: 'none',
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
		'relative aspect-square w-full p-2 sm:p-4 rounded-md cursor-grab sortable-item',
		isDragging ? 'opacity-75 sortable-item-dragging' : '',
		'flex items-center justify-center text-center select-none',
		'bg-primary/5 border border-primary/10',
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
			data-dragging={isDragging}
		>
			<span className="text-xs sm:text-sm md:text-base lg:text-lg font-medium truncate w-full px-1 leading-tight">
				{keyData.label || `Key ${keyData.position + 1}`}
			</span>
		</button>
	);
};

export const StreamDeckGrid = ({
	config,
	initialKeysPromise,
}: StreamDeckGridProps) => {
	const { streamDeckKeys, setStreamDeckKeys } = useSoundStore();

	const { reorderKeys } = useSoundLibrary();

	useStreamDeckHotkeys();

	const initialKeys = initialKeysPromise ? use(initialKeysPromise) : null;
	useEffect(() => {
		if (initialKeys) {
			setStreamDeckKeys(initialKeys);
		}
	}, [initialKeys, setStreamDeckKeys]);

	const keysForRender =
		streamDeckKeys.length > 0 ? streamDeckKeys : (initialKeys ?? []);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 3,
			},
		}),
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: 180,
				tolerance: 8,
			},
		}),
		useSensor(KeyboardSensor),
	);

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const oldIndex = streamDeckKeys.findIndex(
			(k) => `key-${k.position}` === active.id,
		);
		const newIndex = streamDeckKeys.findIndex(
			(k) => `key-${k.position}` === over.id,
		);

		if (oldIndex === -1 || newIndex === -1) return;

		// Actualizar el estado inmediatamente para evitar el parpadeo
		const newItems = arrayMove(streamDeckKeys, oldIndex, newIndex).map(
			(item, index) => ({
				...item,
				position: index,
			}),
		);

		// Actualizar el store localmente primero
		const { setStreamDeckKeys } = useSoundStore.getState();
		setStreamDeckKeys(newItems);

		// Luego sincronizar con la base de datos en segundo plano
		try {
			await reorderKeys(newItems);
		} catch {
			toast.error('Failed to save key positions');
			// Revertir al estado anterior si falla
			setStreamDeckKeys(streamDeckKeys);
		}
	};

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<SortableContext
				items={keysForRender.map((item) => `key-${item.position}`)}
				strategy={rectSortingStrategy}
			>
				<div
					data-testid="stream-deck-grid"
					className="grid gap-2 sm:gap-4 md:gap-6 lg:gap-8 p-2 sm:p-4 md:p-6 lg:p-8"
					style={{
						gridTemplateColumns: `repeat(${config.columns}, minmax(0, 1fr))`,
					}}
				>
					{keysForRender.length === 0 ? (
						<div className="col-span-full text-center text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground">
							No keys configured. Click to add new keys.
						</div>
					) : (
						keysForRender.map((item) => (
							<SortableItem
								key={`key-${item.position}`}
								id={`key-${item.position}`}
								keyData={item}
							/>
						))
					)}
				</div>
			</SortableContext>
		</DndContext>
	);
};
