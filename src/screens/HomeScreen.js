import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { getEvents } from "../services/events.service";
import { getBookings } from "../services/bookings.service";
import { categories } from "../data/events";
import { colors } from "../theme/colors";

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [fetchedEvents, fetchedBookings] = await Promise.all([
        getEvents().catch(() => []),
        getBookings().catch(() => []),
      ]);
      setEvents(fetchedEvents);
      setBookings(fetchedBookings);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const firstName = user?.name ? user.name.split(" ")[0] : "there";
  const nextBooking = bookings.length > 0 ? bookings[0] : null;
  const featuredEvents = events.slice(0, 4);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => {
            setLoading(true);
            loadData();
          }}
          tintColor={colors.coral}
        />
      }
    >
      {/* Hero Header */}
      <View style={styles.hero}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.greetingKicker}>WELCOME BACK</Text>
            <Text style={styles.greeting}>Hey, {firstName} 👋</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate("Profile")}
            style={styles.avatarBtn}
          >
            <Text style={styles.avatarText}>
              {(user?.name || user?.email || "E").charAt(0).toUpperCase()}
            </Text>
          </Pressable>
        </View>
        <Text style={styles.heroSub}>
          Discover vibrant gatherings, intimate workshops, and local culture.
        </Text>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Pressable
            onPress={() => navigation.navigate("Bookings")}
            style={styles.statBox}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.orange} />
            <Text style={styles.statNumber}>{bookings.length}</Text>
            <Text style={styles.statLabel}>My Bookings</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("Events")}
            style={styles.statBox}
          >
            <Ionicons name="sparkles-outline" size={20} color={colors.coral} />
            <Text style={styles.statNumber}>{events.length}</Text>
            <Text style={styles.statLabel}>Upcoming Events</Text>
          </Pressable>
        </View>
      </View>

      {/* Next Up / Active Booking Highlight */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Next on your calendar</Text>
        {nextBooking ? (
          <Pressable
            onPress={() =>
              navigation.navigate("EventDetails", { event: nextBooking.event })
            }
            style={styles.highlightCard}
          >
            <View style={styles.highlightBadge}>
              <Text style={styles.highlightBadgeText}>CONFIRMED RESERVATION</Text>
            </View>
            <Text style={styles.highlightTitle}>{nextBooking.event.title}</Text>
            <View style={styles.highlightMeta}>
              <Ionicons name="time-outline" size={15} color={colors.slate} />
              <Text style={styles.highlightMetaText}>
                {nextBooking.event.date} · {nextBooking.event.time}
              </Text>
            </View>
            <View style={styles.highlightMeta}>
              <Ionicons name="location-outline" size={15} color={colors.slate} />
              <Text style={styles.highlightMetaText}>
                {nextBooking.event.location}
              </Text>
            </View>
            <View style={styles.highlightAction}>
              <Text style={styles.highlightActionText}>View ticket details →</Text>
            </View>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => navigation.navigate("Events")}
            style={styles.emptyHighlight}
          >
            <Ionicons name="ticket-outline" size={28} color={colors.orange} />
            <View style={styles.emptyHighlightCopy}>
              <Text style={styles.emptyHighlightTitle}>No plans booked yet</Text>
              <Text style={styles.emptyHighlightSub}>
                Find something fun to look forward to this week!
              </Text>
            </View>
            <Text style={styles.emptyHighlightArrow}>→</Text>
          </Pressable>
        )}
      </View>

      {/* Explore Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Browse by vibe</Text>
          <Pressable onPress={() => navigation.navigate("Events")}>
            <Text style={styles.seeAllText}>See all</Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {categories.filter((c) => c !== "All").map((category) => (
            <Pressable
              key={category}
              onPress={() =>
                navigation.navigate("Events", { initialCategory: category })
              }
              style={styles.categoryChip}
            >
              <Text style={styles.categoryChipText}>{category}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Featured Events */}
      <View style={[styles.section, { marginBottom: 30 }]}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Trending events</Text>
          <Pressable onPress={() => navigation.navigate("Events")}>
            <Text style={styles.seeAllText}>Explore all</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.coral} style={{ marginVertical: 20 }} />
        ) : (
          featuredEvents.map((event) => (
            <Pressable
              key={event.id}
              onPress={() => navigation.navigate("EventDetails", { event })}
              style={styles.featuredCard}
            >
              <View
                style={[
                  styles.featuredDate,
                  { backgroundColor: event.accent || colors.coral },
                ]}
              >
                <Text style={styles.featuredDay}>{event.day}</Text>
                <Text style={styles.featuredMonth}>{event.month}</Text>
              </View>
              <View style={styles.featuredBody}>
                <Text style={[styles.featuredCategory, { color: event.accent || colors.coral }]}>
                  {event.category}
                </Text>
                <Text numberOfLines={1} style={styles.featuredEventTitle}>
                  {event.title}
                </Text>
                <Text style={styles.featuredDetail}>
                  {event.time}  ·  {event.location}
                </Text>
              </View>
              <Text style={styles.featuredPrice}>{event.price}</Text>
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cream,
    flexGrow: 1,
    paddingBottom: 90,
  },
  hero: {
    backgroundColor: colors.navy,
    borderBottomRightRadius: 36,
    paddingBottom: 28,
    paddingHorizontal: 22,
    paddingTop: 60,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  greetingKicker: {
    color: colors.orange,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  greeting: {
    color: colors.white,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
    marginTop: 6,
  },
  avatarBtn: {
    alignItems: "center",
    backgroundColor: colors.coral,
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  avatarText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "900",
  },
  heroSub: {
    color: "#CBD2E8",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  statBox: {
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    padding: 14,
  },
  statNumber: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 8,
  },
  statLabel: {
    color: "#CBD2E8",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  section: {
    marginTop: 26,
    paddingHorizontal: 22,
  },
  sectionHead: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    color: colors.navy,
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 12,
  },
  seeAllText: {
    color: colors.coral,
    fontSize: 13,
    fontWeight: "800",
  },
  highlightCard: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  highlightBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E2F6EE",
    borderRadius: 6,
    marginBottom: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  highlightBadgeText: {
    color: "#18804E",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  highlightTitle: {
    color: colors.navy,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8,
  },
  highlightMeta: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 5,
  },
  highlightMetaText: {
    color: colors.slate,
    fontSize: 13,
    marginLeft: 7,
  },
  highlightAction: {
    borderTopColor: colors.line,
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 12,
  },
  highlightActionText: {
    color: colors.coral,
    fontSize: 13,
    fontWeight: "800",
  },
  emptyHighlight: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    padding: 16,
  },
  emptyHighlightCopy: {
    flex: 1,
    marginLeft: 14,
  },
  emptyHighlightTitle: {
    color: colors.navy,
    fontSize: 15,
    fontWeight: "800",
  },
  emptyHighlightSub: {
    color: colors.slate,
    fontSize: 12,
    marginTop: 2,
  },
  emptyHighlightArrow: {
    color: colors.coral,
    fontSize: 20,
    fontWeight: "900",
  },
  categoryScroll: {
    marginHorizontal: -22,
    paddingHorizontal: 22,
  },
  categoryChip: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  categoryChipText: {
    color: colors.navy,
    fontSize: 13,
    fontWeight: "800",
  },
  featuredCard: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 10,
    padding: 12,
  },
  featuredDate: {
    alignItems: "center",
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  featuredDay: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 20,
  },
  featuredMonth: {
    color: colors.white,
    fontSize: 9,
    fontWeight: "800",
  },
  featuredBody: {
    flex: 1,
    marginHorizontal: 12,
  },
  featuredCategory: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  featuredEventTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 2,
  },
  featuredDetail: {
    color: colors.slate,
    fontSize: 11,
    marginTop: 4,
  },
  featuredPrice: {
    color: colors.navy,
    fontSize: 13,
    fontWeight: "800",
  },
});
