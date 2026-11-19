import type { CSSProperties } from "react";
import palette from "../../assets/theme/dark-palette.json";

export function getAccentColors(accent = "#2963CC") {
  const hex = accent.replace("#", "");
  const color = hex.length === 3
    ? hex.split("").map((digit) => digit + digit).join("")
    : hex;
  const value = parseInt(color, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  const brightness = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return { accent, onAccent: brightness > 0.6 ? "#1A1A1A" : "#FFFFFF" };
}

try {
  document.documentElement.classList.toggle(
    "dark",
    !!JSON.parse(localStorage.getItem("ieltspace-app") || "{}").dark,
  );
} catch {}
export function cssText(css: string): string {
  if (!document.documentElement.classList.contains("dark")) return css;
  return css.replace(
    /(^|[;{\s])([a-z-]+)(\s*:\s*)([^;{}]+)/g,
    (_, pre, prop, colon, value) => {
      const role = /^(background|accent-color)/.test(prop)
        ? "bg"
        : /^(border|outline)|shadow/.test(prop)
          ? "line"
          : "text";
      const colors = palette[role] as Record<string, string>;
      return (
        pre +
        prop +
        colon +
        value
          .replace(/#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b/g, (h: string) => {
            let k = h.toUpperCase();
            if (k.length === 4)
              k = "#" + k[1] + k[1] + k[2] + k[2] + k[3] + k[3];
            return (
              colors[k] ||
              (palette.text as Record<string, string>)[k] ||
              (palette.bg as Record<string, string>)[k] ||
              h
            );
          })
          .replace(
            /rgba\([^)]*\)/g,
            (s: string) => (palette.shadow as Record<string, string>)[s] || s,
          )
      );
    },
  );
}
const cache = new Map<string, CSSProperties>();

function brightness(color: string | undefined) {
  const rgb = color?.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if (!rgb) return 0;
  return (Number(rgb[1]) * 299 + Number(rgb[2]) * 587 + Number(rgb[3]) * 114) / 1000;
}

export function styleOf(value: string): CSSProperties {
  const dark = document.documentElement.classList.contains("dark");
  const css = cssText(value || "");
  const keyForCache = (dark ? "dark:" : "light:") + css;
  const cached = cache.get(keyForCache);
  if (cached) return cached;
  const declaration = document.createElement("div").style;
  declaration.cssText = css;
  const style: Record<string, string> = {};
  for (let i = 0; i < declaration.length; i++) {
    const k = declaration[i];
    const key = k.startsWith("--")
      ? k
      : k
          .replace(/^-ms-/, "ms-")
          .replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const raw = declaration.getPropertyValue(k);
    if (key === "fontFamily" && raw !== "inherit") {
      style[key] = /IBM Plex Serif|Georgia/i.test(raw) ? "var(--font-serif)" : "var(--font-sans)";
    } else {
      style[key] = raw;
    }
  }
  if (dark && brightness(style.backgroundColor || style.background) > 180 && brightness(style.color) > 145) {
    style.color = "#202125";
  }
  cache.set(keyForCache, style);
  return style;
}
