import { create } from "zustand";

const API_BASE_URL = import.meta.env.VITE_API_BASE + "/api/auth";

const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: false,
  isCheckingAuth: true,

  // Sign up function
  signup: async (userData) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include", // Important for cookies
      });

      const data = await response.json();

      if (response.ok) {
        set({ user: data, isLoading: false });
        return { success: true };
      } else {
        set({ isLoading: false });
        return { success: false, message: data.message };
      }
    } catch (error) {
      set({ isLoading: false });
      return { success: false, message: "Network error occurred" };
    }
  },

  // Login function
  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        set({ user: data, isLoading: false });
        return { success: true };
      } else {
        set({ isLoading: false });
        return { success: false, message: data.message };
      }
    } catch (error) {
      set({ isLoading: false });
      return { success: false, message: "Network error occurred" };
    }
  },

  // Logout function
  logout: async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
      set({ user: null });
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear user on frontend even if request fails
      set({ user: null });
    }
  },

  // Check authentication status
  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        set({ user: data.user, isCheckingAuth: false });
      } else {
        set({ user: null, isCheckingAuth: false });
      }
    } catch (error) {
      console.error("Auth check error:", error);
      set({ user: null, isCheckingAuth: false });
    }
  },
}));

export default useAuthStore;
