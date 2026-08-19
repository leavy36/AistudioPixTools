import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

export type OutputFormat = "jpeg" | "png" | "webp";

export interface PickedImage {
  uri: string;
  width: number;
  height: number;
  fileName: string;
  fileSize?: number;
}

export interface ProcessedImage {
  id: string;
  name: string;
  uri: string;
  width: number;
  height: number;
  sizeBytes: number;
  originalSizeBytes?: number;
}

const FORMAT_MAP: Record<OutputFormat, SaveFormat> = {
  jpeg: SaveFormat.JPEG,
  png: SaveFormat.PNG,
  webp: SaveFormat.WEBP,
};

export function extFor(format: OutputFormat): string {
  return format === "jpeg" ? "jpg" : format;
}

export function baseName(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "");
}

/** WebP encoding is not supported on iOS — fall back to JPEG there. */
export function webpSupported(): boolean {
  return Platform.OS !== "ios";
}

export function autoFormat(): OutputFormat {
  return webpSupported() ? "webp" : "jpeg";
}

export async function getSizeBytes(uri: string): Promise<number> {
  try {
    if (Platform.OS === "web") {
      const res = await fetch(uri);
      const blob = await res.blob();
      return blob.size;
    }
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists && typeof info.size === "number") return info.size;
    return 0;
  } catch (e) {
    console.log("getSizeBytes failed", e);
    return 0;
  }
}

export type ManipOp =
  | { resize: { width?: number; height?: number } }
  | { crop: { originX: number; originY: number; width: number; height: number } };

export async function renderImage(
  uri: string,
  ops: ManipOp[],
  format: OutputFormat,
  quality: number,
): Promise<{ uri: string; width: number; height: number }> {
  const safeFormat: OutputFormat = format === "webp" && !webpSupported() ? "jpeg" : format;
  const context = ImageManipulator.manipulate(uri);
  for (const op of ops) {
    if ("resize" in op) {
      context.resize(op.resize);
    } else {
      context.crop(op.crop);
    }
  }
  const imageRef = await context.renderAsync();
  const saved = await imageRef.saveAsync({
    format: FORMAT_MAP[safeFormat],
    compress: quality,
  });
  return { uri: saved.uri, width: saved.width, height: saved.height };
}

export type FitMode = "cover" | "contain" | "stretch";

/** Compute the manipulation ops to fit a source image into target dims. */
export function fitOps(
  srcW: number,
  srcH: number,
  targetW: number,
  targetH: number,
  mode: FitMode,
): ManipOp[] {
  if (mode === "stretch") {
    return [{ resize: { width: targetW, height: targetH } }];
  }
  if (mode === "contain") {
    const scale = Math.min(targetW / srcW, targetH / srcH);
    return [
      {
        resize: {
          width: Math.max(1, Math.round(srcW * scale)),
          height: Math.max(1, Math.round(srcH * scale)),
        },
      },
    ];
  }
  const scale = Math.max(targetW / srcW, targetH / srcH);
  const rw = Math.max(targetW, Math.ceil(srcW * scale));
  const rh = Math.max(targetH, Math.ceil(srcH * scale));
  return [
    { resize: { width: rw, height: rh } },
    {
      crop: {
        originX: Math.max(0, Math.floor((rw - targetW) / 2)),
        originY: Math.max(0, Math.floor((rh - targetH) / 2)),
        width: targetW,
        height: targetH,
      },
    },
  ];
}

export interface ShrinkOptions {
  quality: number;
  maxWidth: number;
  targetKB: number;
  format: OutputFormat;
}

export interface ShrinkOutput {
  uri: string;
  width: number;
  height: number;
  sizeBytes: number;
  quality: number;
}

/**
 * Smart Shrink: resize to maxWidth, then iteratively lower quality
 * (and finally downscale) until the target file size is reached.
 */
export async function smartShrink(
  uri: string,
  srcW: number,
  srcH: number,
  opts: ShrinkOptions,
): Promise<ShrinkOutput> {
  const format: OutputFormat = opts.format === "webp" && !webpSupported() ? "jpeg" : opts.format;
  let quality = opts.quality;
  const baseOps: ManipOp[] =
    opts.maxWidth > 0 && srcW > opts.maxWidth ? [{ resize: { width: opts.maxWidth } }] : [];

  let saved = await renderImage(uri, baseOps, format, quality);
  let sizeBytes = await getSizeBytes(saved.uri);

  if (opts.targetKB > 0 && format !== "png" && sizeBytes > 0) {
    let tries = 0;
    while (sizeBytes / 1024 > opts.targetKB && quality > 0.35 && tries < 8) {
      quality = Math.max(0.35, quality - 0.08);
      saved = await renderImage(uri, baseOps, format, quality);
      sizeBytes = await getSizeBytes(saved.uri);
      tries += 1;
    }
    let curW = saved.width;
    let tries2 = 0;
    while (sizeBytes / 1024 > opts.targetKB && curW > 320 && tries2 < 6) {
      curW = Math.round(curW * 0.85);
      saved = await renderImage(uri, [{ resize: { width: curW } }], format, quality);
      sizeBytes = await getSizeBytes(saved.uri);
      tries2 += 1;
    }
  }

  return { uri: saved.uri, width: saved.width, height: saved.height, sizeBytes, quality };
}

/** Save a processed image: Photos library on native, browser download on web. */
export async function saveToDevice(uri: string, filename: string): Promise<boolean> {
  if (Platform.OS === "web") {
    const doc = (globalThis as unknown as { document?: { createElement: (tag: string) => { href: string; download: string; click: () => void } } }).document;
    if (doc) {
      const anchor = doc.createElement("a");
      anchor.href = uri;
      anchor.download = filename;
      anchor.click();
      return true;
    }
    return false;
  }
  const perm = await MediaLibrary.requestPermissionsAsync();
  if (!perm.granted) return false;
  await MediaLibrary.saveToLibraryAsync(uri);
  return true;
}

export async function shareImage(uri: string): Promise<void> {
  if (Platform.OS === "web") return;
  const available = await Sharing.isAvailableAsync();
  if (available) {
    await Sharing.shareAsync(uri);
  }
}

export function formatKB(bytes: number): string {
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
