import api from "./client";

export interface User {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro" | "business";
  planLimits: {
    maxForms: number;
    maxResponsesPerForm: number;
    maxFileUploadSize: number;
    customDomain: boolean;
    removeBranding: boolean;
    teamMembers: number;
  };
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  async getMe(): Promise<{ success: boolean; data: User }> {
    const response = await api.get("/auth/me");
    return response.data;
  },

  async logout(): Promise<void> {
    await api.get("/auth/logout");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
