import apiClient from "./client";

export interface Response {
  _id: string;
  formId: string;
  answers: {
    questionId: string;
    value: any;
  }[];
  submittedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface ResponsesResponse {
  success: boolean;
  data: Response[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SubmitFormData {
  answers: {
    questionId: string;
    value: any;
  }[];
}

export const responseService = {
  // Get all responses for a form
  getResponses: async (
    formId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ResponsesResponse> => {
    const response = await apiClient.get(`/forms/${formId}/responses`, { params });
    return response.data;
  },

  // Get single response
  getResponse: async (formId: string, responseId: string): Promise<{ success: boolean; data: Response }> => {
    const response = await apiClient.get(`/forms/${formId}/responses/${responseId}`);
    return response.data;
  },

  // Submit a form (public endpoint, no auth)
  submitForm: async (formIdOrSlug: string, data: SubmitFormData): Promise<{ success: boolean; data: Response }> => {
    const response = await apiClient.post(`/forms/${formIdOrSlug}/submit`, data);
    return response.data;
  },

  // Delete response
  deleteResponse: async (formId: string, responseId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/forms/${formId}/responses/${responseId}`);
    return response.data;
  },

  // Export responses as CSV
  exportCSV: async (formId: string): Promise<Blob> => {
    const response = await apiClient.get(`/forms/${formId}/responses/export/csv`, {
      responseType: "blob",
    });
    return response.data;
  },
};
