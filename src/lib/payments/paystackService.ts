/**
 * Paystack Service - Handle Paystack payment integration
 */

import api from "../api/client";

export interface PaymentInitializeData {
  formId?: string;
  responseId?: string;
  amount: number;
  currency: "GHS" | "NGN" | "KES" | "USD";
  email: string;
  phoneNumber?: string;
  metadata?: {
    formTitle?: string;
    customerName?: string;
    [key: string]: any;
  };
}

export interface PaymentInitializeResponse {
  success: boolean;
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  reference: string;
  amount: number;
  currency: string;
  status: "success" | "failed" | "pending";
  paidAt?: string;
  channel?: string;
  receipt?: {
    url: string;
    email?: string;
  };
}

export interface SubscriptionPlan {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  pricing: {
    monthly: {
      USD: number;
      GHS: number;
      NGN: number;
      KES: number;
    };
    annual: {
      USD: number;
      GHS: number;
      NGN: number;
      KES: number;
    };
  };
  features: {
    maxForms: number;
    maxResponsesPerMonth: number;
    maxFileUploadSize: number;
    teamMembers: number;
    removeBranding: boolean;
    customDomain: boolean;
    paymentCollection: boolean;
    platformFeePercentage: number;
    webhooks: number;
    smsNotifications: number;
    apiAccess: boolean;
    whiteLabel: boolean;
    priority: string;
    supportResponseTime: string;
  };
  isActive: boolean;
  sortOrder: number;
}

