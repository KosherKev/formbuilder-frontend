/**
 * useWhatsApp Hook - Manage WhatsApp connection and messaging
 */

import { useState, useEffect, useCallback } from "react";
import { evolutionApiService, WhatsAppInstance, WhatsAppMessage, WhatsAppCampaign } from "../lib/whatsapp/evolutionApiService";

export interface WhatsAppState {
  instance: WhatsAppInstance | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  quota: {
    total: number;
    used: number;
    remaining: number;
    percentage: number;
  };
}

export function useWhatsApp() {
  const [state, setState] = useState<WhatsAppState>({
    instance: null,
    isConnected: false,
    isLoading: true,
    error: null,
    quota: {
      total: 0,
      used: 0,
      remaining: 0,
      percentage: 0,
    },
  });

  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [campaigns, setCampaigns] = useState<WhatsAppCampaign[]>([]);

  // Load WhatsApp status
  const loadStatus = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const instance = await evolutionApiService.getStatus();

      if (instance) {
        const remaining = evolutionApiService.getRemainingQuota(instance);
        const total = instance.quota.messagesPerDay === -1 ? Infinity : instance.quota.messagesPerDay;
        const used = instance.quota.messagesUsedToday;
        const percentage = total === Infinity ? 0 : Math.round((used / total) * 100);

        setState({
          instance,
          isConnected: instance.status === "connected",
          isLoading: false,
          error: null,
          quota: {
            total,
            used,
            remaining,
            percentage,
          },
        });
      } else {
        setState({
          instance: null,
          isConnected: false,
          isLoading: false,
          error: null,
          quota: {
            total: 0,
            used: 0,
            remaining: 0,
            percentage: 0,
          },
        });
      }
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to load WhatsApp status",
      }));
    }
  }, []);

  // Initialize
  useEffect(() => {
    loadStatus();

    // Poll for status updates every 30 seconds
    const interval = setInterval(loadStatus, 30000);

    return () => clearInterval(interval);
  }, [loadStatus]);

  // Connect WhatsApp
  const connect = useCallback(async (instanceName: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await evolutionApiService.connectWhatsApp({ instanceName });

      setState((prev) => ({
        ...prev,
        instance: result.instance,
        isConnected: false, // Not connected until QR is scanned
        isLoading: false,
      }));

      return result.qrCode;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to connect WhatsApp",
      }));
      throw error;
    }
  }, []);

  // Disconnect WhatsApp
  const disconnect = useCallback(async () => {
    try {
      await evolutionApiService.disconnect();
      await loadStatus();
    } catch (error: any) {
      throw new Error(error.message || "Failed to disconnect WhatsApp");
    }
  }, [loadStatus]);

  // Refresh QR code
  const refreshQR = useCallback(async () => {
    try {
      return await evolutionApiService.refreshQRCode();
    } catch (error: any) {
      throw new Error(error.message || "Failed to refresh QR code");
    }
  }, []);

  // Share form
  const shareForm = useCallback(async (data: {
    formId: string;
    recipients: Array<{
      phoneNumber: string;
      name?: string;
    }>;
    customMessage?: string;
    includePreview?: boolean;
  }) => {
    try {
      const result = await evolutionApiService.shareForm(data);
      await loadStatus(); // Refresh quota
      return result;
    } catch (error: any) {
      throw new Error(error.message || "Failed to share form");
    }
  }, [loadStatus]);

  // Send reminders
  const sendReminders = useCallback(async (data: {
    formId: string;
    customMessage?: string;
  }) => {
    try {
      const result = await evolutionApiService.sendReminders(data);
      await loadStatus(); // Refresh quota
      return result;
    } catch (error: any) {
      throw new Error(error.message || "Failed to send reminders");
    }
  }, [loadStatus]);

  // Create campaign
  const createCampaign = useCallback(async (data: {
    formId: string;
    name: string;
    type: "broadcast" | "reminder_incomplete" | "follow_up";
    recipients: Array<{
      phoneNumber: string;
      name?: string;
    }>;
    template: {
      text: string;
      includePreview: boolean;
    };
    schedule?: {
      sendAt?: string;
      timezone?: string;
    };
  }) => {
    try {
      return await evolutionApiService.createCampaign(data);
    } catch (error: any) {
      throw new Error(error.message || "Failed to create campaign");
    }
  }, []);

  // Load messages
  const loadMessages = useCallback(async (params?: {
    formId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      const result = await evolutionApiService.getMessages(params);
      setMessages(result.messages);
      return result;
    } catch (error: any) {
      throw new Error(error.message || "Failed to load messages");
    }
  }, []);

  // Load campaigns
  const loadCampaigns = useCallback(async (params?: {
    formId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      const result = await evolutionApiService.getCampaigns(params);
      setCampaigns(result.campaigns);
      return result;
    } catch (error: any) {
      throw new Error(error.message || "Failed to load campaigns");
    }
  }, []);

  // Cancel campaign
  const cancelCampaign = useCallback(async (campaignId: string) => {
    try {
      await evolutionApiService.cancelCampaign(campaignId);
      await loadCampaigns(); // Refresh list
    } catch (error: any) {
      throw new Error(error.message || "Failed to cancel campaign");
    }
  }, [loadCampaigns]);

  // Check if can send message
  const canSendMessage = useCallback(() => {
    if (!state.instance) return false;
    return evolutionApiService.canSendMessage(state.instance);
  }, [state.instance]);

  // Validate phone number
  const validatePhone = useCallback((phoneNumber: string) => {
    return evolutionApiService.validatePhoneNumber(phoneNumber);
  }, []);

  // Format phone number
  const formatPhone = useCallback((phoneNumber: string) => {
    return evolutionApiService.formatPhoneNumber(phoneNumber);
  }, []);

  return {
    ...state,
    messages,
    campaigns,
    connect,
    disconnect,
    refreshQR,
    shareForm,
    sendReminders,
    createCampaign,
    loadMessages,
    loadCampaigns,
    cancelCampaign,
    canSendMessage,
    validatePhone,
    formatPhone,
    reload: loadStatus,
  };
}

export default useWhatsApp;
