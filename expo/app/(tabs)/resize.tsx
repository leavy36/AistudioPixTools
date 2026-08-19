import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import PickerZone from "@/components/PickerZone";
import ResultList from "@/components/ResultList";
import { Card, Chip, FieldLabel, GradientButton, MutedText, NumberField, ScreenTitle } from "@/components/ui";
import theme from "@/constants/colors";
import { PRESET_GROUPS, RESIZE_PRESETS, ResizePreset } from "@/constants/presets";
import {
  baseName,
  extFor,
  FitMode,
  fitOps,
  getSizeBytes,
  OutputFormat,
  PickedImage,
  ProcessedImage,
  renderImage,
  webpSupported,
} from "@/lib/image-tools";
import { useSettings } from "@/providers/settings-provider";

const QUALITY_OPTIONS = [0.7, 0.8, 0.92, 1] as const;

export default function ResizeScreen() {
  const { t } = useSettings();
  const [files, setFiles] = useState<PickedImage[]>([]);
  const [group, setGroup] = useState<string>(PRESET_GROUPS[0]);
  const [preset, setPreset] = useState<ResizePreset | null>(RESIZE_PRESETS[0]);
  const [customW, setCustomW] = useState<string>("1280");
  const [customH, setCustomH] = useState<string>("720");
  const [fit, setFit] = useState<FitMode>("cover");
  const [format, setFormat] = useState<OutputFormat>("png");
  const [quality, setQuality] = useState<number>(0.92);
  const [busy, setBusy] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [results, setResults] = useState<ProcessedImage[]>([]);

  const groupPresets = useMemo(
    () => RESIZE_PRESETS.filter((p) => p.group === group),
    [group],
  );

  const isCustom = group === "__custom__";
  const targetW = isCustom ? Math.max(8, parseInt(customW, 10) || 0) : (preset?.width ?? 0);
  const targetH = isCustom ? Math.max(8, parseInt(customH, 10) || 0) : (preset?.height ?? 0);

  const formatOptions: OutputFormat[] = webpSupported() ? ["png", "jpeg", "webp"] : ["png", "jpeg"];

  const selectGroup = useCallback((g: string) => {
    setGroup(g);
    if (g !== "__custom__") {
      const first = RESIZE_PRESETS.find((p) => p.group === g);
      setPreset(first ?? null);
    }
  }, []);

  const resizeAll = useCallback(async () => {
    if (files.length === 0) {
      setStatus(t("noFile"));
      return;
    }
    if (targetW < 8 || targetH < 8) return;
    setBusy(true);
    setStatus(t("working"));
    setResults([]);
    try {
      const out: ProcessedImage[] = [];
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        setStatus(`${t("working")} ${i + 1}/${files.length}`);
        const ops = fitOps(file.width, file.height, targetW, targetH, fit);
        const saved = await renderImage(file.uri, ops, format, quality);
        const sizeBytes = await getSizeBytes(saved.uri);
        out.push({
          id: `${Date.now()}-${i}`,
          name: `${baseName(file.fileName)}-${saved.width}x${saved.height}.${extFor(format)}`,
          uri: saved.uri,
          width: saved.width,
          height: saved.height,
          sizeBytes,
          originalSizeBytes: file.fileSize,
        });
      }
      setResults(out);
      setStatus(t("done"));
    } catch (e) {
      console.log("Resize failed", e);
      setStatus(`${t("error")}: ${e instanceof Error ? e.message : "unknown"}`);
    } finally {
      setBusy(false);
    }
  }, [files, targetW, targetH, fit, format, quality, t]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Card>
        <ScreenTitle>🖼️ {t("tabResize")}</ScreenTitle>
        <MutedText>{t("resizeDesc")}</MutedText>

        <PickerZone files={files} onFiles={setFiles} testID="resize-picker" />

        <View style={styles.section}>
          <FieldLabel>{t("preset")}</FieldLabel>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {PRESET_GROUPS.map((g) => (
              <Chip key={g} label={g} active={group === g} onPress={() => selectGroup(g)} />
            ))}
            <Chip
              label={t("custom")}
              active={isCustom}
              onPress={() => selectGroup("__custom__")}
              testID="group-custom"
            />
          </ScrollView>
        </View>

        {!isCustom && (
          <View style={styles.presetList}>
            {groupPresets.map((p) => {
              const active = preset?.name === p.name && preset?.group === p.group;
              return (
                <Chip
                  key={`${p.group}-${p.name}`}
                  label={`${p.name} · ${p.width}×${p.height}`}
                  active={active}
                  onPress={() => setPreset(p)}
                />
              );
            })}
          </View>
        )}

        {isCustom && (
          <View style={styles.customRow}>
            <NumberField label={t("width")} value={customW} onChange={setCustomW} testID="custom-w" />
            <NumberField label={t("height")} value={customH} onChange={setCustomH} testID="custom-h" />
          </View>
        )}

        <View style={styles.section}>
          <FieldLabel>{t("fitMode")}</FieldLabel>
          <View style={styles.chipRow}>
            <Chip label={t("fitCover")} active={fit === "cover"} onPress={() => setFit("cover")} />
            <Chip label={t("fitContain")} active={fit === "contain"} onPress={() => setFit("contain")} />
            <Chip label={t("fitStretch")} active={fit === "stretch"} onPress={() => setFit("stretch")} />
          </View>
        </View>

        <View style={styles.section}>
          <FieldLabel>{t("output")}</FieldLabel>
          <View style={styles.chipRow}>
            {formatOptions.map((f) => (
              <Chip
                key={f}
                label={f === "jpeg" ? "JPEG" : f.toUpperCase()}
                active={format === f}
                onPress={() => setFormat(f)}
              />
            ))}
          </View>
        </View>

        {format !== "png" && (
          <View style={styles.section}>
            <FieldLabel>{t("quality")}</FieldLabel>
            <View style={styles.chipRow}>
              {QUALITY_OPTIONS.map((q) => (
                <Chip
                  key={q}
                  label={`${Math.round(q * 100)}%`}
                  active={quality === q}
                  onPress={() => setQuality(q)}
                />
              ))}
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <GradientButton
            label={`${t("resizeBtn")} → ${targetW}×${targetH}`}
            onPress={resizeAll}
            busy={busy}
            disabled={files.length === 0}
            testID="resize-btn"
          />
        </View>

        {status.length > 0 && <Text style={styles.status}>{status}</Text>}
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
  presetList: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    marginTop: 10,
  },
  customRow: {
    flexDirection: "row" as const,
    gap: 10,
    marginTop: 10,
  },
  actions: {
    marginTop: 18,
  },
  status: {
    color: theme.muted,
    fontSize: 13,
    marginTop: 12,
  },
});
