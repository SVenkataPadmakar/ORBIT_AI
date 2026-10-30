"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { TokenResponse, User } from "@/types/api";

export const DEFAULT_MOCK_USER: User = {
    id: "usr-orbit-founder-001",
    email: "founder@orbit.dev",
    full_name: "Alex Vance (Founder)",
    avatar_url: "/images/orbit-idea-logo.webp",
    role: "founder",
    is_active: true,
    email_verified: true,
    created_at: "2026-10-01T08:00:00.000Z",
    updated_at: "2026-10-23T08:00:00.000Z",
};

export const DEFAULT_MOCK_SESSION: TokenResponse = {
    access_token: "mock-jwt-token-orbit-founder-session",
    token_type: "bearer",
    expires_in: 86400 * 30,
    user: DEFAULT_MOCK_USER,
};

interface AuthState {
    accessToken: string | null;
    expiresAt: number | null;
    user: User | null;
    hasHydrated: boolean;
    login: (session: TokenResponse) => void;
    setSession: (session: TokenResponse) => void;
    clearSession: () => void;
    setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: DEFAULT_MOCK_SESSION.access_token,
            expiresAt: Date.now() + DEFAULT_MOCK_SESSION.expires_in * 1000,
            user: DEFAULT_MOCK_USER,
            hasHydrated: true,
            login: (session) =>
                set({
                    accessToken: session.access_token,
                    expiresAt: Date.now() + session.expires_in * 1000,
                    user: session.user,
                    hasHydrated: true,
                }),
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
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.setHasHydrated(true);
                }
            },
        },
    ),
);
