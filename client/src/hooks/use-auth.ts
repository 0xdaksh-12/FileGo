import { useAuthStore } from "@/store/useAuthStore";

export default function useAuth() {
  const store = useAuthStore();
  return store;
}
