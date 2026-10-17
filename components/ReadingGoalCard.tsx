import { Image, StyleSheet, Text, View } from "react-native";

import { theme } from "../constants/theme";

type Props = {
  completed: number;
  goal: number;
};

export default function ReadingGoalCard({ completed, goal }: Props) {
  const progress = goal > 0 ? Math.min(Math.max(completed / goal, 0), 1) : 0;

  return (
    <View style={styles.scene}>
      <Image
        source={require("../assets/images/reading-goal-arch.png")}
        style={styles.artwork}
        resizeMode="contain"
        accessible={false}
      />

      <Text style={styles.title}>Reading goal</Text>

      <Text style={styles.year}>{new Date().getFullYear()}</Text>

      <Text style={styles.number}>
        {completed}
        <Text style={styles.total}> / {goal}</Text>
      </Text>

      <Text style={styles.books}>books</Text>

      <View
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: Math.round(progress * 100),
        }}
        style={styles.track}
      >
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>

      <Text style={styles.percent}>{Math.round(progress * 100)}% complete</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    width: "100%",
    maxWidth: 380,
    aspectRatio: 1,
    alignSelf: "center",
  },

  glow: {
    position: "absolute",
    left: "24%",
    right: "24%",
    top: "29%",
    bottom: "17%",
    backgroundColor: "#EEE0EB",
    borderRadius: 120,
    opacity: 0.35,
  },

  artwork: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  title: {
    position: "absolute",
    top: "31%",
    width: "100%",
    textAlign: "center",
    fontFamily: "StoryItalic",
    fontSize: 28,
    lineHeight: 32,
    color: theme.colors.text,
  },

  year: {
    position: "absolute",
    top: "42%",
    width: "100%",
    textAlign: "center",
    fontFamily: "StorySerif",
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 3,
    color: theme.colors.muted,
  },

  number: {
    position: "absolute",
    top: "48%",
    width: "100%",
    textAlign: "center",
    fontFamily: "StorySemiBold",
    fontSize: 58,
    lineHeight: 60,
    color: theme.colors.text,
  },

  total: {
    fontFamily: "StorySerif",
    fontSize: 29,
    color: theme.colors.plum,
  },

  books: {
    position: "absolute",
    top: "69%",
    width: "100%",
    textAlign: "center",
    fontFamily: "StoryItalic",
    fontSize: 21,
    lineHeight: 24,
    color: theme.colors.plum,
  },

  track: {
    position: "absolute",
    top: "80%",
    left: "28%",
    right: "28%",
    height: 12,
    padding: 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#C7A785",
    backgroundColor: "#F9ECE8",
    overflow: "hidden",
  },

  fill: {
    height: "100%",
    borderRadius: 12,
    backgroundColor: "#AE6D88",
  },

  percent: {
    position: "absolute",
    top: "85%",
    width: "100%",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.plum,
  },
});
