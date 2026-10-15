import { Text } from "react-native";
import SanctuaryScreen from "../../components/SanctuaryScreen";

export default function ProfileScreen() {
  return (
    <SanctuaryScreen
      title="The reader behind the magic"
      subtitle="Your own little corner of Starbound."
    >
      <Text style={{ color: "#513D62", lineHeight: 24 }}>
        Your profile and reading achievements will appear here.
      </Text>
    </SanctuaryScreen>
  );
}
