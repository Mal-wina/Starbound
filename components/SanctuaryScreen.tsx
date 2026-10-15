import { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  subtitle: string;
  children?: ReactNode;
};

export default function SanctuaryScreen({ title, subtitle, children }: Props) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.decoration}>✧ ☾ ✧</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.card}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF9F5",
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  decoration: {
    color: "#AE87BD",
    fontSize: 28,
    marginBottom: 16,
  },
  title: {
    color: "#513D62",
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 10,
  },
  subtitle: {
    color: "#82728C",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
  },
  card: {
    backgroundColor: "#F3EAF8",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E8D9EF",
  },
});
