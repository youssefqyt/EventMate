import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EventCard from "../components/EventCard";
import { categories } from "../data/events";
import { getEvents } from "../services/events.service";
import { getSavedEventIds, toggleSaveEvent } from "../storage/bookmarks.storage";
import { colors } from "../theme/colors";

export default function EventsScreen({ navigation, route }) {
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(route.params?.initialCategory || "All");
  const [search, setSearch] = useState("");
  const [savedIds, setSavedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Update selected if navigated with initialCategory
  useEffect(() => {
    if (route.params?.initialCategory) {
      setSelected(route.params.initialCategory);
    }
  }, [route.params?.initialCategory]);

  const load = useCallback(async () => {
    setError("");
    try {
      const [fetchedEvents, saved] = await Promise.all([
        getEvents({ category: selected, search }),
        getSavedEventIds(),
      ]);
      setEvents(fetchedEvents);
      setSavedIds(saved);
    } catch (err) {
      setError(err.message || "Failed to load events.");
    } finally {
      setLoading(false);
    }
  }, [selected, search]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggleSave = async (eventId) => {
    await toggleSaveEvent(eventId);
    const updated = await getSavedEventIds();
    setSavedIds(updated);
  };

  const visible = events.filter((event) => {
    const matchesCategory =
      selected === "All" ||
      event.category?.toLowerCase() === selected.toLowerCase();

    if (!search.trim()) return matchesCategory;

    const q = search.trim().toLowerCase();
    const matchesSearch =
      event.title?.toLowerCase().includes(q) ||
      event.description?.toLowerCase().includes(q) ||
      event.location?.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

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
      {/* Hero Header */}
      <View style={styles.hero}>
        <Text style={styles.hello}>MAKE YOUR WEEK COUNT</Text>
        <Text style={styles.title}>Find a reason{"\n"}to go out.</Text>
        <Text style={styles.heroText}>
          Thoughtful local plans, right when you need one.
        </Text>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={19} color={colors.slate} style={styles.searchIcon} />
          <TextInput
            accessibilityLabel="Search events"
            value={search}
            onChangeText={setSearch}
            placeholder="Search events, workshops, venues..."
            placeholderTextColor="#8F9BB3"
            style={styles.searchInput}
            clearButtonMode="while-editing"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.slate} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Category Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        contentContainerStyle={styles.filterContent}
      >
        {categories.map((category) => (
          <Pressable
            key={category}
            onPress={() => setSelected(category)}
            style={[styles.chip, selected === category && styles.chipActive]}
          >
            <Text
              style={[
                styles.chipText,
                selected === category && styles.chipTextActive,
              ]}
            >
              {category}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Section Head */}
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>
          {search.trim() ? "Search results" : "Happening soon"}
        </Text>
        <Text style={styles.count}>{visible.length} EVENTS</Text>
      </View>

      {/* Content States */}
      {loading ? (
        <ActivityIndicator color={colors.coral} size="large" style={styles.state} />
      ) : error ? (
        <View style={styles.state}>
          <Text style={styles.stateTitle}>We couldn’t load events.</Text>
          <Text style={styles.stateText}>{error}</Text>
          <Pressable
            onPress={() => {
              setLoading(true);
              load();
            }}
          >
            <Text style={styles.retry}>Try again</Text>
          </Pressable>
        </View>
      ) : visible.length > 0 ? (
        visible.map((event) => (
          <View key={event.id} style={styles.cardWrapper}>
            <EventCard
              event={event}
              isSaved={savedIds.includes(String(event.id))}
              onToggleSave={handleToggleSave}
              onPress={() => navigation.navigate("EventDetails", { event })}
            />
          </View>
        ))
      ) : (
        <View style={styles.state}>
          <Text style={styles.stateTitle}>No events found.</Text>
          <Text style={styles.stateText}>
            {search.trim()
              ? `No events match "${search}". Try another keyword or clear search.`
              : "Try another category or check back soon."}
          </Text>
          {search.trim() ? (
            <Pressable onPress={() => setSearch("")} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Clear search</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.cream,
    flexGrow: 1,
    paddingBottom: 110,
  },
  hero: {
    backgroundColor: colors.navy,
    borderBottomRightRadius: 38,
    paddingBottom: 31,
    paddingHorizontal: 22,
    paddingTop: 62,
  },
  hello: {
    color: colors.orange,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  title: {
    color: colors.white,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -1.5,
    lineHeight: 38,
    marginTop: 10,
  },
  heroText: {
    color: "#CBD2E8",
    fontSize: 14,
    marginTop: 10,
  },
  searchBox: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 14,
    flexDirection: "row",
    marginTop: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    color: colors.ink,
    flex: 1,
    fontSize: 14,
    paddingVertical: 2,
  },
  filters: {
    marginTop: 20,
  },
  filterContent: {
    paddingHorizontal: 22,
  },
  chip: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 9,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  chipActive: {
    backgroundColor: colors.coral,
    borderColor: colors.coral,
  },
  chipText: {
    color: colors.slate,
    fontSize: 13,
    fontWeight: "800",
  },
  chipTextActive: {
    color: colors.white,
  },
  sectionHead: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 13,
    marginTop: 26,
    paddingHorizontal: 22,
  },
  sectionTitle: {
    color: colors.navy,
    fontSize: 19,
    fontWeight: "900",
  },
  count: {
    color: colors.slate,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  cardWrapper: {
    paddingHorizontal: 22,
  },
  state: {
    alignItems: "center",
    padding: 40,
  },
  stateTitle: {
    color: colors.navy,
    fontSize: 17,
    fontWeight: "900",
  },
  stateText: {
    color: colors.slate,
    marginTop: 6,
    textAlign: "center",
  },
  retry: {
    color: colors.coral,
    fontWeight: "900",
    marginTop: 14,
  },
  clearBtn: {
    backgroundColor: colors.coral,
    borderRadius: 10,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  clearBtnText: {
    color: colors.white,
    fontWeight: "900",
  },
});
