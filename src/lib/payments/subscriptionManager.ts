/**
 * Subscription Manager - Handle subscription lifecycle and plan limits
 */

import { paystackService, SubscriptionPlan, Subscription } from "./paystackService";

export interface PlanLimits {
  maxForms: number;
  maxResponsesPerMonth: number;
  maxFileUploadSize: number;
  teamMembers: number;
  canRemoveBranding: boolean;
  canUseCustomDomain: boolean;
  canCollectPayments: boolean;
  platformFeePercentage: number;
  webhooks: number;
  smsNotifications: number;
  hasApiAccess: boolean;
  canUseWhiteLabel: boolean;
}

export interface UsageStats {
  formsCreated: number;
  responsesThisMonth: number;
  smsUsedThisMonth: number;
  lastResetDate: string;
}

export interface PlanComparison {
  current: SubscriptionPlan;
  target: SubscriptionPlan;
  priceChange: number;
  features: {
    added: string[];
    removed: string[];
    improved: string[];
  };
}

class SubscriptionManager {
  private currentPlan: SubscriptionPlan | null = null;
  private currentSubscription: Subscription | null = null;
  private allPlans: SubscriptionPlan[] = [];

  /**
   * Initialize subscription manager
   */
  async init(): Promise<void> {
    try {
      // Load all plans
      this.allPlans = await paystackService.getPaymentPlans();

      // Load current subscription
      this.currentSubscription = await paystackService.getCurrentSubscription();

      // Set current plan
      if (this.currentSubscription) {
        this.currentPlan =
          this.allPlans.find((p) => p._id === this.currentSubscription!.planId) || null;
      } else {
        // Default to free plan
        this.currentPlan = this.allPlans.find((p) => p.name === "Free") || null;
      }
    } catch (error) {
      console.error("Failed to initialize subscription manager:", error);
    }
  }

