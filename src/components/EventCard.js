import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

export default function EventCard({
  event,
  onPress,
  isBooked,
  isSaved,
  onToggleSave,
  actionLabel,
  onAction,
  actionLoading,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.date, { backgroundColor: event.accent || colors.coral }]}>
        <Text style={styles.day}>{event.day}</Text>
        <Text style={styles.month}>{event.month}</Text>
      </View>

      <View style={styles.copy}>
        <View style={styles.topMeta}>
          <Text style={[styles.category, { color: event.accent || colors.coral }]}>
            {event.category}
          </Text>
          {isBooked && (
            <View style={styles.bookedBadge}>
              <Text style={styles.bookedText}>Booked ✓</Text>
            </View>
          )}
        </View>

        <Text numberOfLines={2} style={styles.title}>
          {event.title}
        </Text>
        <Text numberOfLines={1} style={styles.detail}>
          {event.time}  ·  {event.location}
        </Text>

        {event.spots_left != null && event.spots_left > 0 && event.spots_left <= 10 && (
          <Text style={styles.spotsWarning}>
            ⚡ Only {event.spots_left} spot{event.spots_left === 1 ? "" : "s"} left
          </Text>
        )}
        {event.spots_left === 0 && (
          <Text style={styles.soldOutText}>Sold out</Text>
        )}
      </View>

      <View style={styles.right}>
        <Text style={styles.price}>{event.price}</Text>

        {onToggleSave && (
          <Pressable
            hitSlop={8}
            onPress={(e) => {
              e.stopPropagation?.();
              onToggleSave(event.id);
            }}
            style={styles.saveBtn}
          >
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={18}
              color={isSaved ? colors.coral : colors.slate}
            />
          </Pressable>
        )}

        {actionLabel && (
          <Pressable
            disabled={actionLoading}
            hitSlop={6}
            onPress={(e) => {
              e.stopPropagation?.();
              onAction && onAction();
            }}
            style={styles.actionBtn}
          >
            <Text style={styles.actionBtnText}>{actionLabel}</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 12,
    padding: 14,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  date: {
    alignItems: "center",
    borderRadius: 14,
    justifyContent: "center",
    height: 58,
    width: 58,
  },
  day: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 24,
  },
  month: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  copy: {
    flex: 1,
    marginHorizontal: 13,
  },
  topMeta: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 3,
  },
  category: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  bookedBadge: {
    backgroundColor: "#E2F6EE",
    borderRadius: 6,
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  bookedText: {
    color: "#18804E",
    fontSize: 9,
    fontWeight: "900",
  },
  title: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 20,
  },
  detail: {
    color: colors.slate,
    fontSize: 12,
    marginTop: 5,
  },
  spotsWarning: {
    color: colors.orange,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
  },
  soldOutText: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 4,
  },
  right: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  price: {
    color: colors.navy,
    fontSize: 14,
    fontWeight: "800",
  },
  saveBtn: {
    marginTop: 8,
    padding: 4,
  },
  actionBtn: {
    backgroundColor: "#FFEBE8",
    borderRadius: 8,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionBtnText: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: "800",
  },
});
