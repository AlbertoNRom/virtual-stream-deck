
// pages/api/insert-stream-deck-keys.js
import { env } from '@/env';
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next/types';

// Initialize Supabase client

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY,);

export default async function handler(req: NextApiRequest, res: NextApiResponse<{message: string, sounds?: number, keys?: number, error?: string, details?: string}>) {
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

    // First, insert sample sounds
    const sampleSounds = [
      {
        user_id: userId,
        name: 'Glass Break',
        url: `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vsd-bucket/shared/8cfc46ad-4b46-44a6-b98d-0c9fa6c3ac3a.mp3`,
        duration: 3.5,
        tags: ['sound effect', 'impact'],
        category: 'effects'
      },
      {
        user_id: userId,
        name: 'Cinematic Hit 3',
        url: `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vsd-bucket/shared/8c588344-aef5-4c67-a03e-071af8441f69.mp3`,
        duration: 2.8,
        tags: ['sound effect', 'impact'],
        category: 'effects'
      },
      {
        user_id: userId,
        name: 'Police Siren',
        url: `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vsd-bucket/shared/cdabf94a-0b1c-4cf1-8ab9-5ed7c6ebbda9.mp3`,
        duration: 1.2,
        tags: ['alarm'],
        category: 'alerts'
      }
    ];
    // Insert sounds and get their IDs
    const { data: insertedSounds, error: soundError } = await supabase
      .from('sounds')
      .insert(sampleSounds)
      .select();

    if (soundError) throw soundError;

     // Then create stream deck keys linked to these sounds
     const streamDeckKeys = [
      {
        user_id: userId,
        sound_id: insertedSounds[0].id,
        position: 1,
        label: 'Glass Break',
        color: '#FF5733',
        icon: 'sound effect',
        hotkey: 'ctrl+1' // Already in lowercase
      },
      {
        user_id: userId,
        sound_id: insertedSounds[1].id, 
        position: 2,
        label: 'Cinematic Hit 3',
        color: '#33FF57',
        icon: 'sound effect',
        hotkey: 'ctrl+2' // Already in lowercase
      },
      {
        user_id: userId,
        sound_id: insertedSounds[2].id, 
        position: 3,
        label: 'Police Siren',
        color: '#3357FF',
        icon: 'alarm',
        hotkey: 'ctrl+3' // Already in lowercase
      }
    ];

    // Insert stream deck keys
    const { data: insertedKeys, error: keyError } = await supabase
      .from('stream_deck_keys')
      .insert(streamDeckKeys)
      .select();

    if (keyError) throw keyError;



    return res.status(200).json({
      message: 'Successfully setup stream deck with sounds',
      sounds: insertedSounds.length,
      keys: insertedKeys.length
    });


  } catch (error) {
    console.error('Error setting up stream deck:', error);
    return res.status(500).json({ 
      message: 'Failed to setup stream deck',
      error: (error as Error).message,
    });
  }
}