import type { SoundId, UserId } from '../../../sounds/domain/entities/Sound';

export type KeyId = string;

export class StreamDeckKey {
  readonly id: KeyId;
  readonly userId: UserId;
  readonly soundId: SoundId | null;
  readonly position: number;
  readonly label: string | null;
  readonly color: string;
  readonly icon: string | null;
  readonly hotkey: string | null;
  readonly createdAt: Date;

  private constructor(params: {
    id: KeyId;
    userId: UserId;
    soundId?: SoundId | null;
    position: number;
    label?: string | null;
    color?: string;
    icon?: string | null;
    hotkey?: string | null;
    createdAt?: Date;
  }) {
    this.id = params.id;
    this.userId = params.userId;
    this.soundId = params.soundId ?? null;
    if (params.position < 0) throw new Error('Position must be >= 0');
    this.position = params.position;
    this.label = params.label ?? null;
    this.color = params.color ?? '#00ffff';
    this.icon = params.icon ?? null;
    this.hotkey = params.hotkey ?? null;
    this.createdAt = params.createdAt ?? new Date();

    Object.freeze(this);
  }

  static create(params: {
    id: KeyId;
    userId: UserId;
    soundId?: SoundId | null;
    position: number;
    label?: string | null;
    color?: string;
    icon?: string | null;
    hotkey?: string | null;
    createdAt?: Date;
  }) {
    return new StreamDeckKey(params);
  }
}