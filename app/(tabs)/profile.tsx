import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../providers/AuthProvider";

const colors = theme.colors;

type Profile = {
  username: string;
  reading_goal: number;
};

export default function ProfileScreen() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState("");
  const [booksRead, setBooksRead] = useState<number | null>(null);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [savingGoal, setSavingGoal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;

      let active = true;

      async function loadProfile() {
        setLoading(true);
        setMessage("");

        try {
          const [profileResult, countResult] = await Promise.all([
            supabase
              .from("profiles")
              .select("username, reading_goal")
              .eq("id", userId)
              .single(),

            supabase
              .from("user_books")
              .select("book_id", { count: "exact", head: true })
              .eq("user_id", userId)
              .eq("status", "finished"),
          ]);

          if (profileResult.error) {
            throw new Error(profileResult.error.message);
          }

          if (countResult.error) {
            throw new Error(countResult.error.message);
          }

          if (active) {
            setProfile(profileResult.data);
            setBooksRead(countResult.count ?? 0);
            setEditingGoal(false);
          }
        } catch (error) {
          if (active) {
            setMessage(
              error instanceof Error
                ? error.message
                : "Could not load your profile.",
            );
          }
        } finally {
          if (active) setLoading(false);
        }
      }

      void loadProfile();

      return () => {
        active = false;
      };
    }, [userId]),
  );

  async function handleSaveGoal() {
    if (!userId || !profile || savingGoal) return;

    const value = goalInput.trim();

    if (!/^\d+$/.test(value)) {
      setMessage("Enter a whole number between 1 and 1000.");
      return;
    }

    const nextGoal = Number(value);

    if (nextGoal < 1 || nextGoal > 1000) {
      setMessage("Choose a goal between 1 and 1000 books.");
      return;
    }

    setSavingGoal(true);
    setMessage("");

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ reading_goal: nextGoal })
        .eq("id", userId)
        .select("username, reading_goal")
        .single();

      if (error) throw new Error(error.message);

      setProfile(data);
      setEditingGoal(false);
      setMessage("Your reading goal has been saved.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not save your goal. Please try again.",
      );
    } finally {
      setSavingGoal(false);
    }
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signOut({
        scope: "local",
      });

      if (error) throw error;

      // The protected routes automatically return us to login.
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not log out. Please try again.",
      );
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.page}>
          <View style={styles.banner}>
            <Image
              source={require("../../assets/images/profile-garden.png")}
              style={styles.bannerImage}
              resizeMode="cover"
              accessible={false}
            />
          </View>

          <View style={styles.content}>
            <View style={styles.avatarBorder}>
              <View style={styles.avatar}>
                <Text style={styles.initial}>
                  {profile?.username.charAt(0).toUpperCase() || "☾"}
                </Text>
              </View>
            </View>

            {loading ? (
              <ActivityIndicator
                color={colors.rose}
                style={{ marginVertical: 24 }}
              />
            ) : (
              <>
                <Text style={styles.username}>
                  {profile?.username || "Your profile"}
                </Text>

                <Text style={styles.caption}>The reader behind the story</Text>

                <View style={styles.goal}>
                  <Text style={styles.goalEyebrow}>
                    {new Date().getFullYear()} READING GOAL
                  </Text>

                  <Text style={styles.goalValue}>
                    {profile ? profile.reading_goal : "—"}
                    <Text style={styles.goalUnit}> books</Text>
                  </Text>

                  <View style={styles.divider} />

                  <Text style={styles.goalNote}>
                    {booksRead === null
                      ? "Books read unavailable"
                      : `${booksRead} ${booksRead === 1 ? "book" : "books"} read in total`}
                  </Text>

                  {editingGoal ? (
                    <View style={{ width: "100%", marginTop: 18 }}>
                      <TextInput
                        accessibilityLabel="Yearly reading goal"
                        value={goalInput}
                        onChangeText={setGoalInput}
                        keyboardType="number-pad"
                        maxLength={4}
                        editable={!savingGoal}
                        style={{
                          minHeight: 50,
                          borderWidth: 1,
                          borderColor: colors.border,
                          borderRadius: 14,
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                          backgroundColor: colors.background,
                          color: colors.text,
                          fontSize: 18,
                          textAlign: "center",
                        }}
                      />

                      <Pressable
                        accessibilityRole="button"
                        disabled={savingGoal}
                        onPress={() => void handleSaveGoal()}
                        style={[
                          styles.button,
                          { marginTop: 12, backgroundColor: colors.rose },
                        ]}
                      >
                        {savingGoal ? (
                          <ActivityIndicator color={colors.card} />
                        ) : (
                          <Text
                            style={[styles.buttonText, { color: colors.card }]}
                          >
                            Save goal
                          </Text>
                        )}
                      </Pressable>

                      <Pressable
                        accessibilityRole="button"
                        disabled={savingGoal}
                        onPress={() => {
                          setEditingGoal(false);
                          setMessage("");
                        }}
                        style={{ paddingVertical: 14, alignItems: "center" }}
                      >
                        <Text style={{ color: colors.plum, fontSize: 14 }}>
                          Cancel
                        </Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable
                      accessibilityRole="button"
                      disabled={!profile}
                      onPress={() => {
                        if (!profile) return;
                        setGoalInput(String(profile.reading_goal));
                        setEditingGoal(true);
                        setMessage("");
                      }}
                      style={{ paddingTop: 16, paddingBottom: 8 }}
                    >
                      <Text style={{ color: colors.rose, fontSize: 14 }}>
                        Edit goal
                      </Text>
                    </Pressable>
                  )}
                </View>

                <View style={styles.account}>
                  <Text style={styles.accountLabel}>ACCOUNT EMAIL</Text>
                  <Text style={styles.email}>{session?.user.email}</Text>
                </View>
              </>
            )}

            {message ? (
              <Text accessibilityRole="alert" style={styles.message}>
                {message}
              </Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={loggingOut}
              onPress={() => void handleLogout()}
              style={({ pressed }) => [
                styles.button,
                (pressed || loggingOut) && styles.dimmed,
              ]}
            >
              {loggingOut ? (
                <ActivityIndicator color={colors.rose} />
              ) : (
                <Text style={styles.buttonText}>Log out</Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  page: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  banner: {
    height: 235,
    overflow: "hidden",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  content: {
    marginTop: -24,
    paddingHorizontal: 26,
    paddingBottom: 24,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: colors.background,
    alignItems: "center",
  },
  avatarBorder: {
    marginTop: -46,
    padding: 5,
    borderRadius: 60,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.pink,
    borderWidth: 1,
    borderColor: colors.border,
  },
  initial: {
    fontFamily: "StoryItalic",
    fontSize: 58,
    color: colors.plum,
  },
  username: {
    marginTop: 16,
    fontFamily: "StorySemiBold",
    fontSize: 38,
    color: colors.text,
    textAlign: "center",
  },
  caption: {
    marginTop: 3,
    fontFamily: "StoryItalic",
    fontSize: 21,
    color: colors.plum,
    textAlign: "center",
  },
  goal: {
    width: "100%",
    marginTop: 28,
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: "center",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  goalEyebrow: {
    fontSize: 11,
    letterSpacing: 2,
    color: colors.plum,
    textAlign: "center",
  },
  goalValue: {
    marginTop: 8,
    fontFamily: "StorySemiBold",
    fontSize: 54,
    color: colors.text,
  },
  goalUnit: {
    fontFamily: "StoryItalic",
    fontSize: 28,
    color: colors.plum,
  },
  divider: {
    width: 48,
    height: 1,
    marginVertical: 12,
    backgroundColor: colors.gold,
  },
  goalNote: {
    fontFamily: "StoryItalic",
    fontSize: 21,
    color: colors.plum,
  },
  account: {
    width: "100%",
    marginTop: 26,
    alignItems: "center",
  },
  accountLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: colors.muted,
  },
  email: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
    textAlign: "center",
  },
  message: {
    marginTop: 18,
    color: colors.plum,
    fontSize: 14,
    lineHeight: 22,
  },
  button: {
    width: "100%",
    minHeight: 50,
    marginTop: 26,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: colors.rose,
    fontSize: 15,
    fontWeight: "600",
  },
  dimmed: {
    opacity: 0.7,
  },
});