export interface Subscription {
  _id: string;
  userId: string;
  planId: string;
  status: "active" | "cancelled" | "expired" | "trial" | "past_due";
  billing: {
    interval: "monthly" | "annual";
    currency: string;
    amount: number;
    nextBillingDate: string;
    lastBillingDate?: string;
  };
  paymentMethod?: {
    provider: string;
    type: string;
    details?: any;
  };
  trial?: {
    isTrialing: boolean;
    trialEndsAt?: string;
  };
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  _id: string;
  userId: string;
  subscriptionId?: string;
  formId?: string;
  responseId?: string;
  type: "subscription" | "form_payment" | "donation";
  amount: number;
  currency: string;
  paymentMethod: string;
  provider: string;
  providerTransactionId: string;
  providerReference: string;
  status: "pending" | "success" | "failed" | "refunded";
  platformFee: number;
  processorFee: number;
  netAmount: number;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

class PaystackService {
  /**
   * Initialize a payment
   */
  async initializePayment(data: PaymentInitializeData): Promise<PaymentInitializeResponse> {
    try {
      const response = await api.post("/payments/initialize", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to initialize payment");
    }
  }

  /**
   * Verify a payment
   */
  async verifyPayment(reference: string): Promise<PaymentVerifyResponse> {
    try {
      const response = await api.get(`/payments/verify/${reference}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to verify payment");
    }
  }

  /**
   * Get all payment plans
   */
  async getPaymentPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await api.get("/payment-plans");
      return response.data.plans;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch payment plans");
    }
  }

  /**
   * Subscribe to a plan
   */
  async subscribe(data: {
    planId: string;
    interval: "monthly" | "annual";
    currency: "USD" | "GHS" | "NGN" | "KES";
    paymentMethod: {
      type: "mobile_money" | "card";
      network?: string;
      phoneNumber?: string;
    };
    callbackUrl?: string;
  }): Promise<{ success: boolean; authorizationUrl: string; reference: string }> {
    try {
      const response = await api.post("/subscriptions/subscribe", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to subscribe");
    }
  }

  /**
   * Get current subscription
   */
  async getCurrentSubscription(): Promise<Subscription | null> {
    try {
      const response = await api.get("/subscriptions/current");
      return response.data.subscription;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw new Error(error.response?.data?.message || "Failed to fetch subscription");
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(data: { reason: string; feedback?: string }): Promise<void> {
    try {
      await api.post("/subscriptions/cancel", data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to cancel subscription");
    }
  }

  /**
   * Upgrade/Downgrade subscription
   */
  async upgradeSubscription(data: { newPlanId: string; prorated?: boolean }): Promise<Subscription> {
    try {
      const response = await api.post("/subscriptions/upgrade", data);
      return response.data.subscription;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to upgrade subscription");
    }
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(data: {
    type: "mobile_money" | "card";
    network?: string;
    phoneNumber?: string;
  }): Promise<void> {
    try {
      await api.post("/subscriptions/payment-method", data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to update payment method");
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }): Promise<{ transactions: PaymentTransaction[]; total: number; page: number }> {
    try {
      const response = await api.get("/payments/history", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch payment history");
    }
  }

  /**
   * Download receipt
   */
  async downloadReceipt(transactionId: string): Promise<string> {
    try {
      const response = await api.get(`/receipts/${transactionId}/download`, {
        responseType: "blob",
      });

      // Create blob URL
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      return url;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to download receipt");
    }
  }

  /**
   * Send receipt
   */
  async sendReceipt(transactionId: string, methods: ("email" | "sms")[]): Promise<void> {
    try {
      await api.post("/receipts/send", { transactionId, methods });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to send receipt");
    }
  }

  /**
   * Configure form payment settings
   */
  async configureFormPayment(formId: string, settings: {
    enabled: boolean;
    type: "required" | "optional" | "donation";
    amount?: {
      fixed?: number;
      currency?: string;
      allowCustomAmount?: boolean;
      minAmount?: number;
      maxAmount?: number;
      suggestedAmounts?: number[];
    };
    receipt?: {
      sendEmail?: boolean;
      sendSMS?: boolean;
    };
  }): Promise<void> {
    try {
      await api.post(`/forms/${formId}/payment-settings`, settings);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to configure payment");
    }
  }

  /**
   * Calculate platform fee
   */
  calculatePlatformFee(amount: number, planType: "free" | "pro" | "business" | "enterprise"): number {
    const feePercentages = {
      free: 0,
      pro: 5,
      business: 3,
      enterprise: 1,
    };

    const percentage = feePercentages[planType] || 0;
    return Math.round((amount * percentage) / 100);
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number, currency: string): string {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    });

    return formatter.format(amount);
  }

  /**
   * Get supported currencies for country
   */
  getSupportedCurrencies(country?: string): Array<{ code: string; name: string; symbol: string }> {
    const currencies = [
      { code: "GHS", name: "Ghanaian Cedi", symbol: "GH₵", countries: ["GH", "Ghana"] },
      { code: "NGN", name: "Nigerian Naira", symbol: "₦", countries: ["NG", "Nigeria"] },
      { code: "KES", name: "Kenyan Shilling", symbol: "KSh", countries: ["KE", "Kenya"] },
      { code: "USD", name: "US Dollar", symbol: "$", countries: ["US", "United States"] },
    ];

    if (!country) return currencies;

    const countryCurrencies = currencies.filter((c) =>
      c.countries.some((co) => co.toLowerCase() === country.toLowerCase())
    );

    return countryCurrencies.length > 0 ? countryCurrencies : currencies;
  }

  /**
   * Get mobile money networks
   */
  getMobileMoneyNetworks(currency: string): Array<{ code: string; name: string; icon?: string }> {
    const networks: Record<string, Array<{ code: string; name: string; icon?: string }>> = {
      GHS: [
        { code: "mtn", name: "MTN Mobile Money" },
        { code: "vodafone", name: "Vodafone Cash" },
        { code: "airteltigo", name: "AirtelTigo Money" },
      ],
      NGN: [
        { code: "mtn", name: "MTN Mobile Money" },
        { code: "airtel", name: "Airtel Money" },
        { code: "9mobile", name: "9mobile" },
      ],
      KES: [
        { code: "mpesa", name: "M-Pesa" },
        { code: "airtel", name: "Airtel Money" },
      ],
    };

    return networks[currency] || [];
  }
}

// Singleton instance
export const paystackService = new PaystackService();
export default paystackService;
