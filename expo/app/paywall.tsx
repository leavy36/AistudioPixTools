import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Check, Crown, RefreshCcw } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";

import { GradientButton } from "@/components/ui";
import theme from "@/constants/colors";
import { Purchases, type PurchasesPackage } from "@/lib/revenuecat";
import { useSettings } from "@/providers/settings-provider";

const serifFont = Platform.select({ ios: "Georgia", android: "serif", default: "Georgia" });

const PERKS = [
  "Unlimited batch conversions",
  "All resize presets unlocked",
  "Smart Shrink custom targets",
  "No ads, no watermarks",
];

export default function PaywallScreen() {
  const { t } = useSettings();
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["offerings"],
    queryFn: async () => {
      const offerings = await Purchases.getOfferings();
      return offerings.current?.availablePackages ?? [];
    },
  });

  const handlePurchase = useCallback(async (pkg: PurchasesPackage) => {
    setPurchasing(true);
    setMessage(null);
    try {
      const result = await Purchases.purchasePackage(pkg);
      if (result.customerInfo.entitlements.active["PixTools Pro"]) {
        setMessage("Welcome to PixTools Pro!");
      } else {
        setMessage("Purchase pending — verify later.");
      }
    } catch (e) {
      const error = e as { userCancelled?: boolean; message?: string };
      if (!error.userCancelled) {
        setMessage(error.message ?? "Purchase failed.");
      }
    } finally {
      setPurchasing(false);
    }
  }, []);

  const handleRestore = useCallback(async () => {
    setRestoring(true);
    setMessage(null);
    try {
      const info = await Purchases.restorePurchases();
      if (info.entitlements.active["PixTools Pro"]) {
        setMessage("Purchases restored.");
      } else {
        setMessage("No previous purchases found.");
      }
    } catch (e) {
      setMessage("Restore failed.");
    } finally {
      setRestoring(false);
    }
  }, []);

  const annual = data?.find((p) => p.packageType === "ANNUAL") ?? data?.[0];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <LinearGradient
          colors={[theme.logoBlue, theme.logoPurple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.icon}
        >
          <Crown color={theme.white} size={40} />
        </LinearGradient>
        <Text style={styles.title}>
          Pix<Text style={styles.italic}>Pro</Text>
        </Text>
        <Text style={styles.subtitle}>Unlock every tool, forever flexible.</Text>
      </View>

      <View style={styles.perks}>
        {PERKS.map((perk) => (
          <View key={perk} style={styles.perk}>
            <Check color={theme.ok} size={18} />
            <Text style={styles.perkText}>{perk}</Text>
          </View>
        ))}
      </View>

      {isLoading && <Text style={styles.status}>Loading offers…</Text>}

      {annual && (
        <View style={styles.card}>
          <Text style={styles.planName}>Annual Plan</Text>
          <Text style={styles.price}>{annual.product.priceString} / year</Text>
          <Text style={styles.billing}>Billed annually. Cancel anytime.</Text>
          <GradientButton
            label={purchasing ? "Processing…" : "Subscribe Now"}
            onPress={() => handlePurchase(annual)}
            disabled={purchasing}
          />
        </View>
      )}

      <View style={styles.restore}>
        <GradientButton
          label={restoring ? "Restoring…" : "Restore Purchases"}
          onPress={handleRestore}
          disabled={restoring}
          variant="ghost"
          icon={<RefreshCcw color={theme.accent2} size={16} />}
        />
      </View>

      {message && <Text style={styles.message}>{message}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  header: {
    alignItems: "center" as const,
    marginBottom: 24,
  },
  icon: {
    width: 84,
    height: 84,
    borderRadius: 24,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 16,
  },
  title: {
    fontFamily: serifFont,
    fontSize: 30,
    color: theme.ink,
    fontWeight: "700" as const,
  },
  italic: {
    fontStyle: "italic" as const,
    color: theme.accent2,
  },
  subtitle: {
    color: theme.muted,
    fontSize: 14,
    marginTop: 6,
    textAlign: "center" as const,
  },
  perks: {
    gap: 12,
    marginBottom: 24,
  },
  perk: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  perkText: {
    color: theme.ink,
    fontSize: 14,
  },
  card: {
    backgroundColor: theme.panel,
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 16,
    padding: 20,
    alignItems: "center" as const,
    gap: 8,
  },
  planName: {
    color: theme.ink,
    fontSize: 16,
    fontWeight: "700" as const,
  },
  price: {
    color: theme.accent2,
    fontSize: 28,
    fontWeight: "800" as const,
  },
  billing: {
    color: theme.muted,
    fontSize: 12,
    marginBottom: 8,
  },
  restore: {
    marginTop: 16,
  },
  status: {
    color: theme.muted,
    textAlign: "center" as const,
  },
  message: {
    color: theme.ink,
    textAlign: "center" as const,
    marginTop: 16,
  },
});
