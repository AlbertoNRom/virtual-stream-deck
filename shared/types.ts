export interface Sound {
  id: string;
  user_id: string;
  name: string;
  url: string;
  duration: number;
  created_at: string;
}

export interface StreamDeckKey {
  id: string;
  user_id: string;
  sound_id: string | null;
  position: number;
  label: string | null;
  color: string;
  icon: string | null;
  hotkey: string | null;
  created_at: string;
}

export interface GridConfig {
  rows: number;
  columns: number;
}