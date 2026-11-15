import type { AttemptMode, AttemptState } from "../components/attempts/types";

export interface AttemptOptions {
  mode: AttemptMode;
  parts: number[];
}
export interface AttemptDraft {
  options: AttemptOptions;
  seconds: number;
  state?: AttemptState;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isTextMap(value: unknown): boolean {
  return (
    isObject(value) &&
    Object.entries(value).every(
      ([key, text]) => /^\d+$/.test(key) && typeof text === "string",
    )
  );
}
function isAttemptState(value: unknown): value is AttemptState {
  if (!isObject(value)) return false;
  const numbers = ["current", "fontPct", "split", "task", "pos", "vol"];
  if (
    numbers.some(
      (key) =>
        value[key] !== undefined &&
        (typeof value[key] !== "number" || !Number.isFinite(value[key])),
    )
  )
    return false;
  if (
    ["dark", "panelOpen", "playing"].some(
      (key) => value[key] !== undefined && typeof value[key] !== "boolean",
    )
  )
    return false;
  if (
    ["sel", "speed"].some(
      (key) => value[key] !== undefined && typeof value[key] !== "string",
    )
  )
    return false;
  if (
    ["ans", "texts", "notes"].some(
      (key) => value[key] !== undefined && !isTextMap(value[key]),
    )
  )
    return false;
  if (
    value.flag !== undefined &&
    (!Array.isArray(value.flag) ||
      !value.flag.every((n) => Number.isInteger(n) && n > 0))
  )
    return false;
  if (
    value.congCu !== undefined &&
    value.congCu !== "cursor" &&
    value.congCu !== "highlight"
  )
    return false;
  if (
    ["pop", "active"].some(
      (key) =>
        value[key] !== undefined &&
        value[key] !== null &&
        !["h1", "h2", "h3"].includes(String(value[key])),
    )
  )
    return false;
  if (value.hl !== undefined) {
    const highlights = value.hl;
    if (
      !isObject(highlights) ||
      !["h1", "h2", "h3"].every((key) => {
        const note = highlights[key];
        return (
          isObject(note) &&
          typeof note.color === "string" &&
          typeof note.note === "string" &&
          typeof note.on === "boolean"
        );
      })
    )
      return false;
  }
  return true;
}

/** Accept valid drafts from the previous JSX pages; malformed storage starts a fresh attempt. */
export function parseAttemptDraft(raw: string | null): AttemptDraft | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!isObject(value) || !isObject(value.options)) return null;
    const { mode, parts } = value.options;
    if (mode !== "real" && mode !== "practice") return null;
    if (
      !Array.isArray(parts) ||
      !parts.every((n) => Number.isInteger(n) && n >= 0)
    )
      return null;
    if (mode === "practice" && parts.length === 0) return null;
    if (
      typeof value.seconds !== "number" ||
      !Number.isFinite(value.seconds) ||
      value.seconds < 0
    )
      return null;
    if (value.state !== undefined && !isAttemptState(value.state)) return null;
    return {
      options: { mode, parts },
      seconds: value.seconds,
      state: value.state,
    };
  } catch {
    return null;
  }
}
