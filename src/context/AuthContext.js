import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  login as loginService,
  register as registerService,
  loginWithGoogle as loginWithGoogleService,
  linkGoogle as linkGoogleService,
} from "../services/auth.service";

import {
  updateProfile as updateProfileService,
} from "../services/profile.service";

import {
  getRefreshToken,
  clearTokens,
  saveTokens,
} from "../storage/auth.storage";

import { API_URL } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const register = async (name, email, password) => {
    await registerService(name, email, password);
    const data = await loginService(email, password);
    setUser(data.user);
    return data;
  };

  const login = async (email, password) => {
    const data = await loginService(email, password);
    setUser(data.user);
    return data;
  };

  const loginWithGoogle = async (googleToken) => {
    const data = await loginWithGoogleService(googleToken);
    setUser(data.user);
    return data;
  };

  const linkGoogle = async (googleToken) => {
    const data = await linkGoogleService(googleToken);
    setUser(data.user);
    return data;
  };

  const updateUserProfile = async (name) => {
    const updatedUser = await updateProfileService(name);
    setUser(updatedUser);
    return updatedUser;
  };

  const logout = () => {
    // Sign out from the app first. This must never wait for a network request:
    // a device cannot reach localhost and a stalled request previously kept the
    // user on the Profile screen.
    setUser(null);

    // Revoke the server token and delete persisted tokens in the background.
    // Neither operation is allowed to interrupt the local sign-out transition.
    void (async () => {
      try {
        const refreshToken = await getRefreshToken();

        if (refreshToken) {
          try {
            await fetch(`${API_URL}/auth/logout`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            });
          } catch (error) {
            console.log("Logout API error:", error);
          }
        }
      } catch (error) {
        console.log("Could not read the saved session during logout:", error);
      } finally {
        try {
          await clearTokens();
        } catch (error) {
          console.log("Could not clear saved session during logout:", error);
        }
      }
    })();
  };

  const restoreSession = async () => {
    try {
      const refreshToken = await getRefreshToken();

      if (!refreshToken) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        await clearTokens();
        setUser(null);
        setIsLoading(false);
        return;
      }

      await saveTokens(data.accessToken, refreshToken);

      // Get current user
      const profileResponse = await fetch(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${data.accessToken}`,
        },
      });

      const profileData = await profileResponse.json();

      if (profileResponse.ok) {
        setUser(profileData.user);
      } else {
        await clearTokens();
        setUser(null);
      }
    } catch (error) {
      console.log("Session restore error:", error);
      await clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        register,
        logout,
        loginWithGoogle,
        linkGoogle,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
