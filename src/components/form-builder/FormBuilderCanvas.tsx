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
  title: string;
  description: string;
  onUpdateTitle: (title: string) => void;
  onUpdateDescription: (description: string) => void;
}

export function FormBuilderCanvas({
  questions,
  selectedQuestionId,
  onSelectQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onDuplicateQuestion,
  onReorderQuestions,
  title,
  description,
  onUpdateTitle,
  onUpdateDescription,
}: FormBuilderCanvasProps) {
  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId) || null;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);

      const newQuestions = arrayMove(questions, oldIndex, newIndex).map((q, index) => ({
        ...q,
        order: index,
      }));

      onReorderQuestions(newQuestions);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Canvas */}
      <div className="lg:col-span-2 space-y-6">
        {/* Form Header */}
        <Card className="p-6 glass-panel border-0">
          <div className="space-y-4">
            <div>
              <Label className="text-foreground mb-2">Form Title</Label>
              <input
                type="text"
                value={title}
                onChange={(e) => onUpdateTitle(e.target.value)}
                className="w-full text-2xl font-bold bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
                placeholder="Untitled Form"
              />
            </div>
            <div>
              <Label className="text-foreground mb-2">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => onUpdateDescription(e.target.value)}
                placeholder="Add a description for your form..."
                rows={2}
                className="text-foreground resize-none"
              />
            </div>
          </div>
        </Card>

        {/* Questions List */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {questions.length === 0 ? (
                <Card className="p-12 text-center glass-panel border-2 border-dashed">
                  <div className="space-y-3">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <svg
                        className="h-8 w-8 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">No questions yet</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Add your first question using the toolbar above
                      </p>
                    </div>
                  </div>
                </Card>
              ) : (
                questions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    isSelected={selectedQuestionId === question.id}
                    onSelect={() => onSelectQuestion(question.id)}
                    onDelete={() => onDeleteQuestion(question.id)}
                    onDuplicate={() => onDuplicateQuestion(question.id)}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Question Editor Sidebar */}
      <div className="lg:col-span-1">
        {selectedQuestion ? (
          <QuestionEditor
            question={selectedQuestion}
            allQuestions={questions}
            onUpdate={(updates) => onUpdateQuestion(selectedQuestion.id, updates)}
            onClose={() => onSelectQuestion(null)}
          />
        ) : (
          <Card className="p-6 glass-panel border-0 sticky top-24">
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <svg
                  className="h-6 w-6 text-primary"
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
                <h3 className="text-sm font-semibold text-foreground">
                  No question selected
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Click on a question to edit its properties or add logic
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
