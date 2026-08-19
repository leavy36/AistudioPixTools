/**
 * PixTools i18n — English and French are fully translated (like the source app),
 * the other 10 languages fall back to English.
 */
export type LangCode =
  | "en"
  | "fr"
  | "es"
  | "de"
  | "it"
  | "pt"
  | "ar"
  | "zh"
  | "ja"
  | "ko"
  | "ru"
  | "hi";

export const LANGUAGES: { code: LangCode; name: string }[] = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "pt", name: "Português" },
  { code: "ar", name: "العربية" },
  { code: "zh", name: "中文" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "ru", name: "Русский" },
  { code: "hi", name: "हिन्दी" },
];

interface Entry {
  en: string;
  fr: string;
}

const STRINGS = {
  tabConvert: { en: "Convert", fr: "Convertir" },
  tabResize: { en: "Resize", fr: "Redimensionner" },
  tabOptimize: { en: "Optimize", fr: "Optimiser" },
  tabAbout: { en: "About", fr: "À propos" },
  localBadge: { en: "100% local", fr: "100% local" },

  modeHeic: { en: "HEIC → JPG/PNG", fr: "HEIC → JPG/PNG" },
  modeUniversal: { en: "PNG · JPG · WebP", fr: "PNG · JPG · WebP" },
  heicDesc: {
    en: "Convert Apple HEIC/HEIF photos (iPhone default) into standard JPG or PNG. 100% on-device.",
    fr: "Convertissez vos photos Apple HEIC/HEIF (format iPhone) en JPG ou PNG standard. 100% sur l'appareil.",
  },
  universalDesc: {
    en: "Convert any PNG · JPG · WebP image to any of the three formats. 100% on-device.",
    fr: "Convertissez toute image PNG · JPG · WebP vers l'un des trois formats. 100% sur l'appareil.",
  },
  tapToPick: { en: "Tap to choose image(s)", fr: "Touchez pour choisir des image(s)" },
  upToFiles: { en: "Up to {n} images per batch", fr: "Jusqu'à {n} images par lot" },
  filesLoaded: { en: "{n} file(s) loaded", fr: "{n} fichier(s) chargé(s)" },
  noFile: { en: "No file loaded", fr: "Aucun fichier" },
  working: { en: "Working…", fr: "Traitement…" },
  done: { en: "Done", fr: "Terminé" },
  error: { en: "Error", fr: "Erreur" },
  output: { en: "Output format", fr: "Format de sortie" },
  quality: { en: "Quality", fr: "Qualité" },
  convertBtn: { en: "Convert", fr: "Convertir" },
  resizeBtn: { en: "Resize", fr: "Redimensionner" },
  shrinkBtn: { en: "Shrink", fr: "Compresser" },
  results: { en: "Results", fr: "Résultats" },
  clear: { en: "Clear", fr: "Effacer" },
  saveAll: { en: "Save all to Photos", fr: "Tout enregistrer dans Photos" },
  save: { en: "Save", fr: "Enregistrer" },
  saved: { en: "Saved ✓", fr: "Enregistré ✓" },
  share: { en: "Share", fr: "Partager" },
  permissionDenied: {
    en: "Photos permission is required to save images.",
    fr: "L'autorisation Photos est requise pour enregistrer les images.",
  },

  resizeDesc: {
    en: "Convert PNG/JPEG to platform-ready sizes. Presets match the official 2025-2026 specs. 100% on-device.",
    fr: "Convertissez vos PNG/JPEG aux tailles officielles des plateformes. Presets conformes aux specs 2025-2026. 100% sur l'appareil.",
  },
  preset: { en: "Preset", fr: "Preset" },
  custom: { en: "Custom", fr: "Personnalisé" },
  width: { en: "Width", fr: "Largeur" },
  height: { en: "Height", fr: "Hauteur" },
  fitMode: { en: "Fit mode", fr: "Mode d'ajustement" },
  fitCover: { en: "Cover (crop)", fr: "Cover (recadrer)" },
  fitContain: { en: "Contain (fit inside)", fr: "Contain (ajuster)" },
  fitStretch: { en: "Stretch", fr: "Étirer" },

  optimizeDesc: {
    en: "Reduce image weight for email, forms and messaging — usually 5-10× lighter, visually identical. Pick a preset or a target size.",
    fr: "Réduisez le poids de vos images pour email, formulaires et messageries — souvent 5-10× plus légères, visuellement identiques. Choisissez un preset ou une taille cible.",
  },
  preVisually: {
    en: "Visually identical (recommended)",
    fr: "Visuellement identique (recommandé)",
  },
  preEmail: { en: "Email friendly (≤ 500 KB)", fr: "Email (≤ 500 Ko)" },
  preMsg: { en: "Messaging (≤ 200 KB)", fr: "Messagerie (≤ 200 Ko)" },
  preWeb: { en: "Web / blog", fr: "Web / blog" },
  preThumb: { en: "Thumbnail", fr: "Miniature" },
  preCustom: { en: "Custom", fr: "Personnalisé" },
  format: { en: "Format", fr: "Format" },
  auto: { en: "Auto", fr: "Auto" },
  maxWidth: { en: "Max width (px, 0 = keep)", fr: "Largeur max (px, 0 = garder)" },
  targetKB: { en: "Target size (KB, 0 = off)", fr: "Taille cible (Ko, 0 = off)" },
  savedPct: { en: "saved", fr: "économisés" },
  lighter: { en: "lighter", fr: "plus léger" },

  aboutText: {
    en: "PixTools is a lightweight image toolkit that runs 100% on your device. No server, no upload, no tracking, no cost.",
    fr: "PixTools est une boîte à outils d'images légère qui fonctionne 100% sur votre appareil. Pas de serveur, pas d'envoi, pas de tracking, gratuit.",
  },
  modConvertDesc: {
    en: "HEIC → JPG/PNG (iPhone photos) · Universal PNG/JPG/WebP converter",
    fr: "HEIC → JPG/PNG (photos iPhone) · Convertisseur universel PNG/JPG/WebP",
  },
  modResizeDesc: {
    en: "Icon & Banner presets for YouTube, Instagram, TikTok, X, Facebook, LinkedIn, Pinterest, PWA…",
    fr: "Presets Icône & Bannière pour YouTube, Instagram, TikTok, X, Facebook, LinkedIn, Pinterest, PWA…",
  },
  modOptimizeDesc: {
    en: "Smart Shrink — auto-tune quality & size to hit an email-friendly weight, 5-10× lighter",
    fr: "Smart Shrink — ajuste automatiquement qualité et taille pour un poids compatible email, 5-10× plus léger",
  },
  privacyTitle: { en: "Privacy & cost", fr: "Confidentialité & coût" },
  priv1: {
    en: "0 byte uploaded — files never leave your device",
    fr: "0 octet envoyé — vos fichiers ne quittent jamais votre appareil",
  },
  priv2: { en: "No tracking, no analytics, no cookies", fr: "Pas de tracking, pas d'analytics, pas de cookies" },
  priv3: {
    en: "Batches capped at {n} files to stay fast",
    fr: "Lots limités à {n} fichiers pour rester rapide",
  },
  language: { en: "Language", fr: "Langue" },
  version: { en: "v3.0 · Mobile edition", fr: "v3.0 · Édition mobile" },
} satisfies Record<string, Entry>;

export type StrKey = keyof typeof STRINGS;

export function translate(key: StrKey, lang: LangCode, vars?: Record<string, string | number>): string {
  const entry: Entry = STRINGS[key];
  let text = lang === "fr" ? entry.fr : entry.en;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}
