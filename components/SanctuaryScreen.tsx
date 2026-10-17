import { ReactNode } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { theme } from "../constants/theme";

type Props = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
};

export default function SanctuaryScreen({ title, children }: Props) {
  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heading}>
          <Text style={styles.decoration}>✧ ☾ ✧</Text>
          <Text style={styles.title}>{title}</Text>
        </View>

        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  scroll: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },

  content: {
    padding: theme.spacing.large,
    paddingBottom: 40,
    gap: theme.spacing.large,
  },

  heading: {
    alignItems: "center",
    gap: theme.spacing.small,
  },

  decoration: {
    color: theme.colors.gold,
    fontSize: 20,
    letterSpacing: 6,
  },

  title: {
    color: theme.colors.text,
    fontFamily: Platform.OS === "android" ? "serif" : "Georgia",
    fontSize: 32,
    textAlign: "center",
  },
});
