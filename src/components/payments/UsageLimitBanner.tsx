/**
 * UsageLimitBanner - Warn when approaching plan limits
 */

"use client";

import { usePayment } from "@/hooks/usePayment";
import { AlertTriangle, TrendingUp, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export interface UsageLimitBannerProps {
  usage: {
    formsCreated: number;
    responsesThisMonth: number;
    smsUsedThisMonth: number;
    lastResetDate: string;
  };
}

export function UsageLimitBanner({ usage }: UsageLimitBannerProps) {
  const { limits, getUsagePercentage, getRecommendedPlan, currentPlan } = usePayment();
  const [isDismissed, setIsDismissed] = useState(false);

  // Calculate usage percentages
  const formsPercentage = getUsagePercentage(usage, "maxForms");
  const responsesPercentage = getUsagePercentage(usage, "maxResponsesPerMonth");
  const smsPercentage = getUsagePercentage(usage, "smsNotifications");

  // Check if any limit is approaching (>80%)
  const isApproachingLimit =
    formsPercentage > 80 || responsesPercentage > 80 || smsPercentage > 80;

  // Check if any limit is exceeded (>=100%)
  const isLimitExceeded =
    formsPercentage >= 100 || responsesPercentage >= 100 || smsPercentage >= 100;

  // Get recommended plan
  const recommendedPlan = getRecommendedPlan(usage);

  if (isDismissed || (!isApproachingLimit && !isLimitExceeded)) {
    return null;
  }

  const getLimitMessage = () => {
    if (formsPercentage >= 100) {
      return `You've reached your limit of ${limits.maxForms} forms`;
    }
    if (responsesPercentage >= 100) {
      return `You've reached your limit of ${limits.maxResponsesPerMonth.toLocaleString()} responses this month`;
    }
    if (smsPercentage >= 100) {
      return `You've reached your SMS limit of ${limits.smsNotifications.toLocaleString()} messages`;
    }

    if (formsPercentage > 80) {
      return `You're using ${formsPercentage}% of your form quota`;
    }
    if (responsesPercentage > 80) {
      return `You're using ${responsesPercentage}% of your response quota`;
    }
    if (smsPercentage > 80) {
      return `You're using ${smsPercentage}% of your SMS quota`;
    }

    return "You're approaching your plan limits";
  };

  return (
    <div
      className={`relative rounded-lg border-2 p-4 mb-6 ${
        isLimitExceeded
          ? "bg-red-50 border-red-200"
          : "bg-amber-50 border-amber-200"
      }`}
    >
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-4 pr-8">
        <div
          className={`p-2 rounded-lg flex-shrink-0 ${
            isLimitExceeded
              ? "bg-red-100 text-red-600"
              : "bg-amber-100 text-amber-600"
          }`}
        >
          {isLimitExceeded ? (
            <AlertTriangle className="w-6 h-6" />
          ) : (
            <TrendingUp className="w-6 h-6" />
          )}
        </div>

        <div className="flex-1">
          <h3
            className={`font-semibold mb-1 ${
              isLimitExceeded ? "text-red-900" : "text-amber-900"
            }`}
          >
            {isLimitExceeded ? "Limit Reached!" : "Approaching Limit"}
          </h3>

          <p
            className={`text-sm mb-4 ${
              isLimitExceeded ? "text-red-800" : "text-amber-800"
            }`}
          >
            {getLimitMessage()}
            {isLimitExceeded &&
              " - Upgrade your plan to continue using all features."}
          </p>

          {/* Usage Bars */}
          <div className="space-y-3 mb-4">
            {limits.maxForms !== -1 && (
              <UsageBar
                label="Forms"
                used={usage.formsCreated}
                total={limits.maxForms}
                percentage={formsPercentage}
              />
            )}

            {limits.maxResponsesPerMonth !== -1 && (
              <UsageBar
                label="Responses"
                used={usage.responsesThisMonth}
                total={limits.maxResponsesPerMonth}
                percentage={responsesPercentage}
              />
            )}

            {limits.smsNotifications !== -1 && limits.smsNotifications > 0 && (
              <UsageBar
                label="SMS"
                used={usage.smsUsedThisMonth}
                total={limits.smsNotifications}
                percentage={smsPercentage}
              />
            )}
          </div>

          {/* Upgrade CTA */}
          {recommendedPlan && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/pricing/checkout?plan=${recommendedPlan._id}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 
                         text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                Upgrade to {recommendedPlan.displayName}
              </Link>

              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-4 py-2 border-2 border-gray-300 
                         text-gray-700 font-medium rounded-lg hover:border-gray-400 transition-colors"
              >
                View All Plans
              </Link>
            </div>
          )}

          {!recommendedPlan && currentPlan?.name !== "Enterprise" && (
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white 
                       font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              View Upgrade Options
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function UsageBar({
  label,
  used,
  total,
  percentage,
}: {
  label: string;
  used: number;
  total: number;
  percentage: number;
}) {
  const getBarColor = () => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-amber-500";
    return "bg-green-500";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-gray-700">{label}</span>
        <span className="text-xs text-gray-600">
          {used.toLocaleString()} / {total.toLocaleString()}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${getBarColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      <div className="text-xs text-gray-500 mt-1">{percentage}% used</div>
    </div>
  );
}

export default UsageLimitBanner;
