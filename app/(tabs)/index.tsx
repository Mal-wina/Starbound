import { Text } from "react-native";
import SanctuaryScreen from "../../components/SanctuaryScreen";

export default function HomeScreen() {
  return (
    <SanctuaryScreen
      title="Your reading sanctuary"
      subtitle="A little magic, a quiet moment, and your next adventure."
    >
      <Text style={{ color: "#513D62", fontSize: 17, lineHeight: 26 }}>
        Welcome to Starbound. Your reading journey begins here. ✧
      </Text>
    </SanctuaryScreen>
  );
}
