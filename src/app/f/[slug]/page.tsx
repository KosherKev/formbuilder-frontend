"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { formService } from "@/lib/api/forms";
import { responseService } from "@/lib/api/responses";
import type { Form, Question } from "@/lib/api/forms";
import { applyThemeStyles, getCardStyleClasses } from "@/lib/themes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { validatePhoneNumber, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Configuration
const QUESTIONS_PER_PAGE = 2; // Change this to 1 if you want one question per page

// Helper function to get text style classes
const getTextStyleClasses = (textStyle?: {
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: 'tight' | 'normal' | 'relaxed' | 'loose';
}) => {
  if (!textStyle) return '';
  
  const fontSize = textStyle.fontSize || 'base';
  const fontWeight = textStyle.fontWeight || 'normal';
  const textAlign = textStyle.textAlign || 'left';
  const lineHeight = textStyle.lineHeight || 'normal';
  
  return `text-${fontSize} font-${fontWeight} text-${textAlign} leading-${lineHeight}`;
};

// Logic evaluation function
function evaluateLogic(question: Question, answers: { [key: string]: any }): boolean {
  if (!question.conditionalLogic?.enabled || !question.conditionalLogic?.conditions) {
    return true;
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
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

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

  // Paginate questions
  const totalPages = Math.ceil(visibleQuestions.length / QUESTIONS_PER_PAGE);
  const currentQuestions = visibleQuestions.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE
  );

  // Calculate progress
  const progress = visibleQuestions.length > 0 
    ? Math.round(((currentPage * QUESTIONS_PER_PAGE + currentQuestions.length) / visibleQuestions.length) * 100)
    : 0;

  const validateCurrentPage = (): boolean => {
    const errors: { [key: string]: string } = {};
    
    currentQuestions.forEach((question) => {
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

  const handleNext = () => {
    if (!validateCurrentPage()) {
      return;
    }

    if (currentPage < totalPages - 1) {
      setDirection('forward');
      setCurrentPage(currentPage + 1);
      setValidationErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setDirection('backward');
      setCurrentPage(currentPage - 1);
      setValidationErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentPage()) {
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden px-4">
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

  const themeStyles = form.theme ? applyThemeStyles(form.theme) : {};

  if (submitted) {
    return (
      <div 
        className="flex min-h-screen items-center justify-center relative overflow-hidden px-4"
        style={themeStyles}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card 
            className={cn(
              "p-8 max-w-md w-full text-center border-0",
              getCardStyleClasses(form.theme?.cardStyle)
            )}
            style={{
              borderRadius: 'var(--theme-border-radius)',
            }}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <h2 
              className="text-xl font-semibold mb-2"
              style={{ 
                fontFamily: 'var(--theme-font-heading)',
                color: 'var(--theme-foreground)'
              }}
            >
              Thank You!
            </h2>
            <p 
              className="text-muted-foreground"
              style={{ 
                fontFamily: 'var(--theme-font-body)',
                color: 'var(--theme-muted)'
              }}
            >
              {form.settings?.thankYouMessage || "Your response has been recorded."}
            </p>
            {form.settings?.redirectUrl && (
              <p 
                className="text-sm mt-4"
                style={{ color: 'var(--theme-muted)' }}
              >
                Redirecting...
              </p>
            )}
          </Card>
        </motion.div>
      </div>
    );
  }

  const isLastPage = currentPage === totalPages - 1;

  const variants = {
    enter: (direction: 'forward' | 'backward') => ({
      opacity: 0,
      x: direction === 'forward' ? 50 : -50,
    }),
    center: {
      opacity: 1,
      x: 0,
    },
    exit: (direction: 'forward' | 'backward') => ({
      opacity: 0,
      x: direction === 'forward' ? -50 : 50,
    }),
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden py-12 px-4"
      style={themeStyles}
    >
      <div className="max-w-2xl mx-auto">
        <Card 
          className={cn(
            "p-8",
            getCardStyleClasses(form.theme?.cardStyle)
          )}
          style={{
            borderRadius: 'var(--theme-border-radius)',
          }}
        >
          {/* Form Header */}
          <div className="mb-8">
            <h1 
              className="text-3xl font-bold mb-2"
              style={{ 
                fontFamily: 'var(--theme-font-heading)',
                color: 'var(--theme-foreground)'
              }}
            >
              {form.title}
            </h1>
            {form.description && (
              <p 
                style={{ 
                  fontFamily: 'var(--theme-font-body)',
                  color: 'var(--theme-muted)'
                }}
              >
                {form.description}
              </p>
            )}
          </div>

          {/* Progress Bar */}
          {form.settings?.showProgressBar && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span 
                  className="text-sm font-medium"
                  style={{ color: 'var(--theme-foreground)' }}
                >
                  Progress
                </span>
                <span 
                  className="text-sm font-medium"
                  style={{ color: 'var(--theme-primary)' }}
                >
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: 'var(--theme-primary)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p 
                className="text-xs mt-2"
                style={{ color: 'var(--theme-muted)' }}
              >
                Question {currentPage * QUESTIONS_PER_PAGE + 1} - {Math.min((currentPage + 1) * QUESTIONS_PER_PAGE, visibleQuestions.length)} of {visibleQuestions.length}
              </p>
            </div>
          )}

          {/* Questions with Animation */}
          <div className="min-h-100">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentPage}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {currentQuestions.map((question, index) => {
                  const globalIndex = currentPage * QUESTIONS_PER_PAGE + index;
                  
                  return (
                    <div key={question.id} className="space-y-3">
                      {/* Apply text styles to label */}
                      <Label 
                        className={cn(
                          "block text-lg font-medium",
                          getTextStyleClasses(question.textStyle)
                        )}
                        style={{ 
                          fontFamily: 'var(--theme-font-body)',
                          color: 'var(--theme-foreground)'
                        }}
                      >
                        {globalIndex + 1}. {question.label}
                        {question.required && (
                          <span className="text-red-400 ml-1">*</span>
                        )}
                      </Label>
                      
                      {/* Apply text styles to description */}
                      {question.description && (
                        <p 
                          className={cn(
                            "text-sm",
                            getTextStyleClasses(question.textStyle)
                          )}
                          style={{ 
                            fontFamily: 'var(--theme-font-body)',
                            color: 'var(--theme-muted)'
                          }}
                        >
                          {question.description}
                        </p>
                      )}

                      {/* Question Inputs */}
                      {(question.type === "short_text" || question.type === "email") && (
                        <Input
                          type={question.type === "email" ? "email" : "text"}
                          placeholder={question.placeholder}
                          value={answers[question.id] || ""}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className={cn("text-base", validationErrors[question.id] ? "border-red-500" : "")}
                          style={{
                            borderColor: validationErrors[question.id] ? undefined : 'var(--theme-muted)',
                            outlineColor: 'var(--theme-primary)',
                            fontFamily: 'var(--theme-font-body)',
                          }}
                        />
                      )}

                      {question.type === "long_text" && (
                        <Textarea
                          placeholder={question.placeholder}
                          value={answers[question.id] || ""}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          rows={6}
                          className={cn("text-base", validationErrors[question.id] ? "border-red-500" : "")}
                          style={{
                            borderColor: validationErrors[question.id] ? undefined : 'var(--theme-muted)',
                            outlineColor: 'var(--theme-primary)',
                            fontFamily: 'var(--theme-font-body)',
                          }}
                        />
                      )}

                      {question.type === "number" && (
                        <Input
                          type="number"
                          placeholder={question.placeholder}
                          min={question.validation?.min}
                          max={question.validation?.max}
                          value={answers[question.id] || ""}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className={cn("text-base", validationErrors[question.id] ? "border-red-500" : "")}
                          style={{
                            borderColor: validationErrors[question.id] ? undefined : 'var(--theme-muted)',
                            outlineColor: 'var(--theme-primary)',
                            fontFamily: 'var(--theme-font-body)',
                          }}
                        />
                      )}

                      {question.type === "phone" && (
                        <Input
                          type="tel"
                          placeholder={question.placeholder}
                          value={answers[question.id] || ""}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className={cn("text-base", validationErrors[question.id] ? "border-red-500" : "")}
                          style={{
                            borderColor: validationErrors[question.id] ? undefined : 'var(--theme-muted)',
                            outlineColor: 'var(--theme-primary)',
                            fontFamily: 'var(--theme-font-body)',
                          }}
                        />
                      )}

                      {question.type === "date" && (
                        <Input
                          type="date"
                          value={answers[question.id] || ""}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className={cn("text-base", validationErrors[question.id] ? "border-red-500" : "")}
                          style={{
                            borderColor: validationErrors[question.id] ? undefined : 'var(--theme-muted)',
                            outlineColor: 'var(--theme-primary)',
                            fontFamily: 'var(--theme-font-body)',
                          }}
                        />
                      )}

                      {question.type === "multiple_choice" && (
                        <div className="space-y-3">
                          {question.options?.map((option) => (
                            <label
                              key={option.id}
                              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                            >
                              <input
                                type="radio"
                                name={question.id}
                                value={option.value}
                                checked={answers[question.id] === option.value}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                className="h-5 w-5"
                                style={{ accentColor: 'var(--theme-primary)' }}
                              />
                              <span 
                                className="text-base"
                                style={{ 
                                  fontFamily: 'var(--theme-font-body)',
                                  color: 'var(--theme-foreground)'
                                }}
                              >
                                {option.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      {question.type === "checkboxes" && (
                        <div className="space-y-3">
                          {question.options?.map((option) => {
                            const currentValues = (answers[question.id] as string[]) || [];
                            const isChecked = currentValues.includes(option.value);
                            
                            return (
                              <label
                                key={option.id}
                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  value={option.value}
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const newValues = e.target.checked
                                      ? [...currentValues, option.value]
                                      : currentValues.filter((v) => v !== option.value);
                                    handleAnswerChange(question.id, newValues);
                                  }}
                                  className="h-5 w-5 rounded"
                                  style={{ accentColor: 'var(--theme-primary)' }}
                                />
                                <span 
                                  className="text-base"
                                  style={{ 
                                    fontFamily: 'var(--theme-font-body)',
                                    color: 'var(--theme-foreground)'
                                  }}
                                >
                                  {option.label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {question.type === "dropdown" && (
                        <select
                          value={answers[question.id] || ""}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className={cn(
                            "w-full px-4 py-3 border rounded-lg focus:ring-2 text-base",
                            validationErrors[question.id] ? "border-red-500" : ""
                          )}
                          style={{
                            borderColor: validationErrors[question.id] ? undefined : 'var(--theme-muted)',
                            outlineColor: 'var(--theme-primary)',
                            color: 'var(--theme-foreground)',
                            backgroundColor: 'transparent',
                            fontFamily: 'var(--theme-font-body)',
                          }}
                        >
                          <option value="">Select an option</option>
                          {question.options?.map((option) => (
                            <option key={option.id} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}

                      {validationErrors[question.id] && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500"
                        >
                          {validationErrors[question.id]}
                        </motion.p>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentPage === 0}
              className="glass-button"
              style={{
                fontFamily: 'var(--theme-font-body)',
              }}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    idx === currentPage ? "w-8" : "w-2"
                  )}
                  style={{
                    backgroundColor: idx === currentPage 
                      ? 'var(--theme-primary)' 
                      : 'var(--theme-muted)',
                    opacity: idx === currentPage ? 1 : 0.3,
                  }}
                />
              ))}
            </div>

            {isLastPage ? (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="text-white"
                style={{
                  backgroundColor: 'var(--theme-primary)',
                  fontFamily: 'var(--theme-font-body)',
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    {form.settings?.submitButtonText || "Submit"}
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleNext}
                className="glass-button"
                style={{
                  fontFamily: 'var(--theme-font-body)',
                }}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}