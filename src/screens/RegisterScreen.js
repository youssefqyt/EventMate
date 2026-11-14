import React, { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput } from "react-native";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [isSubmitting, setIsSubmitting] = useState(false);
  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) return Alert.alert("Missing details", "Complete all fields to create your account.");
    if (!email.includes("@")) return Alert.alert("Check your email", "Enter a valid email address.");
    if (password.length < 6) return Alert.alert("Choose a longer password", "Use at least 6 characters.");
    setIsSubmitting(true); try { await register(name.trim(), email.trim().toLowerCase(), password); } catch (error) {
      const details = [error.message || "Please try again.", error.action, error.reference ? `Reference: ${error.reference}` : null].filter(Boolean).join("\n\n");
      Alert.alert(error.title || "Couldn’t create account", details);
    } finally { setIsSubmitting(false); }
  };
  return <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.page}><Text onPress={() => navigation.goBack()} style={styles.back}>← Back to sign in</Text><Text style={styles.eyebrow}>MAKE PLANS, MEET PEOPLE</Text><Text style={styles.title}>Join the{`\n`}good stuff.</Text><Text style={styles.subtitle}>A little corner for the things worth leaving home for.</Text>
    <Text style={styles.label}>YOUR NAME</Text><TextInput accessibilityLabel="Name" autoComplete="name" onChangeText={setName} placeholder="How should we call you?" placeholderTextColor={colors.slate} style={styles.input} value={name} />
    <Text style={styles.label}>EMAIL</Text><TextInput accessibilityLabel="Email" autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={colors.slate} style={styles.input} value={email} />
    <Text style={styles.label}>PASSWORD</Text><TextInput accessibilityLabel="Password" autoComplete="password-new" onChangeText={setPassword} placeholder="At least 6 characters" placeholderTextColor={colors.slate} secureTextEntry style={styles.input} value={password} />
    <Pressable accessibilityRole="button" disabled={isSubmitting} onPress={handleRegister} style={({ pressed }) => [styles.primary, (pressed || isSubmitting) && styles.primaryPressed]}>{isSubmitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryText}>Create my account →</Text>}</Pressable>
  </KeyboardAvoidingView>;
}
const styles = StyleSheet.create({ page: { backgroundColor: colors.cream, flex: 1, justifyContent: "center", padding: 26 }, back: { color: colors.coral, fontSize: 14, fontWeight: "800", marginBottom: 34 }, eyebrow: { color: colors.coral, fontSize: 11, fontWeight: "900", letterSpacing: 1.25, marginBottom: 13 }, title: { color: colors.navy, fontSize: 42, fontWeight: "900", letterSpacing: -2, lineHeight: 45 }, subtitle: { color: colors.slate, fontSize: 15, lineHeight: 22, marginBottom: 26, marginTop: 12 }, label: { color: colors.navy, fontSize: 11, fontWeight: "900", letterSpacing: 1, marginBottom: 7 }, input: { backgroundColor: colors.white, borderColor: colors.line, borderRadius: 14, borderWidth: 1, color: colors.ink, fontSize: 16, marginBottom: 14, paddingHorizontal: 16, paddingVertical: 14 }, primary: { alignItems: "center", backgroundColor: colors.coral, borderRadius: 14, marginTop: 5, paddingVertical: 16 }, primaryPressed: { opacity: 0.8 }, primaryText: { color: colors.white, fontSize: 16, fontWeight: "900" } });
