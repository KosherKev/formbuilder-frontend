"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { formService } from "@/lib/api/forms";
import { responseService } from "@/lib/api/responses";
import type { Form, Question } from "@/lib/api/forms";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { Loader2, CheckCircle2, FileText } from "lucide-react";
import { validatePhoneNumber } from "@/lib/utils";

// Logic evaluation function
function evaluateLogic(question: Question, answers: { [key: string]: any }): boolean {
  if (!question.conditionalLogic?.enabled || !question.conditionalLogic?.conditions) {
    return true; // Always show if no logic defined
  }

  const { conditions, logicOperator = 'AND' } = question.conditionalLogic;

  const results = conditions.map((condition) => {
    const value = answers[condition.questionId];
    const targetValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        return value === targetValue;
      case 'not_equals':
        return value !== targetValue;
      case 'contains':
        return String(value || '').toLowerCase().includes(String(targetValue).toLowerCase());
      case 'not_contains':
        return !String(value || '').toLowerCase().includes(String(targetValue).toLowerCase());
      case 'greater_than':
        return Number(value) > Number(targetValue);
      case 'less_than':
        return Number(value) < Number(targetValue);
      default:
        return true;
    }
  });

  if (logicOperator === 'AND') {
    return results.every(r => r);
  } else {
    return results.some(r => r);
  }
}

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
      const response = await formService.getFormBySlug(slug);
      setForm(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Form not found");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter questions based on conditional logic
  const visibleQuestions = useMemo(() => {
    if (!form) return [];

    return form.questions.filter((question) => {
      if (!question.conditionalLogic?.enabled) return true;

      const shouldShow = evaluateLogic(question, answers);
      const action = question.conditionalLogic.action;

      if (action === 'show') {
        return shouldShow;
      } else if (action === 'hide') {
        return !shouldShow;
      }

      return true;
    });
  }, [form, answers]);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    
    visibleQuestions.forEach((question) => {
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

      // Phone validation
      if (question.type === "phone" && answers[question.id]) {
        const validation = validatePhoneNumber(answers[question.id]);
        if (!validation.valid) {
          errors[question.id] = validation.message;
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
        answers: Object.entries(answers).map(([questionId, value]) => {
          const question = form?.questions.find(q => q.id === questionId);
          return {
            questionId,
            questionType: question?.type || 'text',
            questionLabel: question?.label || '',
            value,
          };
        }),
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
      <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
        {/* Background Blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-150 h-150 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-150 h-150 bg-secondary/10 rounded-full blur-[120px]" />
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden px-4">
        {/* Background Blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-150 h-150 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-150 h-150 bg-secondary/10 rounded-full blur-[120px]" />
        </div>
        <Card className="p-8 max-w-md w-full text-center glass-panel border-0">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 mb-4">
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Form Not Found</h2>
          <p className="text-muted-foreground">{error}</p>
        </Card>
      </div>
    );
  }

  if (!form) return null;

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden px-4">
        {/* Background Blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-150 h-150 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-150 h-150 bg-secondary/10 rounded-full blur-[120px]" />
        </div>
        <Card className="p-8 max-w-md w-full text-center glass-panel border-0">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Thank You!</h2>
          <p className="text-muted-foreground">
            {form.settings?.thankYouMessage || "Your response has been recorded."}
          </p>
          {form.settings?.redirectUrl && (
            <p className="text-sm text-muted-foreground mt-4">Redirecting...</p>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden py-12 px-4">
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-150 h-150 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-150 h-150 bg-secondary/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[30%] w-100 h-100 bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Form Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/20 rounded-2xl mb-4 backdrop-blur-sm border border-white/10">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">{form.title}</h1>
          {form.description && (
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">{form.description}</p>
          )}
        </div>

        {/* Progress Bar */}
        {form.settings?.showProgressBar && visibleQuestions.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Progress</span>
              <span>
                {Object.keys(answers).filter(id => visibleQuestions.some(q => q.id === id && answers[id])).length} / {visibleQuestions.length}
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{
                  width: `${(Object.keys(answers).filter(id => visibleQuestions.some(q => q.id === id && answers[id])).length / visibleQuestions.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Form Card */}
        <Card className="p-8 glass-panel border-0">
          <form onSubmit={handleSubmit} className="space-y-8">
            {visibleQuestions.map((question, index) => (
              <div key={question.id} className="space-y-3">
                <Label className="text-base font-medium text-foreground">
                  {index + 1}. {question.label}
                  {question.required && <span className="text-red-400 ml-1">*</span>}
                </Label>
                {question.description && (
                  <p className="text-sm text-muted-foreground">{question.description}</p>
                )}

                {/* Render input based on question type */}
                {renderQuestionInput(question, answers[question.id], (value) =>
                  handleAnswerChange(question.id, value)
                )}

                {validationErrors[question.id] && (
                  <p className="text-sm text-red-400">{validationErrors[question.id]}</p>
                )}
              </div>
            ))}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 glass-button text-base font-medium"
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
          <p className="text-sm text-muted-foreground">
            Powered by <span className="font-semibold text-primary">FormBuilder</span>
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
  const commonInputClasses = "bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground focus:bg-white/10";

  switch (question.type) {
    case "short_text":
    case "email":
      return (
        <Input
          type={question.type === "email" ? "email" : "text"}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          className={commonInputClasses}
        />
      );

    case "phone":
      return (
        <PhoneInput
          value={value || ""}
          onChange={onChange}
          placeholder={question.placeholder || "Enter phone number"}
          className="w-full"
        />
      );

    case "long_text":
      return (
        <Textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          rows={4}
          className={commonInputClasses}
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
          className={commonInputClasses}
        />
      );

    case "date":
      return (
        <Input
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={commonInputClasses}
        />
      );

    case "multiple_choice":
      return (
        <div className="space-y-3">
          {question.options?.map((option) => (
            <label
              key={option.id}
              className={`flex items-center space-x-3 p-3 rounded-lg border border-white/10 cursor-pointer transition-colors ${
                value === option.value ? "bg-primary/20 border-primary/50" : "hover:bg-white/5 bg-white/5"
              }`}
            >
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value)}
                className="h-4 w-4 text-primary bg-transparent border-white/30"
              />
              <span className="text-foreground">{option.label}</span>
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
              className={`flex items-center space-x-3 p-3 rounded-lg border border-white/10 cursor-pointer transition-colors ${
                (value || []).includes(option.value) ? "bg-primary/20 border-primary/50" : "hover:bg-white/5 bg-white/5"
              }`}
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
                className="h-4 w-4 text-primary rounded bg-transparent border-white/30"
              />
              <span className="text-foreground">{option.label}</span>
            </label>
          ))}
        </div>
      );

    case "dropdown":
      return (
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-4 py-2 border border-white/10 rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-white/5 text-foreground ${commonInputClasses}`}
        >
          <option value="" className="bg-slate-900 text-foreground">Select an option</option>
          {question.options?.map((option) => (
            <option key={option.id} value={option.value} className="bg-slate-900 text-foreground">
              {option.label}
            </option>
          ))}
        </select>
      );

    case "file_upload":
      return (
        <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-primary/50 transition-colors bg-white/5">
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
              className="mx-auto h-12 w-12 text-muted-foreground"
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
            <p className="mt-2 text-sm text-muted-foreground">
              {value?.name || "Click to upload or drag and drop"}
            </p>
          </label>
        </div>
      );

    default:
      return null;
  }
}
