"use client";

import { Template } from "@/lib/api/templates";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, FileText, Eye } from "lucide-react";
import { motion } from "framer-motion";

interface TemplateCardProps {
  template: Template;
  onPreview: (template: Template) => void;
  onUse: (template: Template) => void;
}

const categoryColors = {
  education: "bg-blue-500",
  event: "bg-purple-500",
  business: "bg-green-500",
  survey: "bg-orange-500",
  hr: "bg-red-500",
  other: "bg-gray-500",
};

const categoryLabels = {
  education: "Education",
  event: "Event",
  business: "Business",
  survey: "Survey",
  hr: "Human Resources",
  other: "Other",
};

export function TemplateCard({ template, onPreview, onUse }: TemplateCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card className="p-6 glass-panel border-0 hover:border-primary/50 transition-all cursor-pointer group">
        {/* Category Badge & Icon */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{template.icon}</div>
            <div
              className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${
                categoryColors[template.category]
              }`}
            >
              {categoryLabels[template.category]}
            </div>
          </div>
        </div>

        {/* Template Name */}
        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {template.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {template.description}
        </p>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>{template.questions.length} questions</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>~{template.estimatedTime} min</span>
          </div>
        </div>

        {/* Question Preview */}
        <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <p className="text-xs text-muted-foreground mb-2">Questions preview:</p>
          <ol className="text-xs text-foreground space-y-1">
            {template.questions.slice(0, 3).map((q, index) => (
              <li key={q.id} className="truncate">
                {index + 1}. {q.label}
              </li>
            ))}
            {template.questions.length > 3 && (
              <li className="text-muted-foreground">
                +{template.questions.length - 3} more...
              </li>
            )}
          </ol>
        </div>

        {/* Usage Count */}
        {template.usageCount > 0 && (
          <div className="text-xs text-muted-foreground mb-4">
            Used {template.usageCount} time{template.usageCount !== 1 ? "s" : ""}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(template);
            }}
            className="flex-1 glass-button"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onUse(template);
            }}
            className="flex-1 glass-button"
          >
            Use Template
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
