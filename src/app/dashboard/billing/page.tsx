/**
 * Billing Dashboard Page - Manage subscription and billing
 */

import { SubscriptionDashboard } from "@/components/payments/SubscriptionDashboard";

export default function BillingPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-600 mt-2">
          Manage your subscription, view usage, and access payment history
        </p>
      </div>

      <SubscriptionDashboard />
    </div>
  );
}
