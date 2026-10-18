import { Image, StyleSheet, View } from "react-native";

export default function FloralBackground() {
  return (
    <View pointerEvents="none" style={styles.header}>
      <Image
        source={require("../assets/images/floral-background.png")}
        style={styles.artwork}
        resizeMode="contain"
        accessible={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignSelf: "stretch",
    aspectRatio: 3,
    marginHorizontal: -22,
    marginTop: -22,
    marginBottom: -16,
  },
  artwork: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
});
