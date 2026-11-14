import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { getSavedEventIds } from "../storage/bookmarks.storage";
import { colors } from "../theme/colors";

export default function ProfileScreen({ navigation }) {
  const { user, logout, linkGoogle, updateUserProfile } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  // Edit Profile Modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [isUpdating, setIsUpdating] = useState(false);

  // Notifications Modal
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [recommendationsEnabled, setRecommendationsEnabled] = useState(true);

  useEffect(() => {
    getSavedEventIds().then((ids) => setSavedCount(ids.length));
  }, []);

  useEffect(() => {
    if (user?.name) setNewName(user.name);
  }, [user?.name]);

  const initial = (user?.name || user?.email || "E").charAt(0).toUpperCase();

  const handleLinkGoogle = async (googleToken) => {
    try {
      await linkGoogle(googleToken);
      Alert.alert("Google linked", "You can now sign in with Google.");
    } catch (error) {
      Alert.alert(
        error.title || "Couldn’t link Google",
        [
          error.message,
          error.action,
          error.reference ? `Reference: ${error.reference}` : null,
        ]
          .filter(Boolean)
          .join("\n\n")
      );
    }
  };

  const handleSaveProfile = async () => {
    if (!newName.trim()) {
      return Alert.alert("Name required", "Please enter your name.");
    }

    setIsUpdating(true);
    try {
      await updateUserProfile(newName.trim());
      setEditModalVisible(false);
      Alert.alert("Success", "Your profile has been updated.");
    } catch (err) {
      Alert.alert("Update failed", err.message || "Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      "Sign out",
      "Are you sure you want to sign out of EventMate?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: () => {
            setIsLoggingOut(true);
            logout();
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.kicker}>YOUR SPACE</Text>
      <Text style={styles.title}>Profile</Text>

      {/* Profile Card */}
      <View style={styles.person}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.personCopy}>
          <Text style={styles.name}>{user?.name || "EventMate Member"}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.provider === "google" && (
            <View style={styles.googleBadge}>
              <Text style={styles.googleBadgeText}>Google Account</Text>
            </View>
          )}
        </View>
      </View>

      {/* Account Settings Menu */}
      <Text style={styles.section}>ACCOUNT SETTINGS</Text>
      <View style={styles.menu}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setEditModalVisible(true)}
          style={styles.row}
        >
          <Ionicons name="person-outline" size={20} color={colors.coral} style={styles.rowIcon} />
          <View style={styles.rowCopy}>
            <Text style={styles.rowTitle}>Personal details</Text>
            <Text style={styles.rowDetail}>Change your display name</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => setNotifModalVisible(true)}
          style={styles.row}
        >
          <Ionicons name="notifications-outline" size={20} color={colors.coral} style={styles.rowIcon} />
          <View style={styles.rowCopy}>
            <Text style={styles.rowTitle}>Notifications</Text>
            <Text style={styles.rowDetail}>Event reminders and updates</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate("Events")}
          style={[styles.row, { borderBottomWidth: 0 }]}
        >
          <Ionicons name="bookmark-outline" size={20} color={colors.coral} style={styles.rowIcon} />
          <View style={styles.rowCopy}>
            <Text style={styles.rowTitle}>Saved events</Text>
            <Text style={styles.rowDetail}>
              {savedCount} {savedCount === 1 ? "event bookmarked" : "events bookmarked"}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </View>

      {/* Google Link Option if not already linked */}
      {user?.provider !== "google" && (
        <View style={styles.google}>
          <GoogleLoginButton title="Link Google account" onIdToken={handleLinkGoogle} />
        </View>
      )}

      {/* Sign Out Button */}
      <Pressable
        accessibilityRole="button"
        disabled={isLoggingOut}
        onPress={confirmLogout}
        style={styles.signout}
      >
        {isLoggingOut ? (
          <ActivityIndicator color={colors.danger} />
        ) : (
          <>
            <Text style={styles.signoutText}>Sign out</Text>
            <Text style={styles.arrow}>→</Text>
          </>
        )}
      </Pressable>

      <Text style={styles.appVersion}>EventMate v1.0.0 · Local Experiences</Text>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <Pressable
                onPress={() => setEditModalVisible(false)}
                hitSlop={10}
              >
                <Ionicons name="close" size={24} color={colors.navy} />
              </Pressable>
            </View>

            <Text style={styles.modalLabel}>DISPLAY NAME</Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Your full name"
              placeholderTextColor={colors.slate}
              style={styles.modalInput}
            />

            <Text style={styles.modalLabel}>EMAIL (CANNOT BE CHANGED)</Text>
            <TextInput
              value={user?.email || ""}
              editable={false}
              style={[styles.modalInput, styles.disabledInput]}
            />

            <Pressable
              disabled={isUpdating}
              onPress={handleSaveProfile}
              style={styles.modalSaveBtn}
            >
              {isUpdating ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.modalSaveText}>Save Changes</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={notifModalVisible}
        onRequestClose={() => setNotifModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notification Preferences</Text>
              <Pressable onPress={() => setNotifModalVisible(false)} hitSlop={10}>
                <Ionicons name="close" size={24} color={colors.navy} />
              </Pressable>
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleCopy}>
                <Text style={styles.toggleTitle}>Booking Reminders</Text>
                <Text style={styles.toggleSub}>
                  Get reminded 24 hours before your booked event starts.
                </Text>
              </View>
              <Switch
                value={remindersEnabled}
                onValueChange={setRemindersEnabled}
                trackColor={{ true: colors.coral, false: colors.line }}
              />
            </View>

            <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
              <View style={styles.toggleCopy}>
                <Text style={styles.toggleTitle}>Weekly Curated Picks</Text>
                <Text style={styles.toggleSub}>
                  Receive highlights of new gatherings and workshops in your city.
                </Text>
              </View>
              <Switch
                value={recommendationsEnabled}
                onValueChange={setRecommendationsEnabled}
                trackColor={{ true: colors.coral, false: colors.line }}
              />
            </View>

            <Pressable
              onPress={() => setNotifModalVisible(false)}
              style={styles.modalSaveBtn}
            >
              <Text style={styles.modalSaveText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.cream,
    flexGrow: 1,
    padding: 22,
    paddingTop: 62,
    paddingBottom: 110,
  },
  kicker: {
    color: colors.coral,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  title: {
    color: colors.navy,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -1.4,
    marginTop: 9,
  },
  person: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 25,
    padding: 18,
  },
  personCopy: {
    flex: 1,
    marginLeft: 14,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.orange,
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    width: 50,
  },
  avatarText: {
    color: colors.white,
    fontSize: 21,
    fontWeight: "900",
  },
  name: {
    color: colors.navy,
    fontSize: 17,
    fontWeight: "900",
  },
  email: {
    color: colors.slate,
    fontSize: 13,
    marginTop: 3,
  },
  googleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EBF3FE",
    borderRadius: 6,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  googleBadgeText: {
    color: "#1A73E8",
    fontSize: 10,
    fontWeight: "800",
  },
  section: {
    color: colors.slate,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginBottom: 10,
    marginTop: 30,
  },
  menu: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
  },
  row: {
    alignItems: "center",
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    padding: 16,
  },
  rowIcon: {
    marginRight: 14,
  },
  rowCopy: {
    flex: 1,
  },
  rowTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
  },
  rowDetail: {
    color: colors.slate,
    fontSize: 12,
    marginTop: 3,
  },
  chevron: {
    color: colors.slate,
    fontSize: 22,
  },
  google: {
    marginTop: 18,
  },
  signout: {
    alignItems: "center",
    borderColor: "#F1C8C0",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
    padding: 16,
  },
  signoutText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: "900",
  },
  arrow: {
    color: colors.danger,
    fontSize: 20,
  },
  appVersion: {
    color: colors.slate,
    fontSize: 12,
    marginTop: 26,
    textAlign: "center",
  },
  modalOverlay: {
    backgroundColor: "rgba(10, 24, 40, 0.45)",
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: {
    color: colors.navy,
    fontSize: 20,
    fontWeight: "900",
  },
  modalLabel: {
    color: colors.navy,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: colors.cream,
    borderColor: colors.line,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 15,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  disabledInput: {
    color: colors.slate,
    opacity: 0.7,
  },
  modalSaveBtn: {
    alignItems: "center",
    backgroundColor: colors.coral,
    borderRadius: 14,
    marginTop: 8,
    paddingVertical: 16,
  },
  modalSaveText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "900",
  },
  toggleRow: {
    alignItems: "center",
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  toggleCopy: {
    flex: 1,
    marginRight: 14,
  },
  toggleTitle: {
    color: colors.navy,
    fontSize: 15,
    fontWeight: "800",
  },
  toggleSub: {
    color: colors.slate,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 3,
  },
});
