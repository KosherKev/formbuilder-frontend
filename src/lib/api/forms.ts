import api from "./client";
import type { FormTheme } from "../themes";

export interface Form {
  _id: string;
  title: string;
  description: string;
  userId: string;
  slug: string;
  status: "draft" | "published" | "archived";
  questions: Question[];
  settings: FormSettings;
  theme: FormTheme;
  themeId?: string;
  customTheme?: Partial<FormTheme>;
  analytics: FormAnalytics;
  offlineConfig?: FormOfflineConfig;
  createdAt: string;
  updatedAt: string;
}

export interface FormOfflineConfig {
  enabled: boolean;
}

export interface Question {
  id: string;
  type:
    | "short_text"
    | "long_text"
    | "multiple_choice"
    | "checkboxes"
    | "dropdown"
    | "email"
    | "phone"
    | "number"
    | "date"
    | "file_upload";
  label: string;
  description?: string;
  required: boolean;
  placeholder?: string;
  options?: QuestionOption[];
  validation?: QuestionValidation;
  conditionalLogic?: ConditionalLogic;
  order: number;
  textStyle?: TextStyle;
}

export interface TextStyle {
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: 'tight' | 'normal' | 'relaxed' | 'loose';
}

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface QuestionValidation {
  min?: number;
  max?: number;
  pattern?: string;
  errorMessage?: string;
}

export interface ConditionalLogic {
  enabled: boolean;
  conditions: Condition[];
  action: "show" | "hide" | "jump_to";
  logicOperator?: "AND" | "OR";
  targetQuestionId?: string;
}

export interface Condition {
  questionId: string;
  operator:
    | "equals"
    | "not_equals"
    | "contains"
    | "not_contains"
    | "greater_than"
    | "less_than";
  value: any;
}

export interface FormSettings {
  isPublished: boolean;
  allowMultipleSubmissions: boolean;
  showProgressBar: boolean;
  oneQuestionPerPage: boolean;
  submitButtonText: string;
  thankYouMessage: string;
  redirectUrl?: string;
  customDomain?: string;
  startDate?: string;
  endDate?: string;
  responseLimit?: number;
  requireEmail: boolean;
  enableCaptcha: boolean;
  enableNotifications: boolean;
  notificationEmails: string[];
  enableSMSNotifications?: boolean;
  notificationPhones?: string[];
  customCSS?: string;
  webhookUrl?: string;
  webhookEvents?: string[];
}

export interface FormAnalytics {
  totalViews: number;
  totalStarts: number;
  totalSubmissions: number;
  averageCompletionTime: number;
}

export interface CreateFormData {
  title: string;
  description?: string;
  questions?: Question[];
  settings?: Partial<FormSettings>;
  theme?: Partial<FormTheme>;
  themeId?: string;
  customTheme?: Partial<FormTheme>;
}

export const formService = {
  async createForm(data: CreateFormData): Promise<{ success: boolean; data: Form }> {
    const response = await api.post("/forms", data);
    return response.data;
  },

  async getForms(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: Form[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await api.get("/forms", { params });
    return response.data;
  },

  async getForm(id: string): Promise<{ success: boolean; data: Form }> {
    const response = await api.get(`/forms/${id}`);
    return response.data;
  },

  async updateForm(id: string, data: Partial<Form>): Promise<{ success: boolean; data: Form }> {
    const response = await api.put(`/forms/${id}`, data);
    return response.data;
  },

  async deleteForm(id: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/forms/${id}`);
    return response.data;
  },

  async togglePublish(id: string): Promise<{ success: boolean; data: Form }> {
    const response = await api.patch(`/forms/${id}/publish`);
    return response.data;
  },

  async duplicateForm(id: string): Promise<{ success: boolean; data: Form }> {
    const response = await api.post(`/forms/${id}/duplicate`);
    return response.data;
  },

  async getFormAnalytics(id: string): Promise<{
    success: boolean;
    data: {
      totalViews: number;
      totalStarts: number;
      totalSubmissions: number;
      partialSubmissions: number;
      completionRate: string;
      averageCompletionTime: number;
    };
  }> {
    const response = await api.get(`/forms/${id}/analytics`);
    return response.data;
  },

  async getFormBySlug(slug: string): Promise<{ success: boolean; data: Form }> {
    const response = await api.get(`/forms/slug/${slug}`);
    return response.data;
  },
};
