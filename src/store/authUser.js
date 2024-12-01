import axiosInstance from "../api/axios";
import toast from "react-hot-toast";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isSigningUp: false,
      isCheckingAuth: false,
      isLoggingOut: false,
      isLoggingIn: false,

      setUser: (user) => set({ user }),

      signup: async (credentials) => {
        set({ isSigningUp: true });
        try {
          const response = await axiosInstance.post("/auth/signup", credentials);
          set({ user: response.data.user, isSigningUp: false });
          localStorage.setItem("accessToken", response.data.accessToken);
          toast.success("Account created successfully");
        } catch (error) {
          toast.error(error.response?.data?.message || "Signup failed");
          set({ isSigningUp: false, user: null });
        }
      },

      login: async (credentials) => {
        set({ isLoggingIn: true });
        try {
          const response = await axiosInstance.post("/auth/login", credentials);
          const { user, accessToken } = response.data;
          localStorage.setItem("accessToken", accessToken);
          set({ user, isLoggingIn: false });
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
        const currentUser = get().user;
        const accessToken = localStorage.getItem("accessToken");
        
        // If we have a user and token, consider auth valid
        if (currentUser && accessToken) {
          set({ isCheckingAuth: false });
          return;
        }
        
        // If we have a token but no user, try to fetch user
        if (accessToken) {
          try {
            const response = await axiosInstance.get("/auth/auth-check");
            if (response.data.user) {
              set({ user: response.data.user });
              if (response.data.accessToken) {
                localStorage.setItem("accessToken", response.data.accessToken);
              }
            }
          } catch (error) {
            console.error('Auth check failed:', error);
            if (error.response?.status === 401) {
              localStorage.removeItem("accessToken");
              set({ user: null });
            }
          }
        }
        
        set({ isCheckingAuth: false });
      },

      updateUser: (userData) => {
        set({ user: userData });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
