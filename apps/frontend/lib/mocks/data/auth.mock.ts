/**
 * apps/frontend/lib/mocks/data/auth.mock.ts
 * Realistic authentication payloads and handlers for ORBIT AI.
 */
import type {
  User,
  TokenResponse,
  LoginRequest,
  RegisterRequest,
  OtpSendRequest,
  OtpSendResponse,
  OtpVerifyRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  GoogleOAuthRequest,
} from "@/types/api";

export const MOCK_FOUNDER_USER: User = {
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

export const MOCK_TOKEN_RESPONSE: TokenResponse = {
  access_token: "mock-jwt-token-orbit-founder-session",
  token_type: "bearer",
  expires_in: 86400,
  user: MOCK_FOUNDER_USER,
};

export const mockAuthHandlers = {
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    return {
      ...MOCK_TOKEN_RESPONSE,
      user: {
        ...MOCK_FOUNDER_USER,
        email: data.email || MOCK_FOUNDER_USER.email,
      },
    };
  },

  register: async (data: RegisterRequest): Promise<TokenResponse> => {
    return {
      ...MOCK_TOKEN_RESPONSE,
      user: {
        ...MOCK_FOUNDER_USER,
        email: data.email,
        full_name: data.full_name || "New Founder",
      },
    };
  },

  refresh: async (): Promise<TokenResponse> => {
    return MOCK_TOKEN_RESPONSE;
  },

  me: async (): Promise<User> => {
    return MOCK_FOUNDER_USER;
  },

  logout: async (): Promise<{ detail: string }> => {
    return { detail: "Successfully signed out from mock session." };
  },

  sendOtp: async (data: OtpSendRequest): Promise<OtpSendResponse> => {
    return {
      detail: `Verification code sent to ${data.email}.`,
      expires_in_seconds: 300,
      dev_code: "123456",
    };
  },

  verifyOtp: async (data: OtpVerifyRequest): Promise<TokenResponse> => {
    return {
      ...MOCK_TOKEN_RESPONSE,
      user: { ...MOCK_FOUNDER_USER, email: data.email },
    };
  },

  forgotPassword: async (_data: ForgotPasswordRequest): Promise<{ detail: string }> => {
    return { detail: "Password reset instructions sent to your email." };
  },

  resetPassword: async (_data: ResetPasswordRequest): Promise<TokenResponse> => {
    return MOCK_TOKEN_RESPONSE;
  },

  googleOAuth: async (data: GoogleOAuthRequest): Promise<TokenResponse> => {
    return {
      ...MOCK_TOKEN_RESPONSE,
      user: {
        ...MOCK_FOUNDER_USER,
        email: data.email || "google-user@orbit.dev",
        full_name: data.full_name || "Google OAuth User",
        avatar_url: data.avatar_url || null,
      },
    };
  },
};
