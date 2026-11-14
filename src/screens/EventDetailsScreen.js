import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  createBooking,
  cancelBookingByEvent,
  checkBooking,
} from "../services/bookings.service";
import { isEventSaved, toggleSaveEvent } from "../storage/bookmarks.storage";
import { colors } from "../theme/colors";

export default function EventDetailsScreen({ navigation, route }) {
  const event = route.params?.event;
  const [saving, setSaving] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!event) return;
    let isMounted = true;

    async function initStatus() {
      try {
        const [bookingStatus, savedStatus] = await Promise.all([
          checkBooking(event.id),
          isEventSaved(event.id),
        ]);
        if (isMounted) {
          setIsBooked(bookingStatus.isBooked);
          setIsSaved(savedStatus);
        }
      } catch {
        // Ignore fallback
      } finally {
        if (isMounted) setChecking(false);
      }
    }

    initStatus();
    return () => {
      isMounted = false;
    };
  }, [event]);

  if (!event) {
    return (
      <View style={styles.missing}>
        <Ionicons color={colors.coral} name="alert-circle-outline" size={42} />
        <Text style={styles.missingTitle}>This event is unavailable.</Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const handleBook = async () => {
    setSaving(true);
    try {
      await createBooking(event.id);
      setIsBooked(true);
      Alert.alert(
        "You’re booked! 🎉",
        "Your reservation is confirmed. See you there!",
        [
          { text: "View all bookings", onPress: () => navigation.navigate("ProtectedTabs", { screen: "Bookings" }) },
          { text: "Done", style: "cancel" },
        ]
      );
    } catch (e) {
      Alert.alert(
        e.title || "Booking unavailable",
        [e.message, e.action, e.reference ? `Reference: ${e.reference}` : null]
          .filter(Boolean)
          .join("\n\n")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelBooking = () => {
    Alert.alert(
      "Cancel reservation?",
      `Are you sure you want to cancel your reservation for "${event.title}"?`,
      [
        { text: "Keep booking", style: "cancel" },
        {
          text: "Yes, cancel",
          style: "destructive",
          onPress: async () => {
            setSaving(true);
            try {
              await cancelBookingByEvent(event.id);
              setIsBooked(false);
              Alert.alert("Reservation cancelled", "Your spot has been released.");
            } catch (e) {
              Alert.alert(e.title || "Could not cancel", e.message || "Please try again.");
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me at "${event.title}"! Date: ${event.date} at ${event.location}. Book via EventMate!`,
        title: event.title,
      });
    } catch {
      // User cancelled share
    }
  };

  const handleToggleBookmark = async () => {
    const newState = await toggleSaveEvent(event.id);
    setIsSaved(newState);
  };

  const isSoldOut = event.spots_left === 0;

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Banner */}
        <View style={[styles.banner, { backgroundColor: event.accent || colors.coral }]}>
          <View style={styles.bannerTop}>
            <Text style={styles.date}>{event.date || "UPCOMING EVENT"}</Text>
            <View style={styles.topActions}>
              <Pressable
                accessibilityLabel="Share event"
                onPress={handleShare}
                style={styles.circleBtn}
              >
                <Ionicons name="share-social-outline" size={19} color={colors.white} />
              </Pressable>
              <Pressable
                accessibilityLabel="Bookmark event"
                onPress={handleToggleBookmark}
                style={[styles.circleBtn, { marginLeft: 8 }]}
              >
                <Ionicons
                  name={isSaved ? "bookmark" : "bookmark-outline"}
                  size={19}
                  color={colors.white}
                />
              </Pressable>
            </View>
          </View>

          <Text style={styles.bannerCategory}>{event.category || "EVENT"}</Text>
        </View>

        {/* Title & Status */}
        <View style={styles.titleSection}>
          {isBooked && (
            <View style={styles.bookedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#18804E" />
              <Text style={styles.bookedText}>You have reserved a spot</Text>
            </View>
          )}

          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.description}>
            {event.description || "Join a local experience made for a memorable evening."}
          </Text>
        </View>

        {/* Info Rows */}
        <View style={styles.info}>
          <Ionicons color={colors.coral} name="time-outline" size={22} style={styles.icon} />
          <View>
            <Text style={styles.infoLabel}>WHEN</Text>
            <Text style={styles.infoValue}>
              {event.date} · {event.time}
            </Text>
          </View>
        </View>

        <View style={styles.info}>
          <Ionicons color={colors.coral} name="location-outline" size={22} style={styles.icon} />
          <View>
            <Text style={styles.infoLabel}>WHERE</Text>
            <Text style={styles.infoValue}>{event.location}</Text>
          </View>
        </View>

        {event.capacity != null && (
          <View style={styles.info}>
            <Ionicons color={colors.coral} name="people-outline" size={22} style={styles.icon} />
            <View>
              <Text style={styles.infoLabel}>CAPACITY & AVAILABILITY</Text>
              <Text style={styles.infoValue}>
                {event.spots_left != null
                  ? `${event.spots_left} of ${event.capacity} spots remaining`
                  : `Max capacity: ${event.capacity} guests`}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer / CTA Bar */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.from}>PRICE</Text>
          <Text style={styles.price}>{event.price || "Free"}</Text>
        </View>

        {checking ? (
          <ActivityIndicator color={colors.coral} />
        ) : isBooked ? (
          <Pressable
            disabled={saving}
            onPress={handleCancelBooking}
            style={[styles.button, styles.cancelButton]}
          >
            {saving ? (
              <ActivityIndicator color={colors.danger} />
            ) : (
              <Text style={styles.cancelButtonText}>Cancel reservation</Text>
            )}
          </Pressable>
        ) : (
          <Pressable
            disabled={saving || isSoldOut}
            onPress={handleBook}
            style={[styles.button, isSoldOut && styles.disabledButton]}
          >
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>
                {isSoldOut ? "Sold out" : "Book now →"}
              </Text>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.cream,
    flex: 1,
  },
  content: {
    paddingBottom: 130,
  },
  banner: {
    borderBottomRightRadius: 26,
    padding: 24,
    paddingBottom: 40,
    paddingTop: 54,
  },
  bannerTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  topActions: {
    flexDirection: "row",
  },
  circleBtn: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  date: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.3,
  },
  bannerCategory: {
    color: colors.white,
    fontSize: 27,
    fontWeight: "900",
    marginTop: 14,
  },
  titleSection: {
    paddingHorizontal: 22,
    paddingTop: 22,
  },
  bookedBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#E2F6EE",
    borderRadius: 8,
    flexDirection: "row",
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  bookedText: {
    color: "#18804E",
    fontSize: 12,
    fontWeight: "800",
  },
  title: {
    color: colors.navy,
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 38,
  },
  description: {
    color: colors.slate,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    marginTop: 14,
  },
  info: {
    alignItems: "center",
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: "row",
    marginHorizontal: 22,
    paddingVertical: 17,
  },
  icon: {
    marginRight: 15,
  },
  infoLabel: {
    color: colors.slate,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  infoValue: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 3,
  },
  footer: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    left: 0,
    padding: 16,
    position: "absolute",
    right: 0,
  },
  from: {
    color: colors.slate,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  price: {
    color: colors.navy,
    fontSize: 20,
    fontWeight: "900",
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.coral,
    borderRadius: 12,
    minWidth: 160,
    paddingVertical: 15,
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "900",
  },
  cancelButton: {
    backgroundColor: "#FFEBE8",
    borderColor: "#F1C8C0",
    borderWidth: 1,
  },
  cancelButtonText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "900",
  },
  disabledButton: {
    backgroundColor: colors.slate,
    opacity: 0.6,
  },
  missing: {
    alignItems: "center",
    backgroundColor: colors.cream,
    flex: 1,
    justifyContent: "center",
    padding: 28,
  },
  missingTitle: {
    color: colors.navy,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 12,
  },
  back: {
    color: colors.coral,
    fontWeight: "900",
    marginTop: 16,
  },
});
