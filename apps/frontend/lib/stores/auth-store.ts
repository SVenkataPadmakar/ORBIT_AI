"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { TokenResponse, User } from "@/types/api";

interface AuthState {
    accessToken: string | null;
    expiresAt: number | null;
    user: User | null;
    hasHydrated: boolean;
    setSession: (session: TokenResponse) => void;
    clearSession: () => void;
    setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            expiresAt: null,
            user: null,
            hasHydrated: false,
            setSession: (session) =>
                set({
                    accessToken: session.access_token,
                    expiresAt: Date.now() + session.expires_in * 1000,
                    user: session.user,
                    hasHydrated: true,
                }),
            clearSession: () => set({ accessToken: null, expiresAt: null, user: null }),
            setHasHydrated: (hasHydrated) => set({ hasHydrated }),
        }),
        {
            name: "asc-session",
            storage: createJSONStorage(() => localStorage),
            partialize: ({ accessToken, expiresAt, user }) => ({ accessToken, expiresAt, user }),
            onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
        },
    ),
);
