import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY =
  "eventmate_access_token";

const REFRESH_TOKEN_KEY =
  "eventmate_refresh_token";


export const saveTokens = async (
  accessToken,
  refreshToken
) => {

  if (Platform.OS === "web") {
    globalThis.localStorage?.setItem(ACCESS_TOKEN_KEY, accessToken);
    globalThis.localStorage?.setItem(REFRESH_TOKEN_KEY, refreshToken);
    return;
  }

  await SecureStore.setItemAsync(
    ACCESS_TOKEN_KEY,
    accessToken
  );

  await SecureStore.setItemAsync(
    REFRESH_TOKEN_KEY,
    refreshToken
  );
};


export const getAccessToken = async () => {
  if (Platform.OS === "web") {
    return globalThis.localStorage?.getItem(ACCESS_TOKEN_KEY) ?? null;
  }

  return await SecureStore.getItemAsync(
    ACCESS_TOKEN_KEY
  );
};


export const getRefreshToken = async () => {
  if (Platform.OS === "web") {
    return globalThis.localStorage?.getItem(REFRESH_TOKEN_KEY) ?? null;
  }

  return await SecureStore.getItemAsync(
    REFRESH_TOKEN_KEY
  );
};


export const clearTokens = async () => {

  if (Platform.OS === "web") {
    globalThis.localStorage?.removeItem(ACCESS_TOKEN_KEY);
    globalThis.localStorage?.removeItem(REFRESH_TOKEN_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(
    ACCESS_TOKEN_KEY
  );

  await SecureStore.deleteItemAsync(
    REFRESH_TOKEN_KEY
  );
};
