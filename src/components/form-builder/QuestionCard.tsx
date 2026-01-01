import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Copy, Trash2 } from "lucide-react";
import type { Question } from "@/lib/api/forms";

interface QuestionCardProps {
  question: Question;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function QuestionCard({
  question,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: QuestionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-4 cursor-pointer transition-all ${
        isSelected
          ? "ring-2 ring-primary shadow-lg bg-white/10"
          : "hover:bg-white/5 border-white/10"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start space-x-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* Question Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-medium text-foreground">
                  {question.label}
                </h4>
                {question.required && (
                  <span className="text-red-400 text-sm">*</span>
                )}
              </div>
              {question.description && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {question.description}
                </p>
              )}
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white/10 text-white border border-white/10">
                  {question.type.replace("_", " ")}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="h-8 w-8 p-0 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>

          {/* Preview based on question type */}
          <div className="mt-3">
            {(question.type === "short_text" || question.type === "email" || question.type === "phone") && (
              <div className="h-10 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2">
                <span className="text-sm text-gray-400">{question.placeholder || "Enter your answer..."}</span>
              </div>
            )}
            {question.type === "long_text" && (
              <div className="h-20 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2">
                <span className="text-sm text-gray-400">{question.placeholder || "Enter your answer..."}</span>
              </div>
            )}
            {question.type === "number" && (
              <div className="h-10 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2">
                <span className="text-sm text-gray-400">0</span>
              </div>
            )}
            {question.type === "date" && (
              <div className="h-10 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2">
                <span className="text-sm text-gray-400">MM/DD/YYYY</span>
              </div>
            )}
            {(question.type === "multiple_choice" || question.type === "checkboxes") && (
              <div className="space-y-2">
                {question.options?.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <div className={`h-4 w-4 rounded ${question.type === "multiple_choice" ? "rounded-full" : ""} border-2 border-gray-400`} />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </div>
                ))}
              </div>
            )}
            {question.type === "dropdown" && (
              <div className="h-10 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 flex items-center justify-between">
                <span className="text-sm text-gray-400">Select an option</span>
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
            {question.type === "file_upload" && (
              <div className="h-24 w-full rounded-md border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="mt-2 block text-xs text-gray-400">Click to upload</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
