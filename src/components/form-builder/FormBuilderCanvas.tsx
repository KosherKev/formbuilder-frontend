"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QuestionCard } from "./QuestionCard";
import { QuestionEditor } from "./QuestionEditor";
import type { Question } from "@/lib/api/forms";

interface FormBuilderCanvasProps {
  questions: Question[];
  selectedQuestionId: string | null;
  onSelectQuestion: (id: string | null) => void;
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
  onDeleteQuestion: (id: string) => void;
  onDuplicateQuestion: (id: string) => void;
  onReorderQuestions: (questions: Question[]) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
}

export function FormBuilderCanvas({
  questions,
  selectedQuestionId,
  onSelectQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onDuplicateQuestion,
  onReorderQuestions,
  description,
  onDescriptionChange,
}: FormBuilderCanvasProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);

      onReorderQuestions(arrayMove(questions, oldIndex, newIndex));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Canvas */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="p-6 bg-white">
          <div className="space-y-4">
            <div>
              <Label className="text-gray-700">Form Description (Optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Add a description to help respondents understand your form..."
                className="mt-2 bg-white text-gray-900"
                rows={3}
              />
            </div>
          </div>
        </Card>

        {questions.length === 0 ? (
          <Card className="p-12 bg-white text-center">
            <div className="mx-auto flex flex-col items-center justify-center space-y-3">
              <div className="rounded-full bg-gray-100 p-4">
                <svg
                  className="h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  No questions yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add questions from the sidebar to start building your form
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={questions.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {questions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    isSelected={selectedQuestionId === question.id}
                    onSelect={() => onSelectQuestion(question.id)}
                    onDelete={() => onDeleteQuestion(question.id)}
                    onDuplicate={() => onDuplicateQuestion(question.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Question Editor Sidebar */}
      <div className="lg:col-span-1">
        {selectedQuestion ? (
          <QuestionEditor
            question={selectedQuestion}
            onUpdate={(updates) => onUpdateQuestion(selectedQuestion.id, updates)}
            onClose={() => onSelectQuestion(null)}
          />
        ) : (
          <Card className="p-6 bg-white sticky top-24">
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  No question selected
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Click on a question to edit its properties
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
