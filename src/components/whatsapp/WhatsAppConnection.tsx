/**
 * WhatsAppConnection - Connect and manage WhatsApp Business account
 */

"use client";

import { useState, useEffect } from "react";
import { useWhatsApp } from "@/hooks/useWhatsApp";
import { MessageCircle, Loader2, CheckCircle2, AlertCircle, RefreshCw, Smartphone } from "lucide-react";
import QRCode from "qrcode";

export function WhatsAppConnection() {
  const { instance, isConnected, isLoading, connect, disconnect, refreshQR, quota } = useWhatsApp();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [instanceName, setInstanceName] = useState("formbuilder-main");

  // Generate QR code image from base64
  useEffect(() => {
    if (instance?.qrCode) {
      generateQRCode(instance.qrCode);
    }
  }, [instance?.qrCode]);

  const generateQRCode = async (qrData: string) => {
    try {
      // Check if it's already a data URL
      if (qrData.startsWith("data:image")) {
        setQrCodeDataUrl(qrData);
      } else {
        // Generate QR code from string
        const url = await QRCode.toDataURL(qrData, {
          width: 300,
          margin: 2,
        });
        setQrCodeDataUrl(url);
      }
    } catch (err) {
      console.error("Failed to generate QR code:", err);
    }
  };

  const handleConnect = async () => {
    if (!instanceName.trim()) {
      setError("Please enter an instance name");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const qrCode = await connect(instanceName);
      await generateQRCode(qrCode);
    } catch (err: any) {
      setError(err.message || "Failed to connect");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRefreshQR = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const qrCode = await refreshQR();
      await generateQRCode(qrCode);
    } catch (err: any) {
      setError(err.message || "Failed to refresh QR code");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect WhatsApp?")) return;

    setIsConnecting(true);
    setError(null);

    try {
      await disconnect();
      setQrCodeDataUrl(null);
    } catch (err: any) {
      setError(err.message || "Failed to disconnect");
    } finally {
      setIsConnecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${isConnected ? "bg-green-100" : "bg-gray-100"}`}>
          <MessageCircle className={`w-6 h-6 ${isConnected ? "text-green-600" : "text-gray-600"}`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">WhatsApp Business</h3>
          <p className="text-sm text-gray-600">
            {isConnected ? "Connected and ready to send messages" : "Connect your WhatsApp account"}
          </p>
        </div>
      </div>

      {isConnected && instance ? (
        // Connected State
        <div className="space-y-6">
          {/* Connection Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-green-900 mb-1">Connected</h4>
                <p className="text-sm text-green-700">
                  {instance.phoneNumber && `Phone: ${instance.phoneNumber}`}
                </p>
                {instance.connectionData?.lastConnected && (
                  <p className="text-xs text-green-600 mt-1">
                    Connected: {new Date(instance.connectionData.lastConnected).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quota Info */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Message Quota</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Messages sent today</span>
                <span className="font-semibold text-gray-900">
                  {quota.used.toLocaleString()} / {quota.total === Infinity ? "∞" : quota.total.toLocaleString()}
                </span>
              </div>
              {quota.total !== Infinity && (
                <>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        quota.percentage >= 90
                          ? "bg-red-500"
                          : quota.percentage >= 70
                          ? "bg-amber-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(quota.percentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {quota.remaining.toLocaleString()} messages remaining
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={handleDisconnect}
            disabled={isConnecting}
            className="w-full px-4 py-2 border-2 border-red-300 text-red-700 font-medium rounded-lg 
                     hover:border-red-400 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            Disconnect WhatsApp
          </button>
        </div>
      ) : instance && instance.status === "connecting" && qrCodeDataUrl ? (
        // QR Code State
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">Scan QR Code</h4>
                <p className="text-sm text-blue-700">
                  Open WhatsApp on your phone and scan this QR code
                </p>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center py-6">
            {qrCodeDataUrl && (
              <img
                src={qrCodeDataUrl}
                alt="WhatsApp QR Code"
                className="w-64 h-64 border-4 border-gray-200 rounded-lg"
              />
            )}

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">Scan with WhatsApp → Settings → Linked Devices</p>
              <button
                onClick={handleRefreshQR}
                disabled={isConnecting}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh QR Code
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Not Connected State
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="instanceName" className="block text-sm font-medium text-gray-700">
              Instance Name
            </label>
            <input
              id="instanceName"
              type="text"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
              placeholder="e.g., formbuilder-main"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500">
              Choose a unique name for your WhatsApp connection
            </p>
          </div>

          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-lg 
                     hover:bg-green-700 transition-colors flex items-center justify-center gap-2 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <MessageCircle className="w-5 h-5" />
                Connect WhatsApp Business
              </>
            )}
          </button>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Requirements:</h4>
            <ul className="space-y-1 text-xs text-gray-600">
              <li>✓ WhatsApp Business account</li>
              <li>✓ Active phone number</li>
              <li>✓ Internet connection</li>
            </ul>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-sm text-red-900">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default WhatsAppConnection;
