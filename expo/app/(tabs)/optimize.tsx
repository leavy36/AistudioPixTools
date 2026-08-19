import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import PickerZone from "@/components/PickerZone";
import ResultList from "@/components/ResultList";
import { Card, Chip, FieldLabel, GradientButton, MutedText, NumberField, ScreenTitle } from "@/components/ui";
import theme from "@/constants/colors";
import { SHRINK_PRESETS, ShrinkPresetId } from "@/constants/presets";
import {
  autoFormat,
  baseName,
  extFor,
  OutputFormat,
  PickedImage,
  ProcessedImage,
  smartShrink,
  webpSupported,
} from "@/lib/image-tools";
import { StrKey } from "@/lib/i18n";
import { useSettings } from "@/providers/settings-provider";

const PRESET_LABEL_KEYS: Record<ShrinkPresetId, StrKey> = {
  visually: "preVisually",
  email: "preEmail",
  msg: "preMsg",
  web: "preWeb",
  thumb: "preThumb",
  custom: "preCustom",
};

type FormatChoice = "auto" | OutputFormat;

export default function OptimizeScreen() {
  const { t } = useSettings();
  const [files, setFiles] = useState<PickedImage[]>([]);
  const [presetId, setPresetId] = useState<ShrinkPresetId>("visually");
  const [formatChoice, setFormatChoice] = useState<FormatChoice>("auto");
  const [qualityStr, setQualityStr] = useState<string>("85");
  const [maxWidthStr, setMaxWidthStr] = useState<string>("0");
  const [targetKBStr, setTargetKBStr] = useState<string>("0");
  const [busy, setBusy] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [results, setResults] = useState<ProcessedImage[]>([]);

  const applyPreset = useCallback((id: ShrinkPresetId) => {
    setPresetId(id);
    const p = SHRINK_PRESETS.find((x) => x.id === id);
    if (p && id !== "custom") {
      setQualityStr(String(Math.round(p.quality * 100)));
      setMaxWidthStr(String(p.maxWidth));
      setTargetKBStr(String(p.targetKB));
      setFormatChoice("auto");
    }
  }, []);

  const formatChoices: FormatChoice[] = webpSupported()
    ? ["auto", "webp", "jpeg", "png"]
    : ["auto", "jpeg", "png"];

  const shrinkAll = useCallback(async () => {
    if (files.length === 0) {
      setStatus(t("noFile"));
      return;
    }
    setBusy(true);
    setStatus(t("working"));
    setSummary("");
    setResults([]);
    try {
      const quality = Math.min(1, Math.max(0.1, (parseInt(qualityStr, 10) || 85) / 100));
      const maxWidth = Math.max(0, parseInt(maxWidthStr, 10) || 0);
      const targetKB = Math.max(0, parseInt(targetKBStr, 10) || 0);
      const format: OutputFormat = formatChoice === "auto" ? autoFormat() : formatChoice;

      const out: ProcessedImage[] = [];
      let sumBefore = 0;
      let sumAfter = 0;
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        setStatus(`${t("working")} ${i + 1}/${files.length}`);
        const shrunk = await smartShrink(file.uri, file.width, file.height, {
          quality,
          maxWidth,
          targetKB,
          format,
        });
        sumBefore += file.fileSize ?? 0;
        sumAfter += shrunk.sizeBytes;
        out.push({
          id: `${Date.now()}-${i}`,
          name: `${baseName(file.fileName)}-shrunk.${extFor(format)}`,
          uri: shrunk.uri,
          width: shrunk.width,
          height: shrunk.height,
          sizeBytes: shrunk.sizeBytes,
          originalSizeBytes: file.fileSize,
        });
      }
      setResults(out);
      setStatus(t("done"));
      if (sumBefore > 0 && sumAfter > 0) {
        const pct = ((1 - sumAfter / sumBefore) * 100).toFixed(1);
        const ratio = (sumBefore / sumAfter).toFixed(1);
        setSummary(
          `${Math.round(sumBefore / 1024)} KB → ${Math.round(sumAfter / 1024)} KB · ${pct}% ${t("savedPct")} · ×${ratio} ${t("lighter")}`,
        );
      }
    } catch (e) {
      console.log("Shrink failed", e);
      setStatus(`${t("error")}: ${e instanceof Error ? e.message : "unknown"}`);
    } finally {
      setBusy(false);
    }
  }, [files, qualityStr, maxWidthStr, targetKBStr, formatChoice, t]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Card>
        <ScreenTitle>🗜️ Smart Shrink</ScreenTitle>
        <MutedText>{t("optimizeDesc")}</MutedText>

        <PickerZone files={files} onFiles={setFiles} testID="optimize-picker" />

        <View style={styles.section}>
          <FieldLabel>{t("preset")}</FieldLabel>
          <View style={styles.chipRow}>
            {SHRINK_PRESETS.map((p) => (
              <Chip
                key={p.id}
                label={t(PRESET_LABEL_KEYS[p.id])}
                active={presetId === p.id}
                onPress={() => applyPreset(p.id)}
                testID={`shrink-${p.id}`}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <FieldLabel>{t("format")}</FieldLabel>
          <View style={styles.chipRow}>
            {formatChoices.map((f) => (
              <Chip
                key={f}
                label={f === "auto" ? t("auto") : f === "jpeg" ? "JPEG" : f.toUpperCase()}
                active={formatChoice === f}
                onPress={() => setFormatChoice(f)}
              />
            ))}
          </View>
        </View>

        <View style={styles.customRow}>
          <NumberField label={`${t("quality")} %`} value={qualityStr} onChange={(v) => { setQualityStr(v); setPresetId("custom"); }} testID="shrink-quality" />
          <NumberField label={t("maxWidth")} value={maxWidthStr} onChange={(v) => { setMaxWidthStr(v); setPresetId("custom"); }} testID="shrink-maxwidth" />
        </View>
        <View style={styles.customRow}>
          <NumberField label={t("targetKB")} value={targetKBStr} onChange={(v) => { setTargetKBStr(v); setPresetId("custom"); }} testID="shrink-target" />
        </View>

        <View style={styles.actions}>
          <GradientButton
            label={t("shrinkBtn")}
            onPress={shrinkAll}
            busy={busy}
            disabled={files.length === 0}
            testID="shrink-btn"
          />
        </View>

        {status.length > 0 && <Text style={styles.status}>{status}</Text>}
        {summary.length > 0 && (
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        )}
      </Card>

      <ResultList results={results} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginTop: 16,
  },
  chipRow: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
  },
  customRow: {
    flexDirection: "row" as const,
    gap: 10,
    marginTop: 12,
  },
  actions: {
    marginTop: 18,
  },
  status: {
    color: theme.muted,
    fontSize: 13,
    marginTop: 12,
  },
  summaryBox: {
    marginTop: 10,
    backgroundColor: theme.panel2,
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 10,
    padding: 12,
  },
  summaryText: {
    color: theme.ok,
    fontWeight: "700" as const,
    fontSize: 13,
    textAlign: "center" as const,
  },
});
