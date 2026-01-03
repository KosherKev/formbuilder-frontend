/**
 * CheckoutPage - Complete payment checkout flow
 */

"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { usePayment } from "@/hooks/usePayment";
import { PaymentMethodSelector, PaymentMethod } from "./PaymentMethodSelector";
import { paystackService } from "@/lib/payments";
import { ArrowLeft, Check, Loader2, Shield, CreditCard } from "lucide-react";
import Link from "next/link";

export function CheckoutPage() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan");

  const { allPlans, currentPlan } = usePayment();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [interval, setInterval] = useState<"monthly" | "annual">("monthly");
  const [currency, setCurrency] = useState<"USD" | "GHS" | "NGN" | "KES">("USD");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (planId && allPlans.length > 0) {
      const plan = allPlans.find((p) => p._id === planId);
      setSelectedPlan(plan);
    }
  }, [planId, allPlans]);

  const handleSubscribe = async () => {
    if (!selectedPlan || !paymentMethod) return;

    // Validate mobile money phone number
    if (paymentMethod.type === "mobile_money") {
      if (!paymentMethod.network) {
        setError("Please select a mobile money network");
        return;
      }
      if (!paymentMethod.phoneNumber) {
        setError("Please enter your mobile money phone number");
        return;
      }
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await paystackService.subscribe({
        planId: selectedPlan._id,
        interval,
        currency,
        paymentMethod,
      });

      // Redirect to Paystack payment page
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      }
    } catch (err: any) {
      setError(err.message || "Failed to process payment");
      setIsProcessing(false);
    }
  };

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  const price = selectedPlan.pricing[interval][currency];
  const monthlyPrice = interval === "annual" ? Math.round(price / 12) : price;

  const symbols: Record<string, string> = {
    USD: "$",
    GHS: "GH₵",
    NGN: "₦",
    KES: "KSh",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to pricing
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Order Summary */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Order</h1>
              <p className="text-gray-600">Subscribe to {selectedPlan.displayName}</p>
            </div>

            {/* Order Summary Card */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-semibold text-gray-900">{selectedPlan.displayName}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Billing</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setInterval("monthly")}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          interval === "monthly"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => setInterval("annual")}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          interval === "annual"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        Annual
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Currency</span>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as any)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="USD">🇺🇸 USD</option>
                      <option value="GHS">🇬🇭 GHS</option>
                      <option value="NGN">🇳🇬 NGN</option>
                      <option value="KES">🇰🇪 KES</option>
                    </select>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-baseline">
                      <span className="text-gray-600">Total</span>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {symbols[currency]}
                          {price.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {symbols[currency]}
                          {monthlyPrice.toLocaleString()}/month
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* What's Included */}
              <div className="pt-6 border-t">
                <h4 className="font-semibold text-gray-900 mb-3">What's included:</h4>
                <div className="space-y-2">
                  <Feature
                    text={
                      selectedPlan.features.maxForms === -1
                        ? "Unlimited forms"
                        : `${selectedPlan.features.maxForms} forms`
                    }
                  />
                  <Feature
                    text={`${selectedPlan.features.maxResponsesPerMonth.toLocaleString()} responses/month`}
                  />
                  {selectedPlan.features.paymentCollection && (
                    <Feature
                      text={`Payment collection (${selectedPlan.features.platformFeePercentage}% fee)`}
                    />
                  )}
                  {selectedPlan.features.removeBranding && <Feature text="Remove branding" />}
                  {selectedPlan.features.customDomain && <Feature text="Custom domain" />}
                  <Feature text={`${selectedPlan.features.supportResponseTime} support`} />
                </div>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t">
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    Secure
                  </div>
                  <div className="flex items-center gap-1">
                    <CreditCard className="w-4 h-4" />
                    Paystack
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Method */}
          <div>
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Payment Method</h3>

              <PaymentMethodSelector
                currency={currency}
                onSelect={setPaymentMethod}
                defaultMethod={paymentMethod || undefined}
              />

              {/* Submit Button */}
              <button
                onClick={handleSubscribe}
                disabled={!paymentMethod || isProcessing}
                className="w-full mt-6 bg-indigo-600 text-white font-semibold py-4 px-6 rounded-lg
                         hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Subscribe Now
                    <span className="text-indigo-200">
                      {symbols[currency]}
                      {price.toLocaleString()}
                    </span>
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-900">{error}</p>
                </div>
              )}

              <p className="mt-4 text-xs text-gray-500 text-center">
                By subscribing, you agree to our Terms of Service and Privacy Policy. You can cancel
                anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
      <span className="text-sm text-gray-700">{text}</span>
    </div>
  );
}

export default CheckoutPage;
