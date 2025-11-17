import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
	doublePrecision,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core';

export const sounds = pgTable('sounds', {
	id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
	user_id: uuid('user_id').notNull(),
	name: text('name').notNull(),
	url: text('url').notNull(),
	duration: doublePrecision('duration').notNull(),
	created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const stream_deck_keys = pgTable('stream_deck_keys', {
	id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
	user_id: uuid('user_id').notNull(),
	sound_id: uuid('sound_id').references(() => sounds.id, {
		onDelete: 'cascade',
	}),
	position: integer('position').notNull(),
	label: text('label'),
	color: text('color').default('#00ffff'),
	icon: text('icon'),
	hotkey: text('hotkey'),
	created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const soundRelations = relations(sounds, ({ many }) => ({
	keys: many(stream_deck_keys),
}));

export const streamDeckKeyRelations = relations(
	stream_deck_keys,
	({ one }) => ({
		sound: one(sounds, {
			fields: [stream_deck_keys.sound_id],
			references: [sounds.id],
		}),
	}),
);

export type SoundRow = InferSelectModel<typeof sounds>;
export type NewSoundRow = InferInsertModel<typeof sounds>;
export type StreamDeckKeyRow = InferSelectModel<typeof stream_deck_keys>;
export type NewStreamDeckKeyRow = InferInsertModel<typeof stream_deck_keys>;
