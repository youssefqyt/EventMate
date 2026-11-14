import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const BOOKMARKS_KEY = "eventmate_saved_events";

export const getSavedEventIds = async () => {
  try {
    let raw;
    if (Platform.OS === "web") {
      raw = globalThis.localStorage?.getItem(BOOKMARKS_KEY);
    } else {
      raw = await SecureStore.getItemAsync(BOOKMARKS_KEY);
    }
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const isEventSaved = async (eventId) => {
  const ids = await getSavedEventIds();
  return ids.includes(String(eventId));
};

export const toggleSaveEvent = async (eventId) => {
  const idStr = String(eventId);
  const ids = await getSavedEventIds();
  const exists = ids.includes(idStr);
  const updated = exists ? ids.filter((id) => id !== idStr) : [...ids, idStr];

  try {
    const serialized = JSON.stringify(updated);
    if (Platform.OS === "web") {
      globalThis.localStorage?.setItem(BOOKMARKS_KEY, serialized);
    } else {
      await SecureStore.setItemAsync(BOOKMARKS_KEY, serialized);
    }
  } catch (err) {
    console.log("Error saving bookmark:", err);
  }

  return !exists;
};
