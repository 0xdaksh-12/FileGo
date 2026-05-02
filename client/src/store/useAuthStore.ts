import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../lib/api";

export interface User {
  name: string;
  email: string;
  profilePic?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuth: boolean;
  loading: boolean;
  initialized: boolean;
}

export interface SignInCredentials {
  email: string;
  password?: string;
}

export interface SignUpCredentials {
  name: string;
  email: string;
  password?: string;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  signin: (creds: SignInCredentials) => Promise<any>;
  signup: (creds: SignUpCredentials) => Promise<any>;
  googleAuth: (credential: string) => Promise<any>;
  logout: () => Promise<void>;
  bootstrap: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuth: false,
      loading: false,
      initialized: false,

      setUser: (user) => set({ user, isAuth: !!user }),
      setToken: (token) => set({ token }),
      setLoading: (loading) => set({ loading }),

      signin: async (creds) => {
        set({ loading: true });
        try {
          const res = await api.post("/auth/login", creds);
          const { token, user } = res.data;
          set({ token, user, isAuth: true, loading: false });
          return { success: true };
        } catch (error: any) {
          set({ loading: false });
          return {
            success: false,
            message: error.response?.data?.message || "Login failed",
          };
        }
      },

      signup: async (creds) => {
        set({ loading: true });
        try {
          const res = await api.post("/auth/register", creds);
          const { token, user } = res.data;
          set({ token, user, isAuth: true, loading: false });
          return { success: true };
        } catch (error: any) {
          set({ loading: false });
          return {
            success: false,
            message: error.response?.data?.message || "Registration failed",
          };
        }
      },

      googleAuth: async (credential) => {
        set({ loading: true });
        try {
          const res = await api.post("/auth/google", { credential });
          const { token, user } = res.data;
          set({ token, user, isAuth: true, loading: false });
          return { success: true };
        } catch (error: any) {
          set({ loading: false });
          return {
            success: false,
            message: error.response?.data?.message || "Google login failed",
          };
        }
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } finally {
          set({ user: null, token: null, isAuth: false });
        }
      },

      bootstrap: async () => {
        if (get().initialized) return;
        set({ loading: true });
        try {
          // Attempt silent refresh
          const res = await api.post("/auth/refresh");
          const { token, user } = res.data;

          if (token && user) {
            set({
              token,
              user,
              isAuth: true,
              loading: false,
              initialized: true,
            });
          } else {
             // If no token/user (e.g. 204 No Content), clear state
             set({
              token: null,
              user: null,
              isAuth: false,
              loading: false,
              initialized: true,
            });
          }
        } catch (error) {
          set({
            token: null,
            user: null,
            isAuth: false,
            loading: false,
            initialized: true,
          });
        }
      },
    }),
    {
      name: "filego-auth",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ token: state.token }),
    },
  ),
);
