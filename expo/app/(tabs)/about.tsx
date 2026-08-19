import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { FileCheck2, Lock, Repeat2, Scaling, Shrink, Sparkles } from "lucide-react-native";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";

import { Card, Chip, FieldLabel, GradientButton, MutedText } from "@/components/ui";
import theme from "@/constants/colors";
import { BATCH_MAX } from "@/constants/presets";
import { LANGUAGES } from "@/lib/i18n";
import { useSettings } from "@/providers/settings-provider";

const serifFont = Platform.select({ ios: "Georgia", android: "serif", default: "Georgia" });

export default function AboutScreen() {
  const { t, lang, setLang, isPro } = useSettings();
  const router = useRouter();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.brandBlock}>
        <LinearGradient
          colors={[theme.logoBlue, theme.logoPurple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logo}
        >
          <FileCheck2 color={theme.white} size={40} />
        </LinearGradient>
        <Text style={styles.brandName}>
          Pix<Text style={styles.brandItalic}>Tools</Text>
        </Text>
        <MutedText>{t("aboutText")}</MutedText>
      </View>

      {!isPro && (
        <GradientButton
          label="Go Pro — $30/year"
          icon={<Sparkles color={theme.white} size={18} />}
          onPress={() => router.push("/paywall")}
        />
      )}

      {isPro && (
        <View style={styles.proBadge}>
          <Sparkles color={theme.white} size={18} />
          <Text style={styles.proText}>PixTools Pro active</Text>
        </View>
      )}

      <Card>
        <View style={styles.moduleRow}>
          <Repeat2 color={theme.accent2} size={20} />
          <View style={styles.moduleInfo}>
            <Text style={styles.moduleTitle}>{t("tabConvert")}</Text>
            <Text style={styles.moduleDesc}>{t("modConvertDesc")}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.moduleRow}>
          <Scaling color={theme.accent2} size={20} />
          <View style={styles.moduleInfo}>
            <Text style={styles.moduleTitle}>{t("tabResize")}</Text>
            <Text style={styles.moduleDesc}>{t("modResizeDesc")}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.moduleRow}>
          <Shrink color={theme.accent2} size={20} />
          <View style={styles.moduleInfo}>
            <Text style={styles.moduleTitle}>{t("tabOptimize")}</Text>
            <Text style={styles.moduleDesc}>{t("modOptimizeDesc")}</Text>
          </View>
        </View>
      </Card>

      <Card>
        <View style={styles.privacyHeader}>
          <Lock color={theme.ok} size={18} />
          <Text style={styles.privacyTitle}>{t("privacyTitle")}</Text>
        </View>
        <Text style={styles.privacyLine}>• {t("priv1")}</Text>
        <Text style={styles.privacyLine}>• {t("priv2")}</Text>
        <Text style={styles.privacyLine}>• {t("priv3", { n: BATCH_MAX })}</Text>
      </Card>

      <Card>
        <FieldLabel>{t("language")}</FieldLabel>
        <View style={styles.langGrid}>
          {LANGUAGES.map((l) => (
            <Chip
              key={l.code}
              label={l.name}
              active={lang === l.code}
              onPress={() => setLang(l.code)}
              testID={`lang-${l.code}`}
            />
          ))}
        </View>
      </Card>

      <Text style={styles.version}>{t("version")}</Text>
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
  brandBlock: {
    alignItems: "center" as const,
    paddingVertical: 18,
  },
  logo: {
    width: 84,
    height: 84,
    borderRadius: 22,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 12,
    shadowColor: theme.logoPurple,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  brandName: {
    fontFamily: serifFont,
    fontSize: 28,
    color: theme.ink,
    fontWeight: "700" as const,
    marginBottom: 8,
  },
  brandItalic: {
    fontStyle: "italic" as const,
    color: theme.accent2,
  },
  proBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    backgroundColor: theme.logoPurple,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 14,
  },
  proText: {
    color: theme.white,
    fontWeight: "700" as const,
    fontSize: 15,
  },
  moduleRow: {
    flexDirection: "row" as const,
    gap: 12,
    alignItems: "flex-start" as const,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    color: theme.ink,
    fontWeight: "700" as const,
    fontSize: 14,
    marginBottom: 2,
  },
  moduleDesc: {
    color: theme.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  divider: {
    height: 1,
    backgroundColor: theme.line,
    marginVertical: 12,
  },
  privacyHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 10,
  },
  privacyTitle: {
    color: theme.ink,
    fontWeight: "700" as const,
    fontSize: 14,
  },
  privacyLine: {
    color: theme.muted,
    fontSize: 13,
    lineHeight: 22,
  },
  langGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
  },
  version: {
    color: theme.muted,
    fontSize: 12,
    textAlign: "center" as const,
    marginTop: 8,
  },
});
