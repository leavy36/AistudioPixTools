import { Tabs } from "expo-router";
import { Info, Repeat2, Scaling, Shrink } from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import theme from "@/constants/colors";
import { useSettings } from "@/providers/settings-provider";

const serifFont = Platform.select({ ios: "Georgia", android: "serif", default: "Georgia" });

function LocalBadge() {
  const { t } = useSettings();
  return (
    <View style={styles.badge}>
      <View style={styles.dot} />
      <Text style={styles.badgeText}>{t("localBadge")}</Text>
    </View>
  );
}

export default function TabLayout() {
  const { t } = useSettings();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.accent2,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          backgroundColor: theme.panel,
          borderTopColor: theme.line,
        },
        headerStyle: {
          backgroundColor: theme.panel,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: serifFont,
          fontSize: 20,
          color: theme.ink,
        },
        headerRight: () => <LocalBadge />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabConvert"),
          headerTitle: "PixTools",
          tabBarIcon: ({ color }) => <Repeat2 color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="resize"
        options={{
          title: t("tabResize"),
          headerTitle: "PixTools",
          tabBarIcon: ({ color }) => <Scaling color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="optimize"
        options={{
          title: t("tabOptimize"),
          headerTitle: "PixTools",
          tabBarIcon: ({ color }) => <Shrink color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: t("tabAbout"),
          headerTitle: "PixTools",
          tabBarIcon: ({ color }) => <Info color={color} size={22} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    backgroundColor: theme.panel2,
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 14,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.ok,
  },
  badgeText: {
    color: theme.muted,
    fontSize: 11,
    fontWeight: "600" as const,
  },
});
