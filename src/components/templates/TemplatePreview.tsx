"use client";

import { Template } from "@/lib/api/templates";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, FileText, CheckCircle, Circle, X } from "lucide-react";

interface TemplatePreviewProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onUse: (template: Template) => void;
}

const questionTypeLabels: Record<string, string> = {
  short_text: "Short Text",
  long_text: "Long Text",
  multiple_choice: "Multiple Choice",
  checkboxes: "Checkboxes",
  dropdown: "Dropdown",
  email: "Email",
  phone: "Phone",
  number: "Number",
  date: "Date",
  file_upload: "File Upload",
};

const questionTypeIcons: Record<string, string> = {
  short_text: "📝",
  long_text: "📄",
  multiple_choice: "⭕",
  checkboxes: "☑️",
  dropdown: "📋",
  email: "📧",
  phone: "📱",
  number: "🔢",
  date: "📅",
  file_upload: "📎",
};

export function TemplatePreview({ template, isOpen, onClose, onUse }: TemplatePreviewProps) {
  if (!template) return null;

  const handleUse = () => {
    onUse(template);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 glass-panel border-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{template.icon}</span>
                <DialogTitle className="text-2xl text-foreground">
                  {template.name}
                </DialogTitle>
              </div>
              <DialogDescription className="text-base text-muted-foreground">
                {template.description}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              {template.category}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{template.questions.length} questions</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>~{template.estimatedTime} min</span>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {/* Questions Preview */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Questions in this template
              </h3>
              <div className="space-y-4">
                {template.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="p-4 rounded-lg bg-white/5 border border-white/10"
                  >
                    {/* Question Header */}
                    <div className="flex items-start gap-3 mb-2">
                      <div className="shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base font-medium text-foreground">
                            {question.label}
                          </span>
                          {question.required && (
                            <span className="text-red-400 text-sm">*</span>
                          )}
                        </div>
                        {question.description && (
                          <p className="text-sm text-muted-foreground">
                            {question.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span>{questionTypeIcons[question.type]}</span>
                        <span>{questionTypeLabels[question.type]}</span>
                      </div>
                    </div>

                    {/* Question Options (if applicable) */}
                    {question.options && question.options.length > 0 && (
                      <div className="mt-3 ml-9 space-y-1.5">
                        {question.options.map((option) => (
                          <div
                            key={option.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            {question.type === "multiple_choice" ? (
                              <Circle className="h-3 w-3 text-muted-foreground" />
                            ) : (
                              <CheckCircle className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className="text-foreground">{option.label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Question Placeholder */}
                    {question.placeholder && (
                      <div className="mt-3 ml-9">
                        <p className="text-xs text-muted-foreground italic">
                          Placeholder: {question.placeholder}
                        </p>
                      </div>
                    )}

                    {/* Validation */}
                    {question.validation && (
                      <div className="mt-3 ml-9">
                        <p className="text-xs text-muted-foreground">
                          {question.validation.min !== undefined &&
                            `Min: ${question.validation.min}`}
                          {question.validation.max !== undefined &&
                            ` Max: ${question.validation.max}`}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Template Settings */}
            <div className="pt-6 border-t border-white/10">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Form Settings
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Progress Bar</p>
                  <p className="text-foreground">
                    {template.settings.showProgressBar ? "Enabled" : "Disabled"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Multiple Submissions</p>
                  <p className="text-foreground">
                    {template.settings.allowMultipleSubmissions ? "Allowed" : "Not Allowed"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Submit Button</p>
                  <p className="text-foreground">{template.settings.submitButtonText}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground mb-1">Thank You Message</p>
                  <p className="text-foreground">{template.settings.thankYouMessage}</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {template.tags.length > 0 && (
              <div className="pt-6 border-t border-white/10">
                <h3 className="text-sm font-semibold text-foreground mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {template.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="bg-white/5 border-white/10"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-white/10 flex items-center justify-between bg-white/5">
          <div>
            {template.usageCount > 0 && (
              <p className="text-sm text-muted-foreground">
                Used {template.usageCount} time{template.usageCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="glass-panel border-0">
              Cancel
            </Button>
            <Button onClick={handleUse} className="glass-button">
              Use This Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
