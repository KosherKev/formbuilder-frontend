import api from "./client";

export interface Theme {
  _id: string;
  id: string;
  name: string;
  description: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    accent: string;
    muted: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  backgroundImage?: string;
  backgroundGradient?: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  cardStyle: 'flat' | 'elevated' | 'glass' | 'outlined';
  isPublic: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export const themeService = {
  async getThemes(): Promise<{ success: boolean; data: Theme[] }> {
    const response = await api.get("/themes");
    return response.data;
  },

  async getTheme(id: string): Promise<{ success: boolean; data: Theme }> {
    const response = await api.get(`/themes/${id}`);
    return response.data;
  },

  async getPopularThemes(limit?: number): Promise<{ success: boolean; data: Theme[] }> {
    const response = await api.get("/themes/popular", {
      params: { limit: limit || 6 },
    });
    return response.data;
  },

  async useTheme(id: string): Promise<{ success: boolean; data: Theme }> {
    const response = await api.patch(`/themes/${id}/use`);
    return response.data;
  },

  async createTheme(data: Partial<Theme>): Promise<{ success: boolean; data: Theme }> {
    const response = await api.post("/themes", data);
    return response.data;
  },
};
