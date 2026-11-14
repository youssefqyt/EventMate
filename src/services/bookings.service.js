import { apiRequest, throwResponseError } from "./api";
import { getAccessToken } from "../storage/auth.storage";
import { normalizeEvent } from "./events.service";

const authorizedRequest = async (endpoint, options = {}) => apiRequest(endpoint, {
  ...options,
  headers: { Authorization: `Bearer ${await getAccessToken()}`, ...options.headers },
});

export async function getBookings() {
  const { response, data } = await authorizedRequest("/bookings");
  if (!response.ok) throwResponseError(data, "Unable to load your bookings.");
  const bookings = Array.isArray(data) ? data : data.bookings || [];
  return bookings.map((booking) => ({
    ...booking,
    id: String(booking.id || booking._id || booking.booking_id || booking.event_id || ""),
    event: normalizeEvent({
      ...booking,
      ...(booking.event || {}),
      id: booking.event?.id || booking.event?._id || booking.event_id,
      starts_at: booking.event?.starts_at || booking.starts_at,
    }),
  }));
}

export async function createBooking(eventId) {
  const { response, data } = await authorizedRequest("/bookings", {
    method: "POST",
    body: JSON.stringify({ eventId }),
  });
  if (!response.ok) throwResponseError(data, "Unable to book this event.");
  return data.booking || data;
}

export async function cancelBooking(bookingId) {
  const { response, data } = await authorizedRequest(`/bookings/${bookingId}`, {
    method: "DELETE",
  });
  if (!response.ok) throwResponseError(data, "Unable to cancel this booking.");
  return data;
}

export async function cancelBookingByEvent(eventId) {
  const { response, data } = await authorizedRequest(`/bookings/event/${eventId}`, {
    method: "DELETE",
  });
  if (!response.ok) throwResponseError(data, "Unable to cancel this booking.");
  return data;
}

export async function checkBooking(eventId) {
  try {
    const { response, data } = await authorizedRequest(`/bookings/check/${eventId}`);
    if (!response.ok) return { isBooked: false, booking: null };
    return data;
  } catch {
    return { isBooked: false, booking: null };
  }
}
