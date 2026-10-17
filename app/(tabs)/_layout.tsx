import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#FFF9F5" },
        headerTintColor: "#513D62",
        headerTitleStyle: { fontWeight: "600" },
        headerShown: false,
        tabBarActiveTintColor: "#9465AD",
        tabBarInactiveTintColor: "#9C8FA5",
        tabBarStyle: {
          backgroundColor: "#FFF9F5",
          borderTopColor: "#EADDED",
        },
        sceneStyle: { backgroundColor: "#FFF9F5" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Starbound",
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 23 }}>☾</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "My Library",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 23 }}>▤</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="reviews"
        options={{
          title: "Reviews",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 23 }}>☆</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 23 }}>♙</Text>
          ),
        }}
      />
    </Tabs>
  );
}
