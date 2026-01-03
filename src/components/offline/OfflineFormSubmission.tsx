/**
 * OfflineFormSubmission - Handle form submissions with offline support
 */

"use client";

import { useState } from "react";
import { offlineManager } from "@/lib/offline/offlineManager";
import { useOffline } from "@/hooks/useOffline";
import { CheckCircle2, WifiOff, Cloud, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface FormAnswer {
  questionId: string;
  questionType: string;
  questionLabel: string;
  value: any;
}

interface OfflineFormSubmissionProps {
  formSlug: string;
  answers: FormAnswer[];
  onSuccess?: (clientId: string, wasOffline: boolean) => void;
  onError?: (error: Error) => void;
  children: (props: {
    submit: () => Promise<void>;
    isSubmitting: boolean;
    isOffline: boolean;
    error: string | null;
  }) => React.ReactNode;
}

export function OfflineFormSubmission({
  formSlug,
  answers,
  onSuccess,
  onError,
  children,
}: OfflineFormSubmissionProps) {
  const { isOnline } = useOffline();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    clientId: string;
    wasOffline: boolean;
  } | null>(null);

  const submit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await offlineManager.saveResponse(formSlug, answers);

      setSubmissionResult({
        clientId: result.clientId,
        wasOffline: result.savedOffline,
      });

      setShowSuccess(true);

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);

      onSuccess?.(result.clientId, result.savedOffline);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to submit form";
      setError(errorMessage);
      onError?.(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {children({
        submit,
        isSubmitting,
        isOffline: !isOnline,
        error,
      })}

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && submissionResult && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 right-4 z-50 max-w-md"
          >
            <div className={`rounded-lg shadow-lg p-4 border
              ${submissionResult.wasOffline 
                ? 'bg-amber-50 border-amber-200' 
                : 'bg-green-50 border-green-200'
              }`}>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${
                  submissionResult.wasOffline ? 'text-amber-600' : 'text-green-600'
                }`}>
                  {submissionResult.wasOffline ? (
                    <WifiOff className="w-5 h-5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1">
                  <h4 className={`font-semibold mb-1 ${
                    submissionResult.wasOffline ? 'text-amber-900' : 'text-green-900'
                  }`}>
                    {submissionResult.wasOffline
                      ? "Saved Offline"
                      : "Submitted Successfully"}
                  </h4>
                  <p className={`text-sm ${
                    submissionResult.wasOffline ? 'text-amber-700' : 'text-green-700'
                  }`}>
                    {submissionResult.wasOffline
                      ? "Your response has been saved locally and will sync automatically when you're back online."
                      : "Your response has been submitted successfully!"}
                  </p>

                  {submissionResult.wasOffline && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-amber-600">
                      <Cloud className="w-4 h-4" />
                      <span>Will sync when connection is available</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowSuccess(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 right-4 z-50 max-w-md"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 mb-1">Submission Failed</h4>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Simple wrapper component for easy use
export function OfflineSubmitButton({
  formSlug,
  answers,
  onSuccess,
  onError,
  className = "",
  children,
}: {
  formSlug: string;
  answers: FormAnswer[];
  onSuccess?: (clientId: string, wasOffline: boolean) => void;
  onError?: (error: Error) => void;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <OfflineFormSubmission
      formSlug={formSlug}
      answers={answers}
      onSuccess={onSuccess}
      onError={onError}
    >
      {({ submit, isSubmitting, isOffline }) => (
        <button
          onClick={submit}
          disabled={isSubmitting}
          className={`
            flex items-center justify-center gap-2 px-6 py-3 rounded-lg
            font-semibold transition-all duration-200
            ${isOffline 
              ? 'bg-amber-600 hover:bg-amber-700 text-white' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : isOffline ? (
            <>
              <WifiOff className="w-5 h-5" />
              {children || "Save Offline"}
            </>
          ) : (
            <>
              <Cloud className="w-5 h-5" />
              {children || "Submit"}
            </>
          )}
        </button>
      )}
    </OfflineFormSubmission>
  );
}

export default OfflineFormSubmission;
