import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import type { Form } from "@/lib/api/forms";
import { applyThemeStyles, getCardStyleClasses } from "@/lib/themes";
import { cn } from "@/lib/utils";

interface FormPreviewProps {
  form: Form;
  onClose: () => void;
}

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

export function FormPreview({ form, onClose }: FormPreviewProps) {
  // Generate theme styles if a theme is selected
  const themeStyles = form.theme ? applyThemeStyles(form.theme) : {};

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
        <div 
          className="p-8 min-h-125 flex items-center justify-center"
          style={themeStyles}
        >
          <Card 
            className={cn(
              "p-8 max-w-xl w-full mx-auto transition-all duration-300",
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
                  className="text-muted-foreground"
                  style={{ 
                    fontFamily: 'var(--theme-font-body)',
                    color: 'var(--theme-muted)'
                  }}
                >
                  {form.description}
                </p>
              )}
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {form.questions.map((question, index) => (
                <div key={question.id} className="space-y-2">
                  {/* Apply text styles to question label */}
                  <label 
                    className={cn(
                      "block text-sm font-medium",
                      getTextStyleClasses(question.textStyle)
                    )}
                    style={{ 
                      fontFamily: 'var(--theme-font-body)',
                      color: 'var(--theme-foreground)'
                    }}
                  >
                    {index + 1}. {question.label}
                    {question.required && (
                      <span className="text-red-400 ml-1">*</span>
                    )}
                  </label>
                  
                  {/* Apply text styles to question description */}
                  {question.description && (
                    <p 
                      className={cn(
                        "text-sm text-muted-foreground",
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

                  {/* Render based on question type */}
                  {(question.type === "short_text" ||
                    question.type === "email" ||
                    question.type === "phone") && (
                    <input
                      type={question.type === "email" ? "email" : "text"}
                      placeholder={question.placeholder}
                      className="w-full px-3 py-2 border border-white/10 bg-white/5 rounded-md focus:ring-2 text-foreground placeholder:text-muted-foreground"
                      style={{
                        borderColor: 'var(--theme-muted)',
                        outlineColor: 'var(--theme-primary)',
                        fontFamily: 'var(--theme-font-body)',
                      }}
                      disabled
                    />
                  )}

                  {question.type === "long_text" && (
                    <textarea
                      placeholder={question.placeholder}
                      rows={4}
                      className="w-full px-3 py-2 border border-white/10 bg-white/5 rounded-md focus:ring-2 text-foreground placeholder:text-muted-foreground"
                      style={{
                        borderColor: 'var(--theme-muted)',
                        outlineColor: 'var(--theme-primary)',
                        fontFamily: 'var(--theme-font-body)',
                      }}
                      disabled
                    />
                  )}

                  {question.type === "number" && (
                    <input
                      type="number"
                      placeholder={question.placeholder}
                      min={question.validation?.min}
                      max={question.validation?.max}
                      className="w-full px-3 py-2 border border-white/10 bg-white/5 rounded-md focus:ring-2 text-foreground placeholder:text-muted-foreground"
                      style={{
                        borderColor: 'var(--theme-muted)',
                        outlineColor: 'var(--theme-primary)',
                        fontFamily: 'var(--theme-font-body)',
                      }}
                      disabled
                    />
                  )}

                  {question.type === "date" && (
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-white/10 bg-white/5 rounded-md focus:ring-2 text-foreground placeholder:text-muted-foreground"
                      style={{
                        borderColor: 'var(--theme-muted)',
                        outlineColor: 'var(--theme-primary)',
                        fontFamily: 'var(--theme-font-body)',
                      }}
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
                            className="h-4 w-4"
                            style={{ accentColor: 'var(--theme-primary)' }}
                            disabled
                          />
                          <span 
                            className="text-sm"
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
                    <div className="space-y-2">
                      {question.options?.map((option) => (
                        <label
                          key={option.id}
                          className="flex items-center space-x-2 p-2 rounded hover:bg-white/5"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded"
                            style={{ accentColor: 'var(--theme-primary)' }}
                            disabled
                          />
                          <span 
                            className="text-sm"
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

                  {question.type === "dropdown" && (
                    <select
                      className="w-full px-3 py-2 border rounded-md focus:ring-2"
                      style={{
                        borderColor: 'var(--theme-muted)',
                        outlineColor: 'var(--theme-primary)',
                        color: 'var(--theme-foreground)',
                        backgroundColor: 'transparent',
                        fontFamily: 'var(--theme-font-body)',
                      }}
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
                    <div 
                      className="border-2 border-dashed rounded-md p-6 text-center"
                      style={{ borderColor: 'var(--theme-muted)' }}
                    >
                      <svg
                        className="mx-auto h-12 w-12"
                        style={{ color: 'var(--theme-muted)' }}
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
                      <p 
                        className="mt-2 text-sm"
                        style={{ 
                          fontFamily: 'var(--theme-font-body)',
                          color: 'var(--theme-muted)'
                        }}
                      >
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
                className="w-full text-white py-3 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--theme-primary)',
                  fontFamily: 'var(--theme-font-body)',
                }}
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