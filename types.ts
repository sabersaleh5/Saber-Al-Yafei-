
export type MediaItem = {
  id: string;
  type: 'image';
  url: string;
  prompt: string;
  timestamp: number;
};

export enum StudioMode {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '3:4' | '4:3';
