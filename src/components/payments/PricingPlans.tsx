/**
 * PricingPlans - Display pricing plans with comparison
 */

"use client";

import { useState } from "react";
import { usePayment } from "@/hooks/usePayment";
import { Check, X, Zap, Crown, Building2, Rocket } from "lucide-react";
import { motion } from "framer-motion";

export function PricingPlans() {
  const { allPlans, currentPlan, isLoading } = usePayment();
  const [interval, setInterval] = useState<"monthly" | "annual">("monthly");
  const [currency, setCurrency] = useState<"USD" | "GHS" | "NGN" | "KES">("USD");

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading pricing plans...</p>
      </div>
    );
  }

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "free":
        return <Zap className="w-6 h-6" />;
      case "pro":
        return <Crown className="w-6 h-6" />;
      case "business":
        return <Building2 className="w-6 h-6" />;
      case "enterprise":
        return <Rocket className="w-6 h-6" />;
      default:
        return <Zap className="w-6 h-6" />;
    }
  };

  const formatPrice = (price: number) => {
    const symbols: Record<string, string> = {
      USD: "$",
      GHS: "GH₵",
      NGN: "₦",
      KES: "KSh",
    };

    return `${symbols[currency]}${price.toLocaleString()}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Choose the Perfect Plan for You
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Start free, upgrade when you need more. All plans include offline forms and auto-sync.
        </p>
      </div>

      {/* Toggle Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* Billing Interval */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setInterval("monthly")}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              interval === "monthly"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval("annual")}
            className={`px-4 py-2 rounded-md font-medium transition-all relative ${
              interval === "annual"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Annual
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
              Save 17%
            </span>
          </button>
        </div>

        {/* Currency Selector */}
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="USD">🇺🇸 USD</option>
          <option value="GHS">🇬🇭 GHS (Ghana)</option>
          <option value="NGN">🇳🇬 NGN (Nigeria)</option>
          <option value="KES">🇰🇪 KES (Kenya)</option>
        </select>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {allPlans.map((plan, index) => {
          const isCurrentPlan = currentPlan?._id === plan._id;
          const price = plan.pricing[interval][currency];
          const isPro = plan.name === "Pro";

          return (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl border-2 p-6 ${
                isPro
                  ? "border-indigo-600 shadow-xl scale-105"
                  : isCurrentPlan
                  ? "border-green-500"
                  : "border-gray-200 hover:border-indigo-300"
              } transition-all duration-200`}
            >
              {/* Popular Badge */}
              {isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Current Plan
                </div>
              )}

              {/* Plan Icon & Name */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-lg ${
                    isPro ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {getPlanIcon(plan.name)}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{plan.displayName}</h3>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.name === "Free" ? "Free" : formatPrice(price)}
                  </span>
                  {plan.name !== "Free" && (
                    <span className="text-gray-600">
                      /{interval === "monthly" ? "mo" : "yr"}
                    </span>
                  )}
                </div>
                {interval === "annual" && plan.name !== "Free" && (
                  <p className="text-sm text-gray-500 mt-1">
                    {formatPrice(Math.round(price / 12))}/month billed annually
                  </p>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-6">{plan.description}</p>

              {/* CTA Button */}
              <PlanButton
                plan={plan}
                isCurrentPlan={isCurrentPlan}
                currency={currency}
                interval={interval}
              />

              {/* Features */}
              <div className="mt-6 space-y-3">
                <p className="text-sm font-semibold text-gray-900 mb-3">What's included:</p>

                <Feature
                  included={true}
                  text={
                    plan.features.maxForms === -1
                      ? "Unlimited forms"
                      : `${plan.features.maxForms} form${plan.features.maxForms !== 1 ? "s" : ""}`
                  }
                />
                <Feature
                  included={true}
                  text={`${plan.features.maxResponsesPerMonth.toLocaleString()} responses/month`}
                />
                <Feature
                  included={true}
                  text={`${plan.features.maxFileUploadSize}MB file uploads`}
                />
                <Feature included={plan.features.removeBranding} text="Remove branding" />
                <Feature included={plan.features.paymentCollection} text="Accept payments" />
                {plan.features.paymentCollection && (
                  <Feature
                    included={true}
                    text={`${plan.features.platformFeePercentage}% platform fee`}
                    highlight
                  />
                )}
                <Feature included={plan.features.customDomain} text="Custom domain" />
                <Feature
                  included={plan.features.teamMembers > 1}
                  text={`${plan.features.teamMembers} team member${
                    plan.features.teamMembers !== 1 ? "s" : ""
                  }`}
                />
                <Feature
                  included={plan.features.webhooks > 0}
                  text={
                    plan.features.webhooks === -1
                      ? "Unlimited webhooks"
                      : `${plan.features.webhooks} webhooks`
                  }
                />
                <Feature included={plan.features.apiAccess} text="API access" />
                <Feature
                  included={true}
                  text={`${plan.features.supportResponseTime} support`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Trust Indicators */}
      <div className="text-center pt-8">
        <p className="text-sm text-gray-500 mb-2">
          🔒 Secure payments via Paystack • 📱 All plans include offline support • ✨ Cancel anytime
        </p>
        <p className="text-xs text-gray-400">
          Prices exclude payment processor fees (typically 1.5% + GHS 1)
        </p>
      </div>
    </div>
  );
}

function Feature({
  included,
  text,
  highlight,
}: {
  included: boolean;
  text: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className={`mt-0.5 ${included ? "text-green-500" : "text-gray-300"}`}>
        {included ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
      </div>
      <span
        className={`text-sm ${
          included ? (highlight ? "text-indigo-600 font-semibold" : "text-gray-700") : "text-gray-400"
        }`}
      >
        {text}
      </span>
    </div>
  );
}

function PlanButton({
  plan,
  isCurrentPlan,
  currency,
  interval,
}: {
  plan: any;
  isCurrentPlan: boolean;
  currency: string;
  interval: string;
}) {
  const handleClick = () => {
    if (plan.name === "Free") {
      window.location.href = "/dashboard/forms/new";
    } else if (plan.name === "Enterprise") {
      window.location.href = "/contact-sales";
    } else {
      window.location.href = `/pricing/checkout?plan=${plan._id}&currency=${currency}&interval=${interval}`;
    }
  };

  if (isCurrentPlan) {
    return (
      <button
        disabled
        className="w-full bg-green-100 text-green-700 font-semibold py-3 px-4 rounded-lg cursor-default"
      >
        Current Plan
      </button>
    );
  }

  const isPro = plan.name === "Pro";

  return (
    <button
      onClick={handleClick}
      className={`w-full font-semibold py-3 px-4 rounded-lg transition-all ${
        isPro
          ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl"
          : "bg-gray-900 text-white hover:bg-gray-800"
      }`}
    >
      {plan.name === "Free"
        ? "Get Started Free"
        : plan.name === "Enterprise"
        ? "Contact Sales"
        : "Upgrade Now"}
    </button>
  );
}

export default PricingPlans;
