import fs from 'node:fs';
import path from 'node:path';
// pages/api/insert-stream-deck-keys.js
import { env } from '@/env';
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next/types';

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
	env.NEXT_PUBLIC_SUPABASE_URL,
	env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
);

const fileExistsInStorage = async (filePath: string): Promise<boolean> => {
	try {
		const { data, error } = await supabase.storage
			.from('vsd-bucket')
			.list(path.dirname(filePath), {
				search: path.basename(filePath),
			});

		if (error) {
			return false;
		}

		return data && data.length > 0;
	} catch (_error) {
		return false;
	}
};

const uploadSharedSound = async (
	soundId: string,
	localPath: string,
): Promise<string> => {
	try {
		const fileBuffer = fs.readFileSync(localPath);

		//@ts-ignore
		const file = new File([fileBuffer], `${soundId}.mp3`, {
			type: 'audio/mpeg',
		});

		// Upload to shared folder in storage
		const storagePath = `shared/${soundId}.mp3`;

		// Check if file already exists
		const { data: existingFiles } = await supabase.storage
			.from('vsd-bucket')
			.list('shared', { search: `${soundId}.mp3` });

		if (existingFiles && existingFiles.length > 0) {
			// File already exists, use existing URL
		} else {
			const { error: uploadError } = await supabase.storage
				.from('vsd-bucket')
				.upload(storagePath, file);

			if (uploadError) {
				throw uploadError;
			}
		}

		// Get public URL
		const {
			data: { publicUrl },
		} = supabase.storage.from('vsd-bucket').getPublicUrl(storagePath);

		if (!publicUrl) {
			throw new Error('Failed to get public URL');
		}

		return publicUrl;
	} catch (error) {
		console.error(`Error uploading shared sound ${soundId}:`, error);
		throw error;
	}
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<{
		message: string;
		sounds?: number;
		keys?: number;
		error?: string;
		details?: string;
	}>,
) {
	// Only allow POST requests
	if (req.method !== 'POST') {
		return res.status(405).json({ message: 'Method not allowed' });
	}

	try {
		// Get the user ID from the request (you might get this from auth in a real scenario)
		const { userId } = req.body;

		if (!userId) {
			return res.status(400).json({ message: 'User ID is required' });
		}

		// Local example sound files paths
		const soundExamplesPath = path.join(process.cwd(), 'sound-examples');

		// Specific GUIDs for each example sound
		const soundIds = {
			glassBreak: '8cfc46ad-4b46-44a6-b98d-0c9fa6c3ac3a',
			cinematicHit: '8c588344-aef5-4c67-a03e-071af8441f69',
			policeSiren: 'cdabf94a-0b1c-4cf1-8ab9-5ed7c6ebbda9',
		};

		// Check which files already exist in storage
		const existingFiles = await Promise.all([
			fileExistsInStorage(`shared/${soundIds.glassBreak}.mp3`),
			fileExistsInStorage(`shared/${soundIds.cinematicHit}.mp3`),
			fileExistsInStorage(`shared/${soundIds.policeSiren}.mp3`),
		]);

		// If at least one file exists in shared, terminate the process
		const anyFileExists = existingFiles.some((exists) => exists);
		if (anyFileExists) {
			return res.status(200).json({
				message: 'Process terminated: example files already exist in storage',
			});
		}

		const glassBreakUrl = await uploadSharedSound(
			soundIds.glassBreak,
			path.join(soundExamplesPath, 'glass-break.mp3'),
		);
		const cinematicHitUrl = await uploadSharedSound(
			soundIds.cinematicHit,
			path.join(soundExamplesPath, 'cinematic-hit-3.mp3'),
		);
		const policeSirenUrl = await uploadSharedSound(
			soundIds.policeSiren,
			path.join(soundExamplesPath, 'police-sirens.mp3'),
		);

		const soundsToInsert = [
			{
				id: soundIds.glassBreak,
				user_id: userId,
				name: 'Glass Break',
				url: glassBreakUrl,
				duration: 3.5,
			},
			{
				id: soundIds.cinematicHit,
				user_id: userId,
				name: 'Cinematic Hit 3',
				url: cinematicHitUrl,
				duration: 2.8,
			},
			{
				id: soundIds.policeSiren,
				user_id: userId,
				name: 'Police Siren',
				url: policeSirenUrl,
				duration: 1.2,
			},
		];

		if (soundsToInsert.length > 0) {
			const { error: soundError } = await supabase
				.from('sounds')
				.insert(soundsToInsert)
				.select();

			if (soundError) throw soundError;
		}

		const keysToInsert = [
			{
				id: crypto.randomUUID(),
				user_id: userId,
				sound_id: soundIds.glassBreak,
				position: 1,
				label: 'Glass Break',
				color: '#FF5733',
				icon: 'sound effect',
				hotkey: 'ctrl+1',
			},
			{
				id: crypto.randomUUID(),
				user_id: userId,
				sound_id: soundIds.cinematicHit,
				position: 2,
				label: 'Cinematic Hit 3',
				color: '#33FF57',
				icon: 'sound effect',
				hotkey: 'ctrl+2',
			},
			{
				id: crypto.randomUUID(),
				user_id: userId,
				sound_id: soundIds.policeSiren,
				position: 3,
				label: 'Police Siren',
				color: '#3357FF',
				icon: 'alarm',
				hotkey: 'ctrl+3',
			},
		];

		if (keysToInsert.length > 0) {
			const { error: keyError } = await supabase
				.from('stream_deck_keys')
				.insert(keysToInsert)
				.select();

			if (keyError) throw keyError;
		}

		return res.status(200).json({
			message:
				'Stream deck successfully configured: 3 sounds and 3 keys created',
		});
	} catch (error) {
		return res.status(500).json({
			message: 'Failed to setup stream deck',
			error: (error as Error).message,
		});
	}
}
