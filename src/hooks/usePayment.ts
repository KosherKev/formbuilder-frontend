/**
 * usePayment Hook - Manage payment state and operations
 */

import { useState, useEffect, useCallback } from "react";
import { paystackService, PaymentTransaction } from "../lib/payments/paystackService";
import { subscriptionManager, PlanLimits, UsageStats } from "../lib/payments/subscriptionManager";
import type { SubscriptionPlan, Subscription } from "../lib/payments/paystackService";

export interface PaymentState {
  currentPlan: SubscriptionPlan | null;
  subscription: Subscription | null;
  allPlans: SubscriptionPlan[];
  limits: PlanLimits;
  isLoading: boolean;
  error: string | null;
}

export function usePayment() {
  const [state, setState] = useState<PaymentState>({
    currentPlan: null,
    subscription: null,
    allPlans: [],
    limits: {
      maxForms: 3,
      maxResponsesPerMonth: 300,
      maxFileUploadSize: 10,
      teamMembers: 1,
      canRemoveBranding: false,
      canUseCustomDomain: false,
      canCollectPayments: false,
      platformFeePercentage: 0,
      webhooks: 0,
      smsNotifications: 0,
      hasApiAccess: false,
      canUseWhiteLabel: false,
    },
    isLoading: true,
    error: null,
  });

  const [paymentHistory, setPaymentHistory] = useState<PaymentTransaction[]>([]);

  // Initialize
  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await subscriptionManager.init();

      const currentPlan = subscriptionManager.getCurrentPlan();
      const subscription = subscriptionManager.getCurrentSubscription();
      const allPlans = subscriptionManager.getPlans();
      const limits = subscriptionManager.getPlanLimits();

      setState({
        currentPlan,
        subscription,
        allPlans,
        limits,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to load payment data",
      }));
    }
  };

  // Subscribe to a plan
  const subscribe = useCallback(
    async (
      planId: string,
      interval: "monthly" | "annual",
      currency: "USD" | "GHS" | "NGN" | "KES",
      paymentMethod: {
        type: "mobile_money" | "card";
        network?: string;
        phoneNumber?: string;
      }
    ) => {
      try {
        const result = await paystackService.subscribe({
          planId,
          interval,
          currency,
          paymentMethod,
        });

        // Redirect to payment URL
        if (result.paymentUrl) {
          window.location.href = result.paymentUrl;
        }

        return result;
      } catch (error: any) {
        throw new Error(error.message || "Failed to subscribe");
      }
    },
    []
  );

  // Cancel subscription
  const cancelSubscription = useCallback(async (reason: string, feedback?: string) => {
    try {
      await paystackService.cancelSubscription({ reason, feedback });
      await loadPaymentData();
    } catch (error: any) {
      throw new Error(error.message || "Failed to cancel subscription");
    }
  }, []);

  // Upgrade/Downgrade subscription
  const upgradeSubscription = useCallback(async (newPlanId: string, prorated = true) => {
    try {
      await paystackService.upgradeSubscription({ newPlanId, prorated });
      await loadPaymentData();
    } catch (error: any) {
      throw new Error(error.message || "Failed to upgrade subscription");
    }
  }, []);

  // Update payment method
  const updatePaymentMethod = useCallback(
    async (data: { type: "mobile_money" | "card"; network?: string; phoneNumber?: string }) => {
      try {
        await paystackService.updatePaymentMethod(data);
        await loadPaymentData();
      } catch (error: any) {
        throw new Error(error.message || "Failed to update payment method");
      }
    },
    []
  );

  // Load payment history
  const loadPaymentHistory = useCallback(async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }) => {
    try {
      const result = await paystackService.getPaymentHistory(params);
      setPaymentHistory(result.transactions);
      return result;
    } catch (error: any) {
      throw new Error(error.message || "Failed to load payment history");
    }
  }, []);

  // Download receipt
  const downloadReceipt = useCallback(async (transactionId: string) => {
    try {
      const url = await paystackService.downloadReceipt(transactionId);

      // Trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${transactionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      throw new Error(error.message || "Failed to download receipt");
    }
  }, []);

  // Check if feature is available
  const hasFeature = useCallback(
    (feature: keyof PlanLimits) => {
      return subscriptionManager.hasFeature(feature);
    },
    [state.limits]
  );

  // Check if limit is reached
  const isLimitReached = useCallback(
    (usage: UsageStats, limit: keyof PlanLimits) => {
      return subscriptionManager.isLimitReached(usage, limit);
    },
    [state.limits]
  );

  // Get usage percentage
  const getUsagePercentage = useCallback(
    (usage: UsageStats, limit: keyof PlanLimits) => {
      return subscriptionManager.getUsagePercentage(usage, limit);
    },
    [state.limits]
  );

  // Compare plans
  const comparePlans = useCallback((currentPlanId: string, targetPlanId: string) => {
    return subscriptionManager.comparePlans(currentPlanId, targetPlanId);
  }, []);

  // Get recommended plan
  const getRecommendedPlan = useCallback((usage: UsageStats) => {
    return subscriptionManager.getRecommendedPlan(usage);
  }, []);

  return {
    ...state,
    paymentHistory,
    subscribe,
    cancelSubscription,
    upgradeSubscription,
    updatePaymentMethod,
    loadPaymentHistory,
    downloadReceipt,
    hasFeature,
    isLimitReached,
    getUsagePercentage,
    comparePlans,
    getRecommendedPlan,
    reload: loadPaymentData,
  };
}

export default usePayment;
