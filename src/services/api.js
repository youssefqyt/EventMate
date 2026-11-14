import { Platform } from "react-native";

// Android emulators cannot reach the host through localhost; browsers can.
// Set EXPO_PUBLIC_API_URL for a physical device or deployed API.
const API_URL = process.env.EXPO_PUBLIC_API_URL || (
  Platform.OS === "android" ? "http://10.0.2.2:5000/api" : "http://localhost:5000/api"
);

export const apiRequest = async (
  endpoint,
  options = {}
) => {
  let response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch (cause) {
    const error = new Error("We can’t reach EventMate right now. Check your connection and try again.");
    error.title = "Connection problem";
    error.code = "NETWORK_ERROR";
    error.cause = cause;
    throw error;
  }

  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text || "Unexpected server response" };
  }

  return {
    response,
    data,
  };
};

export const throwResponseError = (data, fallback) => {
  const apiError = data.error || {};
  const error = new Error(apiError.message || data.message || fallback);
  error.title = apiError.title || "Unable to continue";
  error.code = apiError.code || data.code;
  error.action = apiError.action;
  error.field = apiError.field;
  error.reference = apiError.reference;
  error.retryable = apiError.retryable === true;
  throw error;
};

export {
  API_URL,
};
