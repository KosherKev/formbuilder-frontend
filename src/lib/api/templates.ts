import apiClient from './client';

export interface TemplateQuestion {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'email' | 'phone' | 'number' | 'date' | 'file_upload';
  label: string;
  description?: string;
  required: boolean;
  placeholder?: string;
  options?: Array<{ id: string; label: string; value: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    errorMessage?: string;
  };
  order: number;
}

export interface Template {
  _id: string;
  name: string;
  description: string;
  category: 'education' | 'event' | 'business' | 'survey' | 'hr' | 'other';
  icon: string;
  themeId: string;
  questions: TemplateQuestion[];
  settings: {
    showProgressBar: boolean;
    allowMultipleSubmissions: boolean;
    submitButtonText: string;
    thankYouMessage: string;
  };
  estimatedTime: number;
  previewImage?: string;
  usageCount: number;
  isPublic: boolean;
  createdBy: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TemplateCategory {
  category: string;
  count: number;
}

export const templateService = {
  // Get all templates
  async getTemplates(params?: { category?: string; search?: string; limit?: number }) {
    return apiClient.get<{ success: boolean; count: number; data: Template[] }>('/templates', { params });
  },

  // Get templates by category
  async getTemplatesByCategory(category: string, limit?: number) {
    return apiClient.get<{ success: boolean; count: number; data: Template[] }>(
      `/templates/category/${category}`,
      { params: { limit } }
    );
  },

  // Get popular templates
  async getPopularTemplates(limit: number = 6) {
    return apiClient.get<{ success: boolean; count: number; data: Template[] }>('/templates/popular', {
      params: { limit },
    });
  },

  // Get single template
  async getTemplate(id: string) {
    return apiClient.get<{ success: boolean; data: Template }>(`/templates/${id}`);
  },

  // Increment template usage
  async incrementUsage(id: string) {
    return apiClient.patch<{ success: boolean; data: Template }>(`/templates/${id}/use`);
  },

  // Get template categories
  async getCategories() {
    return apiClient.get<{ success: boolean; data: TemplateCategory[] }>('/templates/categories/list');
  },

  // Create template (admin only)
  async createTemplate(template: Partial<Template>) {
    return apiClient.post<{ success: boolean; data: Template }>('/templates', template);
  },

  // Update template (admin only)
  async updateTemplate(id: string, updates: Partial<Template>) {
    return apiClient.patch<{ success: boolean; data: Template }>(`/templates/${id}`, updates);
  },

  // Delete template (admin only)
  async deleteTemplate(id: string) {
    return apiClient.delete<{ success: boolean; message: string }>(`/templates/${id}`);
  },
};
