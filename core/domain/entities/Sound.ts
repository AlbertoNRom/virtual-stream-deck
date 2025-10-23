export type SoundId = string;
export type UserId = string;

export class Sound {
  readonly id: SoundId;
  readonly userId: UserId;
  readonly name: string;
  readonly url: string;
  readonly duration: number;
  readonly createdAt: Date;

  private constructor(params: {
    id: SoundId;
    userId: UserId;
    name: string;
    url: string;
    duration: number;
    createdAt?: Date;
  }) {
    this.id = params.id;
    this.userId = params.userId;
    this.name = params.name;
    this.url = params.url;
    if (params.duration <= 0) throw new Error("Duration must be > 0");
    this.duration = params.duration;
    this.createdAt = params.createdAt ?? new Date();
  }

  static create(params: {
    id: SoundId;
    userId: UserId;
    name: string;
    url: string;
    duration: number;
    createdAt?: Date;
  }) {
    return new Sound(params);
  }
}