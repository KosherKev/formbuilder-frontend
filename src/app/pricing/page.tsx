/**
 * Pricing Page - Public pricing plans
 */

import { PricingPlans } from "@/components/payments";
import { Check } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PricingPlans />

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <FAQItem
              question="Can I change plans later?"
              answer="Yes! You can upgrade or downgrade your plan at any time. If you upgrade, you'll be charged a prorated amount for the remainder of your billing cycle."
            />

            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept Mobile Money (MTN, Vodafone, M-Pesa, Airtel) and credit/debit cards via Paystack. All payments are secure and encrypted."
            />

            <FAQItem
              question="Can I cancel my subscription?"
              answer="Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period, and you won't be charged again."
            />

            <FAQItem
              question="What happens if I exceed my plan limits?"
              answer="If you reach your plan limits, you'll be notified and prompted to upgrade. You won't lose any data, but you may not be able to create new forms or collect new responses until you upgrade."
            />

            <FAQItem
              question="Do you offer refunds?"
              answer="We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact us within 14 days for a full refund."
            />

            <FAQItem
              question="What are platform fees?"
              answer="Platform fees apply when you collect payments through your forms. The fee percentage depends on your plan: Pro (5%), Business (3%), Enterprise (1%). This is in addition to Paystack's standard payment processing fees."
            />
          </div>
        </div>

        {/* Trust Section */}
        <div className="max-w-4xl mx-auto mt-16 text-center">
          <div className="bg-white rounded-2xl border shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Trusted by Organizations Across Africa
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <TrustBadge text="🔒 Secure Payments" />
              <TrustBadge text="📱 Works Offline" />
              <TrustBadge text="💰 Mobile Money" />
              <TrustBadge text="✨ Cancel Anytime" />
            </div>

            <p className="text-gray-600">
              Join thousands of businesses using FormBuilder to collect data and payments across Ghana, Nigeria, Kenya, and beyond.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="font-semibold text-gray-900 mb-2 flex items-start gap-2">
        <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        {question}
      </h3>
      <p className="text-gray-600 ml-7">{answer}</p>
    </div>
  );
}

function TrustBadge({ text }: { text: string }) {
  return (
    <div className="text-center">
      <p className="text-sm font-medium text-gray-700">{text}</p>
    </div>
  );
}
