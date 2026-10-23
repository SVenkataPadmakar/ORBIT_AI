export interface ChapterPreviewState {
  headline: string;
  details: string[];
  metrics?: { label: string; value: string; trend?: string }[];
  terminalLogs?: string[];
  codePreview?: {
    title: string;
    language: string;
    code: string;
  };
}

export interface DemoChapter {
  id: string;
  number: number;
  title: string;
  timestamp: number; // in seconds
  duration: number; // in seconds
  description: string;
  narration: string;
  agentName: string;
  agentColor: string;
  stageBadge: string;
  previewState: ChapterPreviewState;
}

export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isFullscreen: boolean;
  activeChapterIndex: number;
  captionsEnabled: boolean;
  mode: "video" | "interactive";
}
