import type { SampleDocumentV1 } from "./sample-types";

export type SampleMediaRef =
  NonNullable<SampleDocumentV1["cover"]>;

export type SampleAssetKind =
  | "cover"
  | "prompt-image"
  | "audio";

export type SampleMediaScope = "admin" | "public";

export interface SampleAssetUrlResponse {
  url: string;
  expiresAt: string;
}
