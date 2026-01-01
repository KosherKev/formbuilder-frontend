import { create } from "zustand";
import { formService, Form } from "../api/forms";

interface FormState {
  forms: Form[];
  currentForm: Form | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchForms: (params?: any) => Promise<void>;
  fetchForm: (id: string) => Promise<void>;
  createForm: (data: any) => Promise<Form>;
  updateForm: (id: string, data: any) => Promise<void>;
  deleteForm: (id: string) => Promise<void>;
  setCurrentForm: (form: Form | null) => void;
  clearError: () => void;
}

export const useFormStore = create<FormState>((set, get) => ({
  forms: [],
  currentForm: null,
  isLoading: false,
  error: null,

  fetchForms: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await formService.getForms(params);
      set({ forms: response.data, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch forms";
      set({ error: message, isLoading: false });
    }
  },

  fetchForm: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await formService.getForm(id);
      set({ currentForm: response.data, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch form";
      set({ error: message, isLoading: false });
    }
  },

  createForm: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await formService.createForm(data);
      set((state) => ({
        forms: [response.data, ...state.forms],
        currentForm: response.data,
        isLoading: false,
      }));
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to create form";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateForm: async (id: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await formService.updateForm(id, data);
      set((state) => ({
        forms: state.forms.map((f) => (f._id === id ? response.data : f)),
        currentForm: state.currentForm?._id === id ? response.data : state.currentForm,
        isLoading: false,
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update form";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteForm: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await formService.deleteForm(id);
      set((state) => ({
        forms: state.forms.filter((f) => f._id !== id),
        currentForm: state.currentForm?._id === id ? null : state.currentForm,
        isLoading: false,
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to delete form";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  setCurrentForm: (form) => set({ currentForm: form }),
  clearError: () => set({ error: null }),
}));
