import { apiRequest, throwResponseError } from "./api";
import { getAccessToken } from "../storage/auth.storage";

const authorizedRequest = async (endpoint, options = {}) =>
  apiRequest(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${await getAccessToken()}`,
      ...options.headers,
    },
  });

export async function getProfile() {
  const { response, data } = await authorizedRequest("/profile");
  if (!response.ok) throwResponseError(data, "Unable to load profile.");
  return data.user;
}

export async function updateProfile(name) {
  const { response, data } = await authorizedRequest("/profile", {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throwResponseError(data, "Unable to update profile.");
  return data.user;
}
