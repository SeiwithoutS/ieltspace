import type { AttemptSummary } from "./AttemptConfirmation";
import type { SpeakingPhase } from "../../lib/attempts/speaking-flow";
import type { FinishOutcome, FinishReason } from "../../lib/attempts/finish-flow";

export type AttemptMode = "practice" | "real";
export type Skill = "reading" | "listening" | "writing" | "speaking";
export type ReadingTool = "cursor" | "highlight";
export interface HighlightNote {
  color: string;
  note: string;
  on: boolean;
}
export type HighlightId = "h1" | "h2" | "h3";

/** Tiến độ bài Speaking để vào lại bài (bản ghi nằm trong IndexedDB, không nằm ở đây). */
export interface SpeakingProgress {
  /** Mã lượt làm, một phần khóa bản ghi trong IndexedDB. */
  attemptId: string;
  /** Câu đang làm ("" khi đã hết câu). */
  stepId: string;
  index: number;
  phase: SpeakingPhase;
  /** Các câu đã có bản ghi lúc lưu. */
  answered: string[];
  /** Mã lượt làm trên máy chủ (đã tạo được); chưa có thì tạo lại bằng attemptId (idempotent). */
  serverAttemptId?: string;
}

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
  speaking?: SpeakingProgress;
}
export interface Snapshot {
  state: AttemptState | undefined;
  model: AttemptSummary | null;
  /**
   * Chờ các tác vụ lưu dở của trang (vd bản ghi âm) xong trước khi lưu và thoát.
   * `seal`: kết thúc bài, từ đây không nhận thêm bản ghi mới (tránh bản ghi mồ côi sau khi dọn).
   */
  flush?: (options?: { seal?: boolean }) => Promise<void>;
  /** false khi bản ghi chỉ còn trong bộ nhớ (IndexedDB lỗi) và sẽ mất nếu thoát. */
  persistent?: () => boolean;
  /**
   * Speaking: tải hết bản ghi còn lại rồi chốt lượt làm trên máy chủ. Chỉ khi trả
   * `completed` mới được dọn dữ liệu trên máy.
   */
  complete?: (input: {
    elapsedSeconds: number;
    reason: FinishReason;
  }) => Promise<
    | (FinishOutcome & { answered: number })
    /** Bài làm thử với đề mẫu: chỉ làm cục bộ, không có lượt trên máy chủ. */
    | { status: "local"; answered: number }
  >;
  /** Speaking, "Không lưu": xóa lượt trên máy chủ (lỗi mạng thì xếp hàng xóa sau). */
  cancel?: () => Promise<void>;
}
export interface ScreenProps {
  initialState?: AttemptState;
  timeText?: string;
  timeWarn?: boolean;
  /** Đồng hồ đếm ngược (có giới hạn thời gian). */
  countdown?: boolean;
  /** Hết giờ: trang làm bài dừng mọi thao tác, giữ phần đang làm dở. */
  timeExpired?: boolean;
  /**
   * Trang tự báo khi thật sự bắt đầu (Speaking: sau khi kiểm tra micro). Trước
   * đó đồng hồ chưa chạy. Trang không dùng thì đồng hồ chạy ngay như cũ.
   */
  onBegin?: () => void;
  /** Mức thời gian đã chọn (phút, 0 là không giới hạn). */
  limitMinutes?: number;
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
