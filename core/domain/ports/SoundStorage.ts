export interface SoundStorage {
  removeByPublicUrl(publicUrl: string): Promise<void>;
  uploadAndGetPublicUrl(userId: string, file: File): Promise<string>;
}