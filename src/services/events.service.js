import { apiRequest, throwResponseError } from "./api";
import { events as fallbackEvents } from "../data/events";

const categoryAccents = {
  Social: "#F5654A",
  Workshop: "#FF9D4D",
  Music: "#455DAB",
  Wellness: "#4C9A7D",
  Culture: "#7056A3",
};

export const normalizeEvent = (event = {}) => {
  const rawDate = event.date || event.startDate || event.starts_at;
  const parsedDate = rawDate ? new Date(rawDate) : null;
  const usableDate = parsedDate && !Number.isNaN(parsedDate.getTime());
  const category = event.category || "Event";

  return {
    ...event,
    id: String(event.id || event._id || event.event_id || ""),
    title: event.title || event.name || "Untitled event",
    category,
    date: usableDate
      ? parsedDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }).toUpperCase()
      : rawDate || "DATE TBD",
    day: usableDate ? String(parsedDate.getDate()) : event.day || "—",
    month: usableDate ? parsedDate.toLocaleDateString("en-GB", { month: "short" }).toUpperCase() : event.month || "",
    time: event.time || event.startTime || (usableDate ? parsedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Time to be confirmed"),
    location: event.location || event.venue || "Location to be confirmed",
    price: event.price != null ? (String(event.price).startsWith("€") ? event.price : `€${event.price}`) : (event.priceLabel || "Free"),
    accent: event.accent || categoryAccents[category] || "#F5654A",
    spots_left: event.spots_left != null ? Number(event.spots_left) : null,
    capacity: event.capacity != null ? Number(event.capacity) : null,
  };
};

export async function getEvents(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== "All") {
      params.append("category", filters.category);
    }
    if (filters.search && filters.search.trim()) {
      params.append("search", filters.search.trim());
    }

    const queryStr = params.toString() ? `?${params.toString()}` : "";
    const { response, data } = await apiRequest(`/events${queryStr}`);

    if (response.ok) {
      const list = Array.isArray(data) ? data : data.events || [];
      return list.map(normalizeEvent);
    }
    throwResponseError(data, "Unable to load events.");
  } catch (err) {
    // Fallback to sample events if API is unavailable
    if (fallbackEvents && fallbackEvents.length > 0) {
      let filtered = fallbackEvents.map(normalizeEvent);
      if (filters.category && filters.category !== "All") {
        filtered = filtered.filter((e) => e.category?.toLowerCase() === filters.category.toLowerCase());
      }
      if (filters.search && filters.search.trim()) {
        const q = filters.search.trim().toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.title?.toLowerCase().includes(q) ||
            e.description?.toLowerCase().includes(q) ||
            e.location?.toLowerCase().includes(q)
        );
      }
      return filtered;
    }
    throw err;
  }
}

export async function getEventById(id) {
  try {
    const { response, data } = await apiRequest(`/events/${id}`);
    if (response.ok && data.event) {
      return normalizeEvent(data.event);
    }
  } catch {
    // Check fallback
    const found = fallbackEvents.find((e) => String(e.id) === String(id));
    if (found) return normalizeEvent(found);
  }
  return null;
}
