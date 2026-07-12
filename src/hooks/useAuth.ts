import { useSyncExternalStore } from "react";
import { subscribeAuth, getAuthProfile, type Profile } from "../auth";

/** Live account profile (null when signed out). */
export function useAuthProfile(): Profile | null {
  return useSyncExternalStore(subscribeAuth, getAuthProfile);
}
