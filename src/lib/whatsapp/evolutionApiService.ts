/**
 * Evolution API Service - WhatsApp Business API integration
 */

import api from "../api/client";

export interface WhatsAppInstance {
  _id: string;
  userId: string;
  instanceName: string;
  instanceId: string;
  phoneNumber?: string;
  status: "disconnected" | "connecting" | "connected" | "error";
  qrCode?: string;
  connectionData?: {
    lastConnected: string;
    lastDisconnected?: string;
  };
  quota: {
    messagesPerDay: number;
    messagesUsedToday: number;
    lastResetDate: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppMessage {
  _id: string;
  userId: string;
  formId: string;
  instanceId: string;
  type: "share" | "reminder" | "broadcast" | "individual";
  recipient: {
    phoneNumber: string;
    name?: string;
    responseId?: string;
  };
  messageData: {
    text: string;
    mediaUrl?: string;
    buttonText?: string;
    formLink: string;
  };
  status: "queued" | "sent" | "delivered" | "read" | "failed";
  errorDetails?: {
    code: string;
    message: string;
  };
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
}

export interface WhatsAppCampaign {
  _id: string;
  userId: string;
  formId: string;
  name: string;
  type: "broadcast" | "reminder_incomplete" | "follow_up";
  recipients: Array<{
    phoneNumber: string;
    name?: string;
    status: "pending" | "sent" | "failed";
    messageId?: string;
  }>;
  template: {
    text: string;
    includePreview: boolean;
  };
  schedule: {
    sendAt?: string;
    timezone: string;
    status: "scheduled" | "sending" | "completed" | "cancelled";
  };
  statistics: {
    totalRecipients: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    clicks: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FormWhatsAppSettings {
  enabled: boolean;
  shareConfig: {
    previewImage?: string;
    previewText?: string;
    includeStats: boolean;
  };
  reminders: {
    enabled: boolean;
    autoSend: boolean;
    delayHours: number;
    maxReminders: number;
    template: string;
  };
}

class EvolutionAPIService {
  /**
   * Initialize WhatsApp connection
   */
  async connectWhatsApp(data: {
    instanceName: string;
    evolutionApiUrl?: string;
    apiKey?: string;
  }): Promise<{ instance: WhatsAppInstance; qrCode: string }> {
    try {
      const response = await api.post("/whatsapp/connect", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to connect WhatsApp");
    }
  }

  /**
   * Get WhatsApp connection status
   */
  async getStatus(): Promise<WhatsAppInstance | null> {
    try {
      const response = await api.get("/whatsapp/status");
      return response.data.instance;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw new Error(error.response?.data?.message || "Failed to get WhatsApp status");
    }
  }

  /**
   * Disconnect WhatsApp
   */
  async disconnect(): Promise<void> {
    try {
      await api.post("/whatsapp/disconnect");
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to disconnect WhatsApp");
    }
  }

  /**
   * Refresh QR code
   */
  async refreshQRCode(): Promise<string> {
    try {
      const response = await api.post("/whatsapp/refresh-qr");
      return response.data.qrCode;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to refresh QR code");
    }
  }

  /**
   * Share form via WhatsApp
   */
  async shareForm(data: {
    formId: string;
    recipients: Array<{
      phoneNumber: string;
      name?: string;
    }>;
    customMessage?: string;
    includePreview?: boolean;
  }): Promise<{
    messagesSent: number;
    messagesFailed: number;
    details: Array<{
      phoneNumber: string;
      status: "sent" | "failed";
      messageId?: string;
      error?: string;
    }>;
  }> {
    try {
      const response = await api.post("/whatsapp/share-form", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to share form");
    }
  }

  /**
   * Get form WhatsApp preview
   */
  async getFormPreview(formId: string): Promise<{
    title: string;
    description: string;
    imageUrl?: string;
    questionCount: number;
    estimatedTime: number;
    link: string;
  }> {
    try {
      const response = await api.get(`/forms/${formId}/whatsapp-preview`);
      return response.data.preview;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get form preview");
    }
  }

  /**
   * Send reminders to incomplete respondents
   */
  async sendReminders(data: {
    formId: string;
    type?: "manual" | "auto";
    filter?: {
      startedAfter?: string;
      notCompletedBefore?: string;
    };
    customMessage?: string;
  }): Promise<{
    remindersQueued: number;
    estimatedSendTime: string;
  }> {
    try {
      const response = await api.post("/whatsapp/send-reminders", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to send reminders");
    }
  }

  /**
   * Configure form WhatsApp settings
   */
  async configureFormSettings(
    formId: string,
    settings: FormWhatsAppSettings
  ): Promise<void> {
    try {
      await api.post(`/forms/${formId}/whatsapp-settings`, settings);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to configure WhatsApp settings");
    }
  }

  /**
   * Create campaign
   */
  async createCampaign(data: {
    formId: string;
    name: string;
    type: "broadcast" | "reminder_incomplete" | "follow_up";
    recipients: Array<{
      phoneNumber: string;
      name?: string;
      customData?: any;
    }>;
    template: {
      text: string;
      includePreview: boolean;
    };
    schedule?: {
      sendAt?: string;
      timezone?: string;
    };
  }): Promise<WhatsAppCampaign> {
    try {
      const response = await api.post("/whatsapp/campaigns/create", data);
      return response.data.campaign;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to create campaign");
    }
  }

  /**
   * Get all campaigns
   */
  async getCampaigns(params?: {
    formId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    campaigns: WhatsAppCampaign[];
    total: number;
    page: number;
  }> {
    try {
      const response = await api.get("/whatsapp/campaigns", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get campaigns");
    }
  }

  /**
   * Get campaign details
   */
  async getCampaign(campaignId: string): Promise<WhatsAppCampaign> {
    try {
      const response = await api.get(`/whatsapp/campaigns/${campaignId}`);
      return response.data.campaign;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get campaign");
    }
  }

  /**
   * Cancel campaign
   */
  async cancelCampaign(campaignId: string): Promise<void> {
    try {
      await api.post(`/whatsapp/campaigns/${campaignId}/cancel`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to cancel campaign");
    }
  }

  /**
   * Get message history
   */
  async getMessages(params?: {
    formId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    messages: WhatsAppMessage[];
    total: number;
    page: number;
  }> {
    try {
      const response = await api.get("/whatsapp/messages", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get messages");
    }
  }

  /**
   * Get message details
   */
  async getMessage(messageId: string): Promise<WhatsAppMessage> {
    try {
      const response = await api.get(`/whatsapp/messages/${messageId}`);
      return response.data.message;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get message");
    }
  }

  /**
   * Validate phone number
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    // Remove all non-digit characters except +
    const cleaned = phoneNumber.replace(/[^\d+]/g, "");

    // Should start with + and have 10-15 digits
    const phoneRegex = /^\+\d{10,15}$/;
    return phoneRegex.test(cleaned);
  }

  /**
   * Format phone number for display
   */
  formatPhoneNumber(phoneNumber: string): string {
    // Remove + and spaces
    const cleaned = phoneNumber.replace(/[^\d]/g, "");

    // Format based on country code
    if (cleaned.startsWith("233")) {
      // Ghana: +233 XX XXX XXXX
      return `+233 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    } else if (cleaned.startsWith("234")) {
      // Nigeria: +234 XXX XXX XXXX
      return `+234 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
    } else if (cleaned.startsWith("254")) {
      // Kenya: +254 XXX XXX XXX
      return `+254 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
    }

    // Default formatting
    return `+${cleaned}`;
  }

  /**
   * Get quota limits by plan
   */
  getQuotaByPlan(planName: string): number {
    const quotas: Record<string, number> = {
      Free: 0,
      Pro: 1000,
      Business: 5000,
      Enterprise: -1, // unlimited
    };

    return quotas[planName] || 0;
  }

  /**
   * Check if quota available
   */
  canSendMessage(instance: WhatsAppInstance): boolean {
    if (instance.quota.messagesPerDay === -1) return true; // unlimited
    return instance.quota.messagesUsedToday < instance.quota.messagesPerDay;
  }

  /**
   * Get remaining quota
   */
  getRemainingQuota(instance: WhatsAppInstance): number {
    if (instance.quota.messagesPerDay === -1) return Infinity;
    return Math.max(0, instance.quota.messagesPerDay - instance.quota.messagesUsedToday);
  }

  /**
   * Generate default message template
   */
  getDefaultShareMessage(formTitle: string, formLink: string): string {
    return `Hi! 👋\n\nI'd like you to fill out this form:\n\n*${formTitle}*\n\n${formLink}\n\nThank you!`;
  }

  /**
   * Generate reminder template
   */
  getDefaultReminderMessage(formTitle: string, formLink: string, recipientName?: string): string {
    const greeting = recipientName ? `Hi ${recipientName}` : "Hi";
    return `${greeting}! 👋\n\nJust a friendly reminder to complete this form:\n\n*${formTitle}*\n\n${formLink}\n\nThank you!`;
  }
}

// Singleton instance
export const evolutionApiService = new EvolutionAPIService();
export default evolutionApiService;
