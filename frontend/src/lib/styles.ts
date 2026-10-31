import type { CSSProperties } from "react";
import palette from "./dark-palette.json";
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
export function styleOf(value: string): CSSProperties {
  const css = cssText(value || "");
  if (cache.has(css)) return cache.get(css)!;
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
    style[key] = declaration.getPropertyValue(k);
  }
  if (document.documentElement.classList.contains("dark")) {
    const bg = style.backgroundColor || style.background;
    if (bg && /^#[a-f0-9]{6}$/i.test(bg)) {
      const n = parseInt(bg.slice(1), 16);
      const light =
        (((n >> 16) & 255) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) /
        1000;
      if (light > 180 && style.color) style.color = "#202125";
    }
  }
  cache.set(css, style);
  return style;
}
