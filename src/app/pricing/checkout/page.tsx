/**
 * Checkout Page - Payment checkout
 */

"use client";

import { Suspense } from "react";
import { CheckoutPage as CheckoutComponent } from "@/components/payments/CheckoutPage";
import { Loader2 } from "lucide-react";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading checkout...</p>
          </div>
        </div>
      }
    >
      <CheckoutComponent />
    </Suspense>
  );
}
