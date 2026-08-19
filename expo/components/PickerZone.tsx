import * as ImagePicker from "expo-image-picker";
import { ImageDown } from "lucide-react-native";
import React, { useCallback } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import theme from "@/constants/colors";
import { BATCH_MAX } from "@/constants/presets";
import { PickedImage } from "@/lib/image-tools";
import { useSettings } from "@/providers/settings-provider";

interface PickerZoneProps {
  files: PickedImage[];
  onFiles: (files: PickedImage[]) => void;
  multiple?: boolean;
  testID?: string;
}

export default function PickerZone({ files, onFiles, multiple = true, testID }: PickerZoneProps) {
  const { t } = useSettings();

  const pick = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: multiple,
        selectionLimit: multiple ? BATCH_MAX : 1,
        quality: 1,
      });
      if (result.canceled) return;
      const picked: PickedImage[] = result.assets.slice(0, BATCH_MAX).map((asset, index) => ({
        uri: asset.uri,
        width: asset.width ?? 0,
        height: asset.height ?? 0,
        fileName: asset.fileName ?? `image-${Date.now()}-${index}.jpg`,
        fileSize: asset.fileSize ?? undefined,
      }));
      onFiles(picked);
    } catch (e) {
      console.log("Image pick failed", e);
    }
  }, [multiple, onFiles]);

  return (
    <View>
      <Pressable testID={testID} onPress={pick} style={({ pressed }) => [styles.zone, pressed && styles.pressed]}>
        <ImageDown color={theme.accent2} size={30} />
        <Text style={styles.label}>{t("tapToPick")}</Text>
        {multiple && <Text style={styles.hint}>{t("upToFiles", { n: BATCH_MAX })}</Text>}
      </Pressable>
      {files.length > 0 && (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewRow}>
            {files.slice(0, 8).map((f) => (
              <Image key={f.uri} source={{ uri: f.uri }} style={styles.thumb} />
            ))}
          </ScrollView>
          <Text style={styles.count}>{t("filesLoaded", { n: files.length })}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  zone: {
    borderWidth: 2,
    borderColor: theme.line,
    borderStyle: "dashed" as const,
    borderRadius: 14,
    backgroundColor: theme.bg2,
    paddingVertical: 26,
    alignItems: "center" as const,
    gap: 6,
  },
  pressed: {
    borderColor: theme.accent,
    backgroundColor: "rgba(232,155,108,0.08)",
  },
  label: {
    color: theme.ink,
    fontSize: 14,
    fontWeight: "600" as const,
  },
  hint: {
    color: theme.muted,
    fontSize: 11,
  },
  previewRow: {
    marginTop: 10,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.white,
  },
  count: {
    color: theme.muted,
    fontSize: 12,
    marginTop: 6,
  },
});
