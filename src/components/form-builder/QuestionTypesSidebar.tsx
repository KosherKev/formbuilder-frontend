import { Card } from "@/components/ui/card";
import {
  Type,
  AlignLeft,
  Mail,
  Phone,
  CheckSquare,
  List,
  ChevronDown,
  Hash,
  Calendar,
  Upload,
} from "lucide-react";
import type { Question } from "@/lib/api/forms";

interface QuestionTypesSidebarProps {
  onAddQuestion: (type: Question["type"]) => void;
}

const questionTypes = [
  { type: "short_text" as const, label: "Short Text", icon: Type, description: "Single line text" },
  { type: "long_text" as const, label: "Long Text", icon: AlignLeft, description: "Paragraph text" },
  { type: "email" as const, label: "Email", icon: Mail, description: "Email address" },
  { type: "phone" as const, label: "Phone", icon: Phone, description: "Phone number" },
  { type: "multiple_choice" as const, label: "Multiple Choice", icon: CheckSquare, description: "Single selection" },
  { type: "checkboxes" as const, label: "Checkboxes", icon: List, description: "Multiple selections" },
  { type: "dropdown" as const, label: "Dropdown", icon: ChevronDown, description: "Select from list" },
  { type: "number" as const, label: "Number", icon: Hash, description: "Numeric input" },
  { type: "date" as const, label: "Date", icon: Calendar, description: "Date picker" },
  { type: "file_upload" as const, label: "File Upload", icon: Upload, description: "File attachment" },
];

export function QuestionTypesSidebar({ onAddQuestion }: QuestionTypesSidebarProps) {
  return (
    <aside className="w-64 border-r bg-white p-4 overflow-y-auto">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Question Types</h3>
        <p className="text-xs text-gray-500">Click to add to your form</p>
      </div>
      
      <div className="space-y-2">
        {questionTypes.map((qt) => (
          <button
            key={qt.type}
            onClick={() => onAddQuestion(qt.type)}
            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                <qt.icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 group-hover:text-blue-900">
                  {qt.label}
                </p>
                <p className="text-xs text-gray-500 group-hover:text-blue-700">
                  {qt.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
