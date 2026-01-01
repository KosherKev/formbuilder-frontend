import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import type { Form } from "@/lib/api/forms";

interface FormPreviewProps {
  form: Form;
  onClose: () => void;
}

export function FormPreview({ form, onClose }: FormPreviewProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background/50 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Preview Mode</h2>
            <p className="text-sm text-muted-foreground">This is how your form will look to respondents</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form Preview */}
        <div className="p-8">
          <Card className="p-8 max-w-xl mx-auto border-white/10 bg-white/5">
            {/* Form Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {form.title}
              </h1>
              {form.description && (
                <p className="text-muted-foreground">{form.description}</p>
              )}
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {form.questions.map((question, index) => (
                <div key={question.id} className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    {index + 1}. {question.label}
                    {question.required && (
                      <span className="text-red-400 ml-1">*</span>
                    )}
                  </label>
                  {question.description && (
                    <p className="text-sm text-muted-foreground">{question.description}</p>
                  )}

                  {/* Render based on question type */}
                  {(question.type === "short_text" ||
                    question.type === "email" ||
                    question.type === "phone") && (
                    <input
                      type={question.type === "email" ? "email" : "text"}
                      placeholder={question.placeholder}
                      className="w-full px-3 py-2 border border-white/10 bg-white/5 rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
                      disabled
                    />
                  )}

                  {question.type === "long_text" && (
                    <textarea
                      placeholder={question.placeholder}
                      rows={4}
                      className="w-full px-3 py-2 border border-white/10 bg-white/5 rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
                      disabled
                    />
                  )}

                  {question.type === "number" && (
                    <input
                      type="number"
                      placeholder={question.placeholder}
                      min={question.validation?.min}
                      max={question.validation?.max}
                      className="w-full px-3 py-2 border border-white/10 bg-white/5 rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
                      disabled
                    />
                  )}

                  {question.type === "date" && (
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-white/10 bg-white/5 rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
                      disabled
                    />
                  )}

                  {question.type === "multiple_choice" && (
                    <div className="space-y-2">
                      {question.options?.map((option) => (
                        <label
                          key={option.id}
                          className="flex items-center space-x-2 p-2 rounded hover:bg-white/5"
                        >
                          <input
                            type="radio"
                            name={question.id}
                            className="h-4 w-4 text-blue-600"
                            disabled
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {question.type === "checkboxes" && (
                    <div className="space-y-2">
                      {question.options?.map((option) => (
                        <label
                          key={option.id}
                          className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 rounded"
                            disabled
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {question.type === "dropdown" && (
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      disabled
                    >
                      <option>Select an option</option>
                      {question.options?.map((option) => (
                        <option key={option.id} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {question.type === "file_upload" && (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
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
                      <p className="mt-2 text-sm text-gray-500">
                        Click to upload or drag and drop
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <button
                disabled
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {form.settings?.submitButtonText || "Submit"}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
