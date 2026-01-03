/**
 * SubscriptionDashboard - Manage subscription and view usage
 */

"use client";

import { useState, useEffect } from "react";
import { usePayment } from "@/hooks/usePayment";
import { UsageLimitBanner } from "./UsageLimitBanner";
import {
  CreditCard,
  Calendar,
  Download,
  TrendingUp,
  Settings,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export function SubscriptionDashboard() {
  const {
    currentPlan,
    subscription,
    limits,
    isLoading,
    loadPaymentHistory,
    paymentHistory,
    downloadReceipt,
    cancelSubscription: cancelSub,
  } = usePayment();

  const [usage, setUsage] = useState({
    formsCreated: 0,
    responsesThisMonth: 0,
    smsUsedThisMonth: 0,
    lastResetDate: new Date().toISOString(),
  });

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    // Load payment history
    loadHistory();

    // In real app, load usage from API
    // For now, using mock data
    setUsage({
      formsCreated: 8,
      responsesThisMonth: 7500,
      smsUsedThisMonth: 850,
      lastResetDate: new Date().toISOString(),
    });
  }, []);

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      await loadPaymentHistory({ limit: 10 });
    } catch (error) {
      console.error("Failed to load payment history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleDownloadReceipt = async (transactionId: string) => {
    try {
      await downloadReceipt(transactionId);
    } catch (error: any) {
      alert(error.message || "Failed to download receipt");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const nextBillingDate = subscription?.billing.nextBillingDate
    ? new Date(subscription.billing.nextBillingDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const isActive =
    subscription?.status === "active" || subscription?.status === "trial";

  return (
    <div className="space-y-6">
      {/* Usage Limit Banner */}
      <UsageLimitBanner usage={usage} />

      {/* Current Plan Card */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentPlan?.displayName || "Free Plan"}
            </h2>
            <div className="flex items-center gap-2">
              {isActive ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  Active
                </span>
              ) : subscription?.status === "cancelled" ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  <XCircle className="w-4 h-4" />
                  Cancelled
                </span>
              ) : subscription?.status === "past_due" ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                  <AlertCircle className="w-4 h-4" />
                  Payment Failed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  Free
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {currentPlan?.name !== "Enterprise" && (
              <Link
                href="/pricing"
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Upgrade
              </Link>
            )}
          </div>
        </div>

        {/* Billing Info */}
        {subscription && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-semibold text-gray-900">
                  {subscription.paymentMethod?.type === "mobile_money"
                    ? "Mobile Money"
                    : "Card"}
                </p>
                {subscription.paymentMethod?.details?.lastFourDigits && (
                  <p className="text-sm text-gray-500">
                    •••• {subscription.paymentMethod.details.lastFourDigits}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Next Billing</p>
                <p className="font-semibold text-gray-900">{nextBillingDate}</p>
                <p className="text-sm text-gray-500">
                  {subscription.billing.currency} {subscription.billing.amount.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Billing Cycle</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {subscription.billing.interval}
                </p>
                {isActive && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="text-sm text-red-600 hover:text-red-700 mt-1"
                  >
                    Cancel subscription
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Plan Features */}
        <div className="pt-6 border-t">
          <h3 className="font-semibold text-gray-900 mb-4">Your Plan Includes:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <PlanFeature
              label="Forms"
              value={limits.maxForms === -1 ? "Unlimited" : limits.maxForms.toString()}
            />
            <PlanFeature
              label="Responses/Month"
              value={limits.maxResponsesPerMonth.toLocaleString()}
            />
            <PlanFeature
              label="File Upload"
              value={`${limits.maxFileUploadSize}MB`}
            />
            <PlanFeature label="Team Members" value={limits.teamMembers.toString()} />
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Usage This Month</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <UsageCard
            label="Forms Created"
            used={usage.formsCreated}
            total={limits.maxForms}
            unit="forms"
          />
          <UsageCard
            label="Responses"
            used={usage.responsesThisMonth}
            total={limits.maxResponsesPerMonth}
            unit="responses"
          />
          {limits.smsNotifications > 0 && (
            <UsageCard
              label="SMS Sent"
              used={usage.smsUsedThisMonth}
              total={limits.smsNotifications}
              unit="messages"
            />
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
          <button
            onClick={loadHistory}
            disabled={isLoadingHistory}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {isLoadingHistory ? "Loading..." : "Refresh"}
          </button>
        </div>

        {paymentHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Receipt
                  </th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((transaction) => (
                  <tr key={transaction._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 capitalize">
                      {transaction.type.replace("_", " ")}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                      {transaction.currency} {transaction.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={transaction.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {transaction.receiptUrl && (
                        <button
                          onClick={() => handleDownloadReceipt(transaction._id)}
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          <Download className="w-4 h-4 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No payment history yet</p>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <CancelSubscriptionModal
          onConfirm={async (reason, feedback) => {
            await cancelSub(reason, feedback);
            setShowCancelModal(false);
          }}
          onClose={() => setShowCancelModal(false)}
        />
      )}
    </div>
  );
}

function PlanFeature({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function UsageCard({
  label,
  used,
  total,
  unit,
}: {
  label: string;
  used: number;
  total: number;
  unit: string;
}) {
  const percentage = total === -1 ? 0 : Math.min((used / total) * 100, 100);

  const getColor = () => {
    if (percentage >= 100) return "text-red-600";
    if (percentage >= 80) return "text-amber-600";
    return "text-green-600";
  };

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      <p className={`text-3xl font-bold ${getColor()}`}>
        {used.toLocaleString()}
      </p>
      <p className="text-sm text-gray-500 mt-1">
        of {total === -1 ? "unlimited" : total.toLocaleString()} {unit}
      </p>
      {total !== -1 && (
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              percentage >= 100
                ? "bg-red-500"
                : percentage >= 80
                ? "bg-amber-500"
                : "bg-green-500"
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "pending" | "success" | "failed" | "refunded";
}) {
  const config = {
    pending: { bg: "bg-blue-100", text: "text-blue-700", label: "Pending" },
    success: { bg: "bg-green-100", text: "text-green-700", label: "Success" },
    failed: { bg: "bg-red-100", text: "text-red-700", label: "Failed" },
    refunded: { bg: "bg-gray-100", text: "text-gray-700", label: "Refunded" },
  };

  const { bg, text, label } = config[status];

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
}

function CancelSubscriptionModal({
  onConfirm,
  onClose,
}: {
  onConfirm: (reason: string, feedback?: string) => Promise<void>;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    if (!reason) {
      alert("Please select a reason");
      return;
    }

    setIsProcessing(true);
    try {
      await onConfirm(reason, feedback);
    } catch (error: any) {
      alert(error.message || "Failed to cancel subscription");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Cancel Subscription?</h3>

        <p className="text-gray-600 mb-6">
          We're sorry to see you go. Your subscription will remain active until the end of your
          billing period.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Why are you cancelling?
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Select a reason...</option>
            <option value="too_expensive">Too expensive</option>
            <option value="missing_features">Missing features</option>
            <option value="not_using">Not using it enough</option>
            <option value="switching">Switching to another service</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional feedback (optional)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Help us improve..."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 transition-colors"
          >
            Keep Subscription
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isProcessing ? "Cancelling..." : "Cancel Subscription"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionDashboard;
