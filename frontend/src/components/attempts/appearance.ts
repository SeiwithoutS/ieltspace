import type { ScreenProps, AttemptState } from "./types";
/** Foreground used on the learner's selected accent color. */
export function accentForeground(color: string) {
  const hex = color.replace("#", "");
  const expanded =
    hex.length === 3 ? [...hex].map((digit) => digit + digit).join("") : hex;
  const rgb = Number.parseInt(expanded, 16);
  const brightness =
    (0.299 * ((rgb >> 16) & 255) +
      0.587 * ((rgb >> 8) & 255) +
      0.114 * (rgb & 255)) /
    255;
  return brightness > 0.6 ? "#1A1A1A" : "#FFFFFF";
}

export const highlightColors = [
  {
    id: "vang",
    name: "Vàng",
    fill: "#FCE8A6",
    dark: "#5C4A14",
    dot: "#E0B323",
  },
  {
    id: "xanhla",
    name: "Xanh lá",
    fill: "#CDEBD5",
    dark: "#234A33",
    dot: "#3E9A63",
  },
  {
    id: "xanhduong",
    name: "Xanh dương",
    fill: "#D3E2FB",
    dark: "#24395E",
    dot: "#3B6FD8",
  },
  {
    id: "hong",
    name: "Hồng",
    fill: "#F9D5DE",
    dark: "#5A2735",
    dot: "#D2577A",
  },
  {
    id: "tim",
    name: "Tím",
    fill: "#E2DAF8",
    dark: "#3B3166",
    dot: "#7A63D1",
  },
];

export const attemptFontSizes: Record<number, number> = {
  90: 14,
  100: 15,
  110: 16,
  120: 18,
  130: 20,
  140: 21,
  150: 22,
};

export function attemptAppearance(props: ScreenProps, state: AttemptState) {
  const fontPct = state.fontPct ?? Number(props.coChu ?? 100);
  return {
    fontPct,
    fs: attemptFontSizes[fontPct] ?? 15,
    dark: state.dark ?? !!props.toi,
    accent: props.accent || "#2963CC",
  };
}
