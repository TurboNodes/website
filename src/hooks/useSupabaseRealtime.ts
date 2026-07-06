import { useSupabaseRealtimeContext } from "@/components/providers/SupabaseRealtimeProvider";

export function useSupabaseRealtime() {
  return useSupabaseRealtimeContext();
}
