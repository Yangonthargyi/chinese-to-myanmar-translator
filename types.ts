
export interface SubtitleEntry {
  id: number;
  startTime: string; // HH:MM:SS,mmm
  endTime: string;   // HH:MM:SS,mmm
  text: string;
}

export interface TranslationStatus {
  step: 'idle' | 'uploading' | 'analyzing' | 'translating' | 'generating' | 'completed' | 'error';
  progress: number;
  message: string;
}
