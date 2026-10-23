import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiNetworkError, apiFetch } from "@/lib/api/client";

const originalFetch = global.fetch;

afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
});

describe("apiFetch error contracts", () => {
    it("uses the backend application error detail", async () => {
        global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({
            error: { code: "authentication_required", detail: "Invalid email or password" },
        }), { status: 401, headers: { "Content-Type": "application/json" } }));

        await expect(apiFetch("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email: "founder@example.com", password: "wrong" }),
            skipAuth: true,
        })).rejects.toMatchObject({
            status: 401,
            code: "authentication_required",
            message: "Invalid email or password",
        });
    });

    it("turns transport failures into an actionable network error", async () => {
        global.fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

        await expect(apiFetch("/auth/login", { method: "POST", skipAuth: true }))
            .rejects.toBeInstanceOf(ApiNetworkError);
    });

    it("flattens validation details returned by FastAPI", async () => {
        global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({
            detail: [{ msg: "A valid email address is required" }, { msg: "Password is too short" }],
        }), { status: 422, headers: { "Content-Type": "application/json" } }));

        await expect(apiFetch("/auth/register", { method: "POST", skipAuth: true }))
            .rejects.toMatchObject({
                status: 422,
                code: "VALIDATION_ERROR",
                message: "A valid email address is required. Password is too short",
            });
    });
});
