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
      const { user, accessToken } = response.data;
      set({ user, isLoggingIn: false });
      localStorage.setItem("accessToken", accessToken);
      // The refresh token is automatically handled by the browser as an HTTP-only cookie
    } catch (error) {
      set({ isLoggingIn: false, user: null });
      localStorage.removeItem("accessToken");
      toast.error(error.response?.data?.message || "Login failed");
    }
  },
  logout: async () => {
    set({ isLoggingOut: true });
    try {
      await axiosInstance.post("/auth/logout");
      localStorage.removeItem("accessToken");
      set({ user: null, isLoggingOut: false });
      toast.success("Logged out successfully");
    } catch (error) {
      set({ isLoggingOut: false });
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },
  authCheck: async () => {
    set({ isCheckingAuth: true });
    try {
      const response = await axiosInstance.get("/auth/auth-check");
      if (response.data.user) {
        set({ user: response.data.user, isCheckingAuth: false });
        // Update access token if provided
        if (response.data.accessToken) {
          localStorage.setItem("accessToken", response.data.accessToken);
        }
      } else {
        set({ user: null, isCheckingAuth: false });
        localStorage.removeItem("accessToken");
      }
    } catch (error) {
      set({ isCheckingAuth: false, user: null });
      localStorage.removeItem("accessToken");
    }
  },
}));
