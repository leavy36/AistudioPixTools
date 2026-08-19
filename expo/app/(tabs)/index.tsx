import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import PickerZone from "@/components/PickerZone";
import ResultList from "@/components/ResultList";
import { Card, Chip, FieldLabel, GradientButton, MutedText, ScreenTitle } from "@/components/ui";
import theme from "@/constants/colors";
import {
  baseName,
  extFor,
  getSizeBytes,
  OutputFormat,
  PickedImage,
  ProcessedImage,
  renderImage,
  webpSupported,
} from "@/lib/image-tools";
import { useSettings } from "@/providers/settings-provider";

type ConvertMode = "heic" | "universal";

const QUALITY_OPTIONS = [0.7, 0.8, 0.92, 1] as const;

export default function ConvertScreen() {
  const { t } = useSettings();
  const [mode, setMode] = useState<ConvertMode>("heic");
  const [files, setFiles] = useState<PickedImage[]>([]);
  const [format, setFormat] = useState<OutputFormat>("jpeg");
  const [quality, setQuality] = useState<number>(0.92);
  const [busy, setBusy] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [results, setResults] = useState<ProcessedImage[]>([]);

  const formatOptions: OutputFormat[] =
    mode === "heic"
      ? ["jpeg", "png"]
      : webpSupported()
        ? ["jpeg", "png", "webp"]
        : ["jpeg", "png"];

  const switchMode = useCallback((next: ConvertMode) => {
    setMode(next);
    setFormat("jpeg");
    setResults([]);
    setStatus("");
  }, []);

  const convertAll = useCallback(async () => {
    if (files.length === 0) {
      setStatus(t("noFile"));
      return;
    }
    setBusy(true);
    setStatus(t("working"));
    setResults([]);
    try {
      const out: ProcessedImage[] = [];
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        setStatus(`${t("working")} ${i + 1}/${files.length}`);
        const saved = await renderImage(file.uri, [], format, quality);
        const sizeBytes = await getSizeBytes(saved.uri);
        out.push({
          id: `${Date.now()}-${i}`,
          name: `${baseName(file.fileName)}.${extFor(format)}`,
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
      console.log("Convert failed", e);
      setStatus(`${t("error")}: ${e instanceof Error ? e.message : "unknown"}`);
    } finally {
      setBusy(false);
    }
  }, [files, format, quality, t]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.modeRow}>
        <Chip
          label={t("modeHeic")}
          active={mode === "heic"}
          onPress={() => switchMode("heic")}
          testID="mode-heic"
        />
        <Chip
          label={t("modeUniversal")}
          active={mode === "universal"}
          onPress={() => switchMode("universal")}
          testID="mode-universal"
        />
      </View>

      <Card>
        <ScreenTitle>{mode === "heic" ? `📱 ${t("modeHeic")}` : `🔁 ${t("modeUniversal")}`}</ScreenTitle>
        <MutedText>{mode === "heic" ? t("heicDesc") : t("universalDesc")}</MutedText>

        <PickerZone files={files} onFiles={setFiles} testID="convert-picker" />

        <View style={styles.section}>
          <FieldLabel>{t("output")}</FieldLabel>
          <View style={styles.chipRow}>
            {formatOptions.map((f) => (
              <Chip
                key={f}
                label={f === "jpeg" ? "JPEG" : f.toUpperCase()}
                active={format === f}
                onPress={() => setFormat(f)}
                testID={`format-${f}`}
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
                  testID={`quality-${q}`}
                />
              ))}
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <GradientButton
            label={t("convertBtn")}
            onPress={convertAll}
            busy={busy}
            disabled={files.length === 0}
            testID="convert-btn"
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
  modeRow: {
    flexDirection: "row" as const,
    marginBottom: 12,
  },
  section: {
    marginTop: 16,
  },
  chipRow: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
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
