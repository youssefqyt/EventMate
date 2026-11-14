import React, { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";
import GoogleLoginButton
    from "../components/GoogleLoginButton";
export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleLogin = async () => {
    if (!email.trim() || !password) return Alert.alert("Missing details", "Enter your email and password to continue.");
    setIsSubmitting(true);
    try { await login(email.trim().toLowerCase(), password); }
    catch (error) {
      const details = [error.message || "Please try again.", error.action, error.reference ? `Reference: ${error.reference}` : null].filter(Boolean).join("\n\n");
      Alert.alert(error.title || "Couldn’t sign in", details);
    }
    finally { setIsSubmitting(false); }
  };
  return <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.page}>
    <View style={styles.top}><Text style={styles.brand}>eventmate</Text><View style={styles.spark}><Text>✦</Text></View></View>
    <View style={styles.content}><Text style={styles.eyebrow}>YOUR NEXT PLAN STARTS HERE</Text><Text style={styles.title}>Welcome{`\n`}back.</Text><Text style={styles.subtitle}>Sign in to find the events that make your week feel more like yours.</Text>
      <Text style={styles.label}>EMAIL</Text><TextInput accessibilityLabel="Email" autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={colors.slate} style={styles.input} value={email} />
      <Text style={styles.label}>PASSWORD</Text><TextInput accessibilityLabel="Password" autoComplete="password" onChangeText={setPassword} placeholder="Your password" placeholderTextColor={colors.slate} secureTextEntry style={styles.input} value={password} />
<GoogleLoginButton />
      <Pressable accessibilityRole="button" disabled={isSubmitting} onPress={handleLogin} style={({ pressed }) => [styles.primary, (pressed || isSubmitting) && styles.primaryPressed]}>{isSubmitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryText}>Sign in →</Text>}</Pressable>
      <Pressable accessibilityRole="button" onPress={() => navigation.navigate("Register")} style={styles.secondary}><Text style={styles.secondaryText}>New around here? <Text style={styles.link}>Create an account</Text></Text></Pressable>
    </View>
  </KeyboardAvoidingView>;
}
const styles = StyleSheet.create({ page: { backgroundColor: colors.cream, flex: 1 }, top: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 26, paddingTop: 64 }, brand: { color: colors.navy, fontSize: 22, fontWeight: "900", letterSpacing: -1 }, spark: { alignItems: "center", backgroundColor: colors.orange, borderRadius: 18, height: 36, justifyContent: "center", width: 36 }, content: { flex: 1, justifyContent: "center", padding: 26 }, eyebrow: { color: colors.coral, fontSize: 11, fontWeight: "900", letterSpacing: 1.25, marginBottom: 13 }, title: { color: colors.navy, fontSize: 46, fontWeight: "900", letterSpacing: -2, lineHeight: 48 }, subtitle: { color: colors.slate, fontSize: 16, lineHeight: 24, marginBottom: 34, marginTop: 14 }, label: { color: colors.navy, fontSize: 11, fontWeight: "900", letterSpacing: 1, marginBottom: 8 }, input: { backgroundColor: colors.white, borderColor: colors.line, borderRadius: 14, borderWidth: 1, color: colors.ink, fontSize: 16, marginBottom: 19, paddingHorizontal: 16, paddingVertical: 15 }, primary: { alignItems: "center", backgroundColor: colors.coral, borderRadius: 14, marginTop: 5, paddingVertical: 17 }, primaryPressed: { opacity: 0.8 }, primaryText: { color: colors.white, fontSize: 16, fontWeight: "900" }, secondary: { alignItems: "center", paddingTop: 24 }, secondaryText: { color: colors.slate, fontSize: 14 }, link: { color: colors.coral, fontWeight: "900" } });
