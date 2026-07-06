import { useAuthContext } from "@/components/providers/AuthProvider";

export type { AuthState } from "@/components/providers/AuthProvider";

export function useAuth() {
  return useAuthContext();
}
