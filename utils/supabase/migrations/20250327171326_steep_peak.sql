/*
  # Sound Management Schema

  1. New Tables
    - `sounds`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `url` (text)
      - `duration` (float)
      - `created_at` (timestamp)
      - `tags` (text array)
      - `category` (text)
    
    - `stream_deck_keys`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `sound_id` (uuid, references sounds)
      - `position` (integer)
      - `label` (text)
      - `color` (text)
      - `icon` (text)
      - `hotkey` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create sounds table
CREATE TABLE IF NOT EXISTS sounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  url text NOT NULL,
  duration float NOT NULL,
  created_at timestamptz DEFAULT now(),
  tags text[] DEFAULT '{}',
  category text,
  CONSTRAINT valid_duration CHECK (duration > 0)
);

-- Create stream deck keys table
CREATE TABLE IF NOT EXISTS stream_deck_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  sound_id uuid REFERENCES sounds ON DELETE CASCADE,
  position integer NOT NULL,
  label text,
  color text DEFAULT '#00ffff',
  icon text,
  hotkey text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_deck_keys ENABLE ROW LEVEL SECURITY;

-- Policies for sounds
CREATE POLICY "Users can manage their own sounds"
  ON sounds
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for stream deck keys
CREATE POLICY "Users can manage their own stream deck keys"
  ON stream_deck_keys
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);