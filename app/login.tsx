import { Redirect, Stack } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { theme } from "../constants/theme";
import { supabase } from "../lib/supabase";
import { useAuth } from "../providers/AuthProvider";

const colors = theme.colors;

export default function LoginScreen() {
  const { session, loading } = useAuth();

  const [registering, setRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    if (busy) return;

    setMessage("");

    if (!email.trim() || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    if (registering && !username.trim()) {
      setMessage("Please choose a username.");
      return;
    }

    if (registering && password.length < 8) {
      setMessage("Choose a password with at least 8 characters.");
      return;
    }

    setBusy(true);

    try {
      if (registering) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              username: username.trim(),
            },
          },
        });

        if (error) throw error;

        if (!data.session) {
          setMessage(
            "Check your email to confirm your account, then log in here.",
          );
          setRegistering(false);
          setPassword("");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.rose} />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/" />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.page}>
          <View style={styles.hero}>
            <Image
              source={require("../assets/images/sanctuary-garden.png")}
              style={styles.heroImage}
              resizeMode="cover"
              accessible={false}
            />

            <Text style={styles.brand}>Starbound</Text>
          </View>

          <View style={styles.panel}>
            <Text style={styles.heading}>
              {registering ? "Your story begins" : "Welcome back"}
            </Text>

            <Text style={styles.subtitle}>
              {registering
                ? "Create an account for your reading sanctuary."
                : "Log in to return to your bookshelf."}
            </Text>

            {registering && (
              <View style={styles.field}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  accessibilityLabel="Username"
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Your reader name"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={40}
                  editable={!busy}
                />
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                accessibilityLabel="Email"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                editable={!busy}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                accessibilityLabel="Password"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder={
                  registering ? "At least 8 characters" : "Your password"
                }
                placeholderTextColor={colors.muted}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete={registering ? "new-password" : "current-password"}
                editable={!busy}
                onSubmitEditing={() => void handleSubmit()}
              />
            </View>

            {message ? (
              <Text accessibilityRole="alert" style={styles.message}>
                {message}
              </Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={() => void handleSubmit()}
              style={({ pressed }) => [
                styles.button,
                (pressed || busy) && styles.dimmed,
              ]}
            >
              {busy ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <Text style={styles.buttonText}>
                  {registering ? "Create account" : "Log in"}
                </Text>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={busy}
              style={styles.switchButton}
              onPress={() => {
                setRegistering(!registering);
                setMessage("");
                setPassword("");
              }}
            >
              <Text style={styles.switchText}>
                {registering
                  ? "Already have an account? Log in"
                  : "New to Starbound? Create an account"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
  },
  page: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  hero: {
    height: 250,
    alignItems: "center",
    paddingTop: 46,
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
  },
  brand: {
    fontFamily: "StorySemiBold",
    fontSize: 54,
    color: colors.text,
    textShadowColor: "#FBE8D8",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  panel: {
    marginTop: -24,
    padding: 26,
    paddingBottom: 40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: colors.background,
  },
  heading: {
    fontFamily: "StorySemiBold",
    fontSize: 36,
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 28,
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
    textAlign: "center",
  },
  field: {
    marginBottom: 18,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    color: colors.text,
  },
  input: {
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.card,
    color: colors.text,
    fontSize: 16,
  },
  message: {
    marginBottom: 18,
    color: colors.plum,
    fontSize: 14,
    lineHeight: 21,
  },
  button: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: colors.rose,
    marginTop: 4,
  },
  buttonText: {
    color: colors.card,
    fontSize: 17,
    fontWeight: "600",
  },
  dimmed: {
    opacity: 0.7,
  },
  switchButton: {
    paddingVertical: 20,
    alignItems: "center",
  },
  switchText: {
    color: colors.rose,
    fontSize: 14,
    textAlign: "center",
  },
});
