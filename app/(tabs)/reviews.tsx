import { Text } from "react-native";
import SanctuaryScreen from "../../components/SanctuaryScreen";

export default function ReviewsScreen() {
  return (
    <SanctuaryScreen
      title="Words & wishes"
      subtitle="Remember the stories that stayed with you."
    >
      <Text style={{ color: "#513D62", lineHeight: 24 }}>
        Your book ratings and reviews will appear here.
      </Text>
    </SanctuaryScreen>
  );
}
