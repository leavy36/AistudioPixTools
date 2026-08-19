import { Share2, Download } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { Alert, Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import theme from "@/constants/colors";
import { GradientButton } from "@/components/ui";
import { formatKB, ProcessedImage, saveToDevice, shareImage } from "@/lib/image-tools";
import { useSettings } from "@/providers/settings-provider";

interface ResultListProps {
  results: ProcessedImage[];
}

export default function ResultList({ results }: ResultListProps) {
  const { t } = useSettings();
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});
  const [savingAll, setSavingAll] = useState<boolean>(false);

  const notifyPermission = useCallback(() => {
    if (Platform.OS === "web") return;
    Alert.alert(t("error"), t("permissionDenied"));
  }, [t]);

  const saveOne = useCallback(
    async (item: ProcessedImage) => {
      try {
        const ok = await saveToDevice(item.uri, item.name);
        if (ok) {
          setSavedIds((prev) => ({ ...prev, [item.id]: true }));
        } else {
          notifyPermission();
        }
      } catch (e) {
        console.log("Save failed", e);
      }
    },
    [notifyPermission],
  );

  const saveAll = useCallback(async () => {
    setSavingAll(true);
    try {
      for (const item of results) {
        const ok = await saveToDevice(item.uri, item.name);
        if (!ok) {
          notifyPermission();
          break;
        }
        setSavedIds((prev) => ({ ...prev, [item.id]: true }));
      }
    } catch (e) {
      console.log("Save all failed", e);
    } finally {
      setSavingAll(false);
    }
  }, [results, notifyPermission]);

  if (results.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{t("results")}</Text>
      {results.map((item) => {
        const ratio =
          item.originalSizeBytes && item.sizeBytes > 0
            ? (item.originalSizeBytes / item.sizeBytes).toFixed(1)
            : null;
        return (
          <View key={item.id} style={styles.row}>
            <Image source={{ uri: item.uri }} style={styles.thumb} />
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.meta}>
                {item.width}×{item.height} · {formatKB(item.sizeBytes)}
                {ratio && item.originalSizeBytes
                  ? ` · ${formatKB(item.originalSizeBytes)} → ×${ratio} ${t("lighter")}`
                  : ""}
              </Text>
            </View>
            <Pressable
              testID={`save-${item.id}`}
              onPress={() => saveOne(item)}
              style={styles.iconBtn}
            >
              {savedIds[item.id] ? (
                <Text style={styles.savedMark}>✓</Text>
              ) : (
                <Download color={theme.accent2} size={20} />
              )}
            </Pressable>
            {Platform.OS !== "web" && (
              <Pressable
                testID={`share-${item.id}`}
                onPress={() => shareImage(item.uri)}
                style={styles.iconBtn}
              >
                <Share2 color={theme.muted} size={20} />
              </Pressable>
            )}
          </View>
        );
      })}
      {results.length > 1 && (
        <View style={styles.saveAllWrap}>
          <GradientButton label={t("saveAll")} onPress={saveAll} busy={savingAll} testID="save-all" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  heading: {
    color: theme.ink,
    fontWeight: "700" as const,
    fontSize: 15,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: theme.panel,
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    gap: 10,
  },
  thumb: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: theme.white,
    borderWidth: 1,
    borderColor: theme.line,
  },
  info: {
    flex: 1,
  },
  name: {
    color: theme.ink,
    fontSize: 13,
    fontWeight: "600" as const,
  },
  meta: {
    color: theme.muted,
    fontSize: 11,
    marginTop: 2,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.panel2,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  savedMark: {
    color: theme.ok,
    fontSize: 18,
    fontWeight: "700" as const,
  },
  saveAllWrap: {
    marginTop: 8,
  },
});
