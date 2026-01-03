/**
 * ShareFormDialog - Share forms via WhatsApp
 */

"use client";

import { useState } from "react";
import { useWhatsApp } from "@/hooks/useWhatsApp";
import { X, Plus, Trash2, MessageCircle, Loader2, Upload, AlertCircle } from "lucide-react";

interface Recipient {
  phoneNumber: string;
  name?: string;
}

interface ShareFormDialogProps {
  formId: string;
  formTitle: string;
  formLink: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareFormDialog({
  formId,
  formTitle,
  formLink,
  isOpen,
  onClose,
}: ShareFormDialogProps) {
  const { shareForm, validatePhone, formatPhone, canSendMessage, quota } = useWhatsApp();

  const [recipients, setRecipients] = useState<Recipient[]>([{ phoneNumber: "", name: "" }]);
  const [customMessage, setCustomMessage] = useState(
    `Hi! 👋\n\nI'd like you to fill out this form:\n\n*${formTitle}*\n\n${formLink}\n\nThank you!`
  );
  const [includePreview, setIncludePreview] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const addRecipient = () => {
    setRecipients([...recipients, { phoneNumber: "", name: "" }]);
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const updateRecipient = (index: number, field: keyof Recipient, value: string) => {
    const updated = [...recipients];
    updated[index] = { ...updated[index], [field]: value };
    setRecipients(updated);
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter(Boolean);

      const newRecipients: Recipient[] = [];
      lines.forEach((line, index) => {
        if (index === 0 && line.toLowerCase().includes("phone")) return; // Skip header

        const [phoneNumber, name] = line.split(",").map((s) => s.trim());
        if (phoneNumber) {
          newRecipients.push({ phoneNumber, name });
        }
      });

      setRecipients(newRecipients.length > 0 ? newRecipients : recipients);
    };
    reader.readAsText(file);
  };

  const validateRecipients = (): boolean => {
    const validRecipients = recipients.filter((r) => r.phoneNumber.trim());

    if (validRecipients.length === 0) {
      setError("Please add at least one recipient");
      return false;
    }

    const invalidNumbers = validRecipients.filter((r) => !validatePhone(r.phoneNumber));
    if (invalidNumbers.length > 0) {
      setError(`Invalid phone number(s): ${invalidNumbers.map((r) => r.phoneNumber).join(", ")}`);
      return false;
    }

    if (!canSendMessage()) {
      setError(`Daily quota exceeded. ${quota.remaining} messages remaining.`);
      return false;
    }

    if (validRecipients.length > quota.remaining && quota.remaining !== Infinity) {
      setError(
        `Cannot send to ${validRecipients.length} recipients. Only ${quota.remaining} messages remaining today.`
      );
      return false;
    }

    return true;
  };

  const handleShare = async () => {
    if (!validateRecipients()) return;

    setIsSending(true);
    setError(null);
    setSuccess(null);

    try {
      const validRecipients = recipients.filter((r) => r.phoneNumber.trim());

      const result = await shareForm({
        formId,
        recipients: validRecipients,
        customMessage,
        includePreview,
      });

      setSuccess(
        `Successfully sent to ${result.messagesSent} recipient(s). ${
          result.messagesFailed > 0 ? `${result.messagesFailed} failed.` : ""
        }`
      );

      // Reset form after 2 seconds
      setTimeout(() => {
        onClose();
        setRecipients([{ phoneNumber: "", name: "" }]);
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to share form");
    } finally {
      setIsSending(false);
    }
  };

  const validRecipientsCount = recipients.filter((r) => r.phoneNumber.trim()).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Share Form via WhatsApp</h2>
            <p className="text-sm text-gray-600">{formTitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Recipients */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-900">
                Recipients ({validRecipientsCount})
              </label>
              <div className="flex gap-2">
                <label className="text-sm text-indigo-600 hover:text-indigo-700 cursor-pointer flex items-center gap-1">
                  <Upload className="w-4 h-4" />
                  Import CSV
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={addRecipient}
                  className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {recipients.map((recipient, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="tel"
                    value={recipient.phoneNumber}
                    onChange={(e) => updateRecipient(index, "phoneNumber", e.target.value)}
                    placeholder="+233 244 000 000"
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      recipient.phoneNumber && !validatePhone(recipient.phoneNumber)
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  />
                  <input
                    type="text"
                    value={recipient.name || ""}
                    onChange={(e) => updateRecipient(index, "name", e.target.value)}
                    placeholder="Name (optional)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {recipients.length > 1 && (
                    <button
                      onClick={() => removeRecipient(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <p className="mt-2 text-xs text-gray-500">
              CSV format: phoneNumber, name (one per line)
            </p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Message
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter your message..."
            />
            <p className="mt-1 text-xs text-gray-500">
              {customMessage.length} characters
            </p>
          </div>

          {/* Include Preview */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="includePreview"
              checked={includePreview}
              onChange={(e) => setIncludePreview(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="includePreview" className="text-sm text-gray-700">
              Include form preview (image, question count, estimated time)
            </label>
          </div>

          {/* Quota Warning */}
          {quota.percentage > 80 && quota.total !== Infinity && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">
                    Approaching daily limit
                  </p>
                  <p className="text-xs text-amber-700">
                    {quota.remaining} messages remaining today
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-900">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-900">{success}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSending}
              className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={isSending || validRecipientsCount === 0}
              className="flex-1 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5" />
                  Send to {validRecipientsCount} recipient{validRecipientsCount !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShareFormDialog;
