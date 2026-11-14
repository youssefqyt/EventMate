import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import EventCard from "../components/EventCard";
import { getBookings, cancelBooking } from "../services/bookings.service";
import { colors } from "../theme/colors";

export default function BookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await getBookings();
      setBookings(data);
    } catch (e) {
      setError(e.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancelBooking = (booking) => {
    Alert.alert(
      "Cancel reservation?",
      `Are you sure you want to cancel your reservation for "${booking.event.title}"?`,
      [
        { text: "Keep booking", style: "cancel" },
        {
          text: "Yes, cancel",
          style: "destructive",
          onPress: async () => {
            setCancellingId(booking.id);
            try {
              await cancelBooking(booking.id);
              setBookings((prev) => prev.filter((b) => b.id !== booking.id));
              Alert.alert("Reservation cancelled", "Your booking has been removed.");
            } catch (e) {
              Alert.alert("Cancellation failed", e.message || "Please try again.");
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.page}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => {
            setLoading(true);
            load();
          }}
          tintColor={colors.coral}
        />
      }
    >
      <Text style={styles.kicker}>YOUR CALENDAR</Text>
      <View style={styles.headerRow}>
        <Text style={styles.title}>My bookings</Text>
        {bookings.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {bookings.length} {bookings.length === 1 ? "RESERVATION" : "RESERVATIONS"}
            </Text>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={styles.state} color={colors.coral} size="large" />
      ) : error ? (
        <View style={styles.state}>
          <Text style={styles.message}>{error}</Text>
          <Pressable
            onPress={() => {
              setLoading(true);
              load();
            }}
          >
            <Text style={styles.retry}>Try again</Text>
          </Pressable>
        </View>
      ) : bookings.length > 0 ? (
        bookings.map((booking) => (
          <EventCard
            key={booking.id}
            event={booking.event}
            isBooked={true}
            actionLabel={cancellingId === booking.id ? "Cancelling..." : "Cancel"}
            actionLoading={cancellingId === booking.id}
            onAction={() => handleCancelBooking(booking)}
            onPress={() =>
              navigation.navigate("EventDetails", { event: booking.event })
            }
          />
        ))
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>✦</Text>
          <Text style={styles.message}>Your next great plan is waiting.</Text>
          <Text style={styles.helper}>
            Reserve an event and it will appear here on your schedule.
          </Text>
          <Pressable
            onPress={() => navigation.navigate("Events")}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Explore events</Text>
          </Pressable>
        </View>
      )}
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
  headerRow: {
    alignItems: "baseline",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 26,
    marginTop: 8,
  },
  title: {
    color: colors.navy,
    fontSize: 34,
    fontWeight: "900",
  },
  badge: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    color: colors.slate,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  state: {
    alignItems: "center",
    padding: 40,
  },
  empty: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 30,
    padding: 34,
  },
  emptyIcon: {
    color: colors.orange,
    fontSize: 32,
    marginBottom: 12,
  },
  message: {
    color: colors.navy,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },
  helper: {
    color: colors.slate,
    lineHeight: 20,
    marginTop: 8,
    textAlign: "center",
  },
  retry: {
    color: colors.coral,
    fontWeight: "900",
    marginTop: 14,
  },
  button: {
    backgroundColor: colors.coral,
    borderRadius: 12,
    marginTop: 24,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  buttonText: {
    color: colors.white,
    fontWeight: "900",
  },
});
