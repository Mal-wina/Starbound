import { Text } from "react-native";
import SanctuaryScreen from "../../components/SanctuaryScreen";

export default function LibraryScreen() {
  return (
    <SanctuaryScreen
      title="Your enchanted shelves"
      subtitle="Every book is a doorway to another world."
    >
      <Text style={{ color: "#513D62", lineHeight: 24 }}>
        Your shelves are waiting for their first adventure.
      </Text>
    </SanctuaryScreen>
  );
}
