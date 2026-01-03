/**
 * PaymentMethodSelector - Select payment method with mobile money networks
 */

"use client";

import { useState } from "react";
import { paystackService } from "@/lib/payments";
import { CreditCard, Smartphone, Check } from "lucide-react";

export interface PaymentMethod {
  type: "mobile_money" | "card";
  network?: string;
  phoneNumber?: string;
}

interface PaymentMethodSelectorProps {
  currency: "GHS" | "NGN" | "KES" | "USD";
  onSelect: (method: PaymentMethod) => void;
  defaultMethod?: PaymentMethod;
}

export function PaymentMethodSelector({
  currency,
  onSelect,
  defaultMethod,
}: PaymentMethodSelectorProps) {
  const [selectedType, setSelectedType] = useState<"mobile_money" | "card">(
    defaultMethod?.type || "mobile_money"
  );
  const [selectedNetwork, setSelectedNetwork] = useState<string | undefined>(
    defaultMethod?.network
  );
  const [phoneNumber, setPhoneNumber] = useState(defaultMethod?.phoneNumber || "");
  const [error, setError] = useState<string | null>(null);

  const mobileMoneyNetworks = paystackService.getMobileMoneyNetworks(currency);
  const showMobileMoney = mobileMoneyNetworks.length > 0;

  const handleNetworkSelect = (network: string) => {
    setSelectedNetwork(network);
    setError(null);

    onSelect({
      type: "mobile_money",
      network,
      phoneNumber: phoneNumber || undefined,
    });
  };

  const handlePhoneChange = (value: string) => {
    // Remove non-numeric characters except +
    const cleaned = value.replace(/[^\d+]/g, "");
    setPhoneNumber(cleaned);
    setError(null);

    if (selectedNetwork) {
      onSelect({
        type: "mobile_money",
        network: selectedNetwork,
        phoneNumber: cleaned || undefined,
      });
    }
  };

  const handleCardSelect = () => {
    setSelectedType("card");
    setSelectedNetwork(undefined);
    setError(null);

    onSelect({
      type: "card",
    });
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return false;

    // Basic validation - should start with + and have 10-15 digits
    const phoneRegex = /^\+\d{10,15}$/;
    return phoneRegex.test(phone);
  };

  const getNetworkLogo = (network: string): string => {
    const logos: Record<string, string> = {
      mtn: "🟡", // MTN yellow
      vodafone: "🔴", // Vodafone red
      airteltigo: "🔴", // AirtelTigo red
      airtel: "🔴", // Airtel red
      "9mobile": "🟢", // 9mobile green
      mpesa: "🟢", // M-Pesa green
    };

    return logos[network.toLowerCase()] || "📱";
  };

  return (
    <div className="space-y-6">
      {/* Method Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Payment Method
        </label>

        <div className="grid grid-cols-2 gap-4">
          {/* Mobile Money */}
          {showMobileMoney && (
            <button
              onClick={() => setSelectedType("mobile_money")}
              className={`relative p-4 border-2 rounded-lg transition-all ${
                selectedType === "mobile_money"
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`p-2 rounded-lg ${
                    selectedType === "mobile_money"
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Smartphone className="w-6 h-6" />
                </div>
                <span className="font-medium text-gray-900">Mobile Money</span>
                <span className="text-xs text-gray-500">MTN, Vodafone, M-Pesa</span>
              </div>

              {selectedType === "mobile_money" && (
                <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </button>
          )}

          {/* Card Payment */}
          <button
            onClick={handleCardSelect}
            className={`relative p-4 border-2 rounded-lg transition-all ${
              selectedType === "card"
                ? "border-indigo-600 bg-indigo-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div
                className={`p-2 rounded-lg ${
                  selectedType === "card"
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <CreditCard className="w-6 h-6" />
              </div>
              <span className="font-medium text-gray-900">Card</span>
              <span className="text-xs text-gray-500">Visa, Mastercard</span>
            </div>

            {selectedType === "card" && (
              <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1">
                <Check className="w-4 h-4" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Money Networks */}
      {selectedType === "mobile_money" && showMobileMoney && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Select Network
          </label>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {mobileMoneyNetworks.map((network) => (
              <button
                key={network.code}
                onClick={() => handleNetworkSelect(network.code)}
                className={`relative p-4 border-2 rounded-lg transition-all text-left ${
                  selectedNetwork === network.code
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getNetworkLogo(network.code)}</span>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{network.name}</p>
                  </div>
                </div>

                {selectedNetwork === network.code && (
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Phone Number Input */}
          {selectedNetwork && (
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+233 244 000 000"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  error
                    ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-200"
                }`}
              />

              {phoneNumber && !validatePhone(phoneNumber) && (
                <p className="mt-2 text-sm text-amber-600">
                  Please enter a valid phone number starting with country code (e.g., +233)
                </p>
              )}

              {phoneNumber && validatePhone(phoneNumber) && (
                <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Phone number valid
                </p>
              )}

              <p className="mt-2 text-xs text-gray-500">
                Enter your mobile money number with country code
              </p>
            </div>
          )}
        </div>
      )}

      {/* Card Info Message */}
      {selectedType === "card" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            💳 You'll be redirected to Paystack's secure payment page to enter your card details.
            We never store your card information.
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-900">{error}</p>
        </div>
      )}
    </div>
  );
}

export default PaymentMethodSelector;
