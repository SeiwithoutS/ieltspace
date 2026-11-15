import type { AttemptSummary } from "./AttemptConfirmation";

export type AttemptMode = "practice" | "real";
export type Skill = "reading" | "listening" | "writing" | "speaking";
export type ReadingTool = "cursor" | "highlight";
export interface HighlightNote {
  color: string;
  note: string;
  on: boolean;
}
export type HighlightId = "h1" | "h2" | "h3";

/** Persisted UI state. Keys also accept drafts saved before the TSX migration. */
export interface AttemptState {
  ans?: Record<number, string>;
  flag?: number[];
  current?: number;
  fontPct?: number;
  dark?: boolean;
  congCu?: ReadingTool;
  panelOpen?: boolean;
  split?: number;
  hl?: Record<HighlightId, HighlightNote>;
  active?: HighlightId | null;
  pop?: HighlightId | null;
  texts?: Record<number, string>;
  notes?: Record<number, string>;
  task?: number;
  sel?: string;
  playing?: boolean;
  pos?: number;
  speed?: string;
  vol?: number;
}
export interface Snapshot {
  state: AttemptState | undefined;
  model: AttemptSummary | null;
}
export interface ScreenProps {
  initialState?: AttemptState;
  timeText?: string;
  task?: number | string;
  selectedParts?: number[];
  cheDo?: string;
  onExit?: () => void;
  onSubmit?: () => void;
  onSnapshot?: (snapshot: Snapshot) => void;
  accent?: string;
  coChu?: number;
  toi?: boolean;
  dangHinh?: boolean;
  congCu?: ReadingTool;
  cotHighlight?: boolean;
  hienPopover?: boolean;
  trongHighlight?: boolean;
}
export interface ProgressGroup {
  label: string;
  from: number;
  to: number;
  answered: number[];
  flagged: number[];
}
