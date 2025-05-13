import { ApolloClient } from "@apollo/client";
import jwtDecode from "jwt-decode";

interface DecodedToken {
  exp: number;
  userId: string;
}

interface RefreshResponse {
  accessToken: string;
}

export const getAccessToken = () => localStorage.getItem("token");
export const setAccessToken = (token: string) =>
  localStorage.setItem("token", token);
export const removeAccessToken = () => localStorage.removeItem("token");

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};

export const refreshAccessToken = async (): Promise<string> => {
  try {
    const response = await fetch("http://localhost:3000/auth/refresh", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data: RefreshResponse = await response.json();
    setAccessToken(data.accessToken);
    return data.accessToken;
  } catch (error) {
    removeAccessToken();
    window.location.href = "/login";
    throw error;
  }
};

export const handleTokenRefresh = async (client: ApolloClient<any>) => {
  const token = getAccessToken();
  if (!token) return;

  if (isTokenExpired(token)) {
    try {
      const newToken = await refreshAccessToken();
      // Reset Apollo Client store with new token
      await client.resetStore();
      return newToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      removeAccessToken();
      window.location.href = "/login";
    }
  }
};