  /**
   * Get all available plans
   */
  getPlans(): SubscriptionPlan[] {
    return this.allPlans.filter((p) => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /**
   * Get current plan
   */
  getCurrentPlan(): SubscriptionPlan | null {
    return this.currentPlan;
  }

  /**
   * Get current subscription
   */
  getCurrentSubscription(): Subscription | null {
    return this.currentSubscription;
  }

  /**
   * Get plan by ID
   */
  getPlanById(planId: string): SubscriptionPlan | null {
    return this.allPlans.find((p) => p._id === planId) || null;
  }

  /**
   * Get plan by name
   */
  getPlanByName(name: string): SubscriptionPlan | null {
    return this.allPlans.find((p) => p.name.toLowerCase() === name.toLowerCase()) || null;
  }

  /**
   * Get plan limits
   */
  getPlanLimits(plan?: SubscriptionPlan): PlanLimits {
    const targetPlan = plan || this.currentPlan;

    if (!targetPlan) {
      // Return free plan limits as default
      return {
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
      };
    }

    return {
      maxForms: targetPlan.features.maxForms,
      maxResponsesPerMonth: targetPlan.features.maxResponsesPerMonth,
      maxFileUploadSize: targetPlan.features.maxFileUploadSize,
      teamMembers: targetPlan.features.teamMembers,
      canRemoveBranding: targetPlan.features.removeBranding,
      canUseCustomDomain: targetPlan.features.customDomain,
      canCollectPayments: targetPlan.features.paymentCollection,
      platformFeePercentage: targetPlan.features.platformFeePercentage,
      webhooks: targetPlan.features.webhooks,
      smsNotifications: targetPlan.features.smsNotifications,
      hasApiAccess: targetPlan.features.apiAccess,
      canUseWhiteLabel: targetPlan.features.whiteLabel,
    };
  }

  /**
   * Check if feature is available
   */
  hasFeature(feature: keyof PlanLimits): boolean {
    const limits = this.getPlanLimits();
    return !!limits[feature];
  }

  /**
   * Check if usage limit is reached
   */
  isLimitReached(usage: UsageStats, limit: keyof PlanLimits): boolean {
    const limits = this.getPlanLimits();

    switch (limit) {
      case "maxForms":
        return limits.maxForms !== -1 && usage.formsCreated >= limits.maxForms;
      case "maxResponsesPerMonth":
        return (
          limits.maxResponsesPerMonth !== -1 && usage.responsesThisMonth >= limits.maxResponsesPerMonth
        );
      case "smsNotifications":
        return limits.smsNotifications !== -1 && usage.smsUsedThisMonth >= limits.smsNotifications;
      default:
        return false;
    }
  }

  /**
   * Get usage percentage
   */
  getUsagePercentage(usage: UsageStats, limit: keyof PlanLimits): number {
    const limits = this.getPlanLimits();

    let used = 0;
    let total = 1;

    switch (limit) {
      case "maxForms":
        used = usage.formsCreated;
        total = limits.maxForms === -1 ? usage.formsCreated + 1 : limits.maxForms;
        break;
      case "maxResponsesPerMonth":
        used = usage.responsesThisMonth;
        total =
          limits.maxResponsesPerMonth === -1
            ? usage.responsesThisMonth + 1
            : limits.maxResponsesPerMonth;
        break;
      case "smsNotifications":
        used = usage.smsUsedThisMonth;
        total = limits.smsNotifications === -1 ? usage.smsUsedThisMonth + 1 : limits.smsNotifications;
        break;
    }

    return Math.min(Math.round((used / total) * 100), 100);
  }

  /**
   * Compare plans
   */
  comparePlans(currentPlanId: string, targetPlanId: string): PlanComparison | null {
    const current = this.getPlanById(currentPlanId);
    const target = this.getPlanById(targetPlanId);

    if (!current || !target) return null;

    // Calculate price change (monthly USD)
    const priceChange = target.pricing.monthly.USD - current.pricing.monthly.USD;

    // Compare features
    const added: string[] = [];
    const removed: string[] = [];
    const improved: string[] = [];

    // Check each feature
    if (!current.features.removeBranding && target.features.removeBranding) {
      added.push("Remove branding");
    }
    if (!current.features.customDomain && target.features.customDomain) {
      added.push("Custom domain");
    }
    if (!current.features.paymentCollection && target.features.paymentCollection) {
      added.push("Payment collection");
    }
    if (!current.features.apiAccess && target.features.apiAccess) {
      added.push("API access");
    }
    if (!current.features.whiteLabel && target.features.whiteLabel) {
      added.push("White-label");
    }

    // Check improvements
    if (target.features.maxForms > current.features.maxForms) {
      if (target.features.maxForms === -1) {
        improved.push("Unlimited forms");
      } else {
        improved.push(`More forms (${current.features.maxForms} → ${target.features.maxForms})`);
      }
    }

    if (target.features.maxResponsesPerMonth > current.features.maxResponsesPerMonth) {
      improved.push(
        `More responses (${current.features.maxResponsesPerMonth.toLocaleString()} → ${target.features.maxResponsesPerMonth.toLocaleString()})`
      );
    }

    if (target.features.teamMembers > current.features.teamMembers) {
      improved.push(`More team members (${current.features.teamMembers} → ${target.features.teamMembers})`);
    }

    if (target.features.platformFeePercentage < current.features.platformFeePercentage) {
      improved.push(
        `Lower platform fee (${current.features.platformFeePercentage}% → ${target.features.platformFeePercentage}%)`
      );
    }

    return {
      current,
      target,
      priceChange,
      features: {
        added,
        removed,
        improved,
      },
    };
  }

  /**
   * Get recommended plan based on usage
   */
  getRecommendedPlan(usage: UsageStats): SubscriptionPlan | null {
    const plans = this.getPlans();

    // If already on highest plan, return null
    if (this.currentPlan?.name === "Enterprise") {
      return null;
    }

    // Check if current plan limits are being reached
    const limits = this.getPlanLimits();

    // If approaching limits (>80%), recommend upgrade
    const formsUsage = (usage.formsCreated / (limits.maxForms === -1 ? 999999 : limits.maxForms)) * 100;
    const responsesUsage =
      (usage.responsesThisMonth /
        (limits.maxResponsesPerMonth === -1 ? 999999 : limits.maxResponsesPerMonth)) *
      100;

    if (formsUsage > 80 || responsesUsage > 80) {
      // Find next tier plan
      const currentIndex = plans.findIndex((p) => p._id === this.currentPlan?._id);
      if (currentIndex < plans.length - 1) {
        return plans[currentIndex + 1];
      }
    }

    return null;
  }

  /**
   * Calculate prorated amount for upgrade
   */
  calculateProratedAmount(
    currentPlanId: string,
    targetPlanId: string,
    daysRemaining: number
  ): number {
    const current = this.getPlanById(currentPlanId);
    const target = this.getPlanById(targetPlanId);

    if (!current || !target) return 0;

    // Get monthly prices in USD
    const currentPrice = current.pricing.monthly.USD;
    const targetPrice = target.pricing.monthly.USD;

    // Calculate daily rate difference
    const dailyDifference = (targetPrice - currentPrice) / 30;

    // Calculate prorated amount
    return Math.max(0, dailyDifference * daysRemaining);
  }

  /**
   * Get subscription status color
   */
  getStatusColor(status: Subscription["status"]): string {
    const colors = {
      active: "green",
      trial: "blue",
      past_due: "amber",
      cancelled: "red",
      expired: "gray",
    };

    return colors[status] || "gray";
  }

  /**
   * Get subscription status label
   */
  getStatusLabel(status: Subscription["status"]): string {
    const labels = {
      active: "Active",
      trial: "Trial Period",
      past_due: "Payment Failed",
      cancelled: "Cancelled",
      expired: "Expired",
    };

    return labels[status] || status;
  }

  /**
   * Check if subscription is active
   */
  isActive(): boolean {
    return this.currentSubscription?.status === "active" || this.currentSubscription?.status === "trial";
  }

  /**
   * Get days until next billing
   */
  getDaysUntilBilling(): number | null {
    if (!this.currentSubscription?.billing.nextBillingDate) return null;

    const nextBilling = new Date(this.currentSubscription.billing.nextBillingDate);
    const now = new Date();
    const diffTime = nextBilling.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Format next billing date
   */
  getNextBillingDate(): string | null {
    if (!this.currentSubscription?.billing.nextBillingDate) return null;

    const date = new Date(this.currentSubscription.billing.nextBillingDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}

// Singleton instance
export const subscriptionManager = new SubscriptionManager();
export default subscriptionManager;
