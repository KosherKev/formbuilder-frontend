"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formService } from "@/lib/api/forms";
import { responseService } from "@/lib/api/responses";
import type { Form, Question } from "@/lib/api/forms";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2, FileText } from "lucide-react";

export default function PublicFormPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [form, setForm] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadForm();
  }, [slug]);

  const loadForm = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Try to get form by slug (public endpoint)
      const response = await formService.getFormBySlug(slug);
      setForm(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Form not found");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    
    form?.questions.forEach((question) => {
      if (question.required && !answers[question.id]) {
        errors[question.id] = "This field is required";
      }

      // Email validation
      if (question.type === "email" && answers[question.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(answers[question.id])) {
          errors[question.id] = "Please enter a valid email address";
        }
      }

      // Number validation
      if (question.type === "number" && answers[question.id]) {
        const value = Number(answers[question.id]);
        if (question.validation?.min !== undefined && value < question.validation.min) {
          errors[question.id] = `Value must be at least ${question.validation.min}`;
        }
        if (question.validation?.max !== undefined && value > question.validation.max) {
          errors[question.id] = `Value must be at most ${question.validation.max}`;
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await responseService.submitForm(slug, {
        answers: Object.entries(answers).map(([questionId, value]) => ({
          questionId,
          value,
        })),
      });

      setSubmitted(true);

      // Redirect if URL is set
      if (form?.settings?.redirectUrl) {
        setTimeout(() => {
          window.location.href = form.settings.redirectUrl!;
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit form");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers({ ...answers, [questionId]: value });
    // Clear validation error when user starts typing
    if (validationErrors[questionId]) {
      setValidationErrors({ ...validationErrors, [questionId]: "" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Card className="p-8 max-w-md w-full text-center bg-white">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Form Not Found</h2>
          <p className="text-gray-600">{error}</p>
        </Card>
      </div>
    );
  }

  if (!form) return null;

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Card className="p-8 max-w-md w-full text-center bg-white">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600">
            {form.settings?.thankYouMessage || "Your response has been recorded."}
          </p>
          {form.settings?.redirectUrl && (
            <p className="text-sm text-gray-500 mt-4">Redirecting...</p>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Form Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-2xl mb-4">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{form.title}</h1>
          {form.description && (
            <p className="text-lg text-gray-600 max-w-xl mx-auto">{form.description}</p>
          )}
        </div>

        {/* Form Card */}
        <Card className="p-8 bg-white shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-8">
            {form.questions.map((question, index) => (
              <div key={question.id} className="space-y-3">
                <Label className="text-base font-medium text-gray-900">
                  {index + 1}. {question.label}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {question.description && (
                  <p className="text-sm text-gray-600">{question.description}</p>
                )}

                {/* Render input based on question type */}
                {renderQuestionInput(question, answers[question.id], (value) =>
                  handleAnswerChange(question.id, value)
                )}

                {validationErrors[question.id] && (
                  <p className="text-sm text-red-600">{validationErrors[question.id]}</p>
                )}
              </div>
            ))}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white text-base font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                form.settings?.submitButtonText || "Submit"
              )}
            </Button>
          </form>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Powered by <span className="font-semibold text-blue-600">FormBuilder</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function renderQuestionInput(
  question: Question,
  value: any,
  onChange: (value: any) => void
) {
  switch (question.type) {
    case "short_text":
    case "email":
    case "phone":
      return (
        <Input
          type={question.type === "email" ? "email" : question.type === "phone" ? "tel" : "text"}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          className="bg-white text-gray-900"
        />
      );

    case "long_text":
      return (
        <Textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          rows={4}
          className="bg-white text-gray-900"
        />
      );

    case "number":
      return (
        <Input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          min={question.validation?.min}
          max={question.validation?.max}
          className="bg-white text-gray-900"
        />
      );

    case "date":
      return (
        <Input
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="bg-white text-gray-900"
        />
      );

    case "multiple_choice":
      return (
        <div className="space-y-3">
          {question.options?.map((option) => (
            <label
              key={option.id}
              className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value)}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-gray-900">{option.label}</span>
            </label>
          ))}
        </div>
      );

    case "checkboxes":
      return (
        <div className="space-y-3">
          {question.options?.map((option) => (
            <label
              key={option.id}
              className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                value={option.value}
                checked={(value || []).includes(option.value)}
                onChange={(e) => {
                  const currentValues = value || [];
                  if (e.target.checked) {
                    onChange([...currentValues, option.value]);
                  } else {
                    onChange(currentValues.filter((v: string) => v !== option.value));
                  }
                }}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-gray-900">{option.label}</span>
            </label>
          ))}
        </div>
      );

    case "dropdown":
      return (
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
        >
          <option value="">Select an option</option>
          {question.options?.map((option) => (
            <option key={option.id} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );

    case "file_upload":
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onChange(file);
            }}
            className="hidden"
            id={`file-${question.id}`}
          />
          <label htmlFor={`file-${question.id}`} className="cursor-pointer">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              {value?.name || "Click to upload or drag and drop"}
            </p>
          </label>
        </div>
      );

    default:
      return null;
  }
}
