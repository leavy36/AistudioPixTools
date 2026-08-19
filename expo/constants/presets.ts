/** Resize presets — matches the 2025-2026 official platform specs from the source app. */
export interface ResizePreset {
  group: string;
  name: string;
  width: number;
  height: number;
}

export const RESIZE_PRESETS: ResizePreset[] = [
  { group: "YouTube", name: "Thumbnail (16:9)", width: 1280, height: 720 },
  { group: "YouTube", name: "Channel banner (16:9)", width: 2560, height: 1440 },
  { group: "YouTube", name: "Shorts / Vertical (9:16)", width: 1080, height: 1920 },
  { group: "YouTube", name: "Profile picture", width: 800, height: 800 },
  { group: "Instagram", name: "Square post (1:1)", width: 1080, height: 1080 },
  { group: "Instagram", name: "Portrait post (4:5)", width: 1080, height: 1350 },
  { group: "Instagram", name: "Story / Reel (9:16)", width: 1080, height: 1920 },
  { group: "TikTok", name: "Video / cover (9:16)", width: 1080, height: 1920 },
  { group: "X (Twitter)", name: "Post image (16:9)", width: 1600, height: 900 },
  { group: "X (Twitter)", name: "Header (3:1)", width: 1500, height: 500 },
  { group: "Facebook", name: "Post (1.91:1)", width: 1200, height: 630 },
  { group: "Facebook", name: "Cover", width: 851, height: 315 },
  { group: "LinkedIn", name: "Post (1.91:1)", width: 1200, height: 627 },
  { group: "LinkedIn", name: "Company banner", width: 1128, height: 191 },
  { group: "Pinterest", name: "Standard pin (2:3)", width: 1000, height: 1500 },
  { group: "Web / PWA", name: "Favicon 32×32", width: 32, height: 32 },
  { group: "Web / PWA", name: "Favicon 64×64", width: 64, height: 64 },
  { group: "Web / PWA", name: "Apple touch 180×180", width: 180, height: 180 },
  { group: "Web / PWA", name: "PWA icon 192×192", width: 192, height: 192 },
  { group: "Web / PWA", name: "PWA icon 512×512", width: 512, height: 512 },
  { group: "Web / PWA", name: "Open Graph (1.91:1)", width: 1200, height: 630 },
];

export const PRESET_GROUPS: string[] = [...new Set(RESIZE_PRESETS.map((p) => p.group))];

export type ShrinkPresetId = "visually" | "email" | "msg" | "web" | "thumb" | "custom";

export interface ShrinkPreset {
  id: ShrinkPresetId;
  quality: number;
  maxWidth: number;
  targetKB: number;
}

export const SHRINK_PRESETS: ShrinkPreset[] = [
  { id: "visually", quality: 0.85, maxWidth: 0, targetKB: 0 },
  { id: "email", quality: 0.82, maxWidth: 1920, targetKB: 500 },
  { id: "msg", quality: 0.78, maxWidth: 1600, targetKB: 200 },
  { id: "web", quality: 0.8, maxWidth: 1600, targetKB: 0 },
  { id: "thumb", quality: 0.75, maxWidth: 800, targetKB: 0 },
  { id: "custom", quality: 0.85, maxWidth: 0, targetKB: 0 },
];

export const BATCH_MAX = 15;
