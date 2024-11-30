import axiosInstance from "../api/axios";
import toast from "react-hot-toast";
import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  isSigningUp: false,
  isCheckingAuth: true,
  isLoggingOut: false,
  isLoggingIn: false,
  signup: async (credentials) => {
    set({ isSigningUp: true });
    try {
      const response = await axiosInstance.post("/auth/signup", credentials);
      set({ user: response.data.user, isSigningUp: false });
      localStorage.setItem("accessToken", response.data.accessToken);
      toast.success("Account created successfully");
    } catch (error) {
      toast.error(error.response.data.message || "Signup failed");
      set({ isSigningUp: false, user: null });
    }
  },
  login: async (credentials) => {
    set({ isLoggingIn: true });
    try {
      const response = await axiosInstance.post("/auth/login", credentials);
      set({ user: response.data.user, isLoggingIn: false });
      localStorage.setItem("accessToken", response.data.accessToken);
    } catch (error) {
      set({ isLoggingIn: false, user: null });
      toast.error(error.response.data.message || "Login failed");
    }
  },
  logout: async () => {
    set({ isLoggingOut: true });
    try {
      await axiosInstance.post("/auth/logout");
      set({ user: null, isLoggingOut: false });
      toast.success("Logged out successfully");
    } catch (error) {
      set({ isLoggingOut: false });
      toast.error(error.response.data.message || "Logout failed");
    }
  },
  authCheck: async () => {
    set({ isCheckingAuth: true });
    const accessToken = localStorage.getItem('accessToken');
    
    try {
      if (!accessToken) {
        set({ isCheckingAuth: false, user: null });
        return;
      }

      const response = await axiosInstance.get("/auth/auth-check");
      set({ user: response.data.user, isCheckingAuth: false });
    } catch (error) {
      // Only clear user if we get an explicit auth error
      if (error.response?.status === 401) {
        set({ isCheckingAuth: false, user: null });
      } else {
        // For other errors, keep the current user state
        set({ isCheckingAuth: false });
      }
    }
  },
}));
