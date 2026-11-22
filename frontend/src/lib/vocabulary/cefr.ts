export const cefrTags = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export type CefrTag = (typeof cefrTags)[number];

export function isCefrTag(value: string): value is CefrTag {
  return cefrTags.some(tag => tag === value);
}

export function cefrRank(tag?: CefrTag): number {
  const rank = tag ? cefrTags.indexOf(tag) : -1;
  return rank === -1 ? cefrTags.length : rank;
}
