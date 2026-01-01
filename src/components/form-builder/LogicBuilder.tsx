"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { Question } from "@/lib/api/forms";
import { cn } from "@/lib/utils";

interface LogicRule {
  questionId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
  value: any;
}

interface ConditionalLogic {
  enabled: boolean;
  conditions: LogicRule[];
  action: 'show' | 'hide' | 'jump_to';
  targetQuestionId?: string;
  logicOperator?: 'AND' | 'OR';
}

interface LogicBuilderProps {
  question: Question;
  allQuestions: Question[];
  onUpdate: (logic: ConditionalLogic) => void;
}

const operatorLabels = {
  equals: 'equals',
  not_equals: 'does not equal',
  contains: 'contains',
  not_contains: 'does not contain',
  greater_than: 'is greater than',
  less_than: 'is less than',
};

const actionLabels = {
  show: 'Show this question',
  hide: 'Hide this question',
  jump_to: 'Jump to question',
};

export function LogicBuilder({ question, allQuestions, onUpdate }: LogicBuilderProps) {
  const [logic, setLogic] = useState<ConditionalLogic>(
    question.conditionalLogic || {
      enabled: false,
      conditions: [],
      action: 'show',
      logicOperator: 'AND',
    }
  );

  // Get questions that come before this one (for logic dependencies)
  const previousQuestions = allQuestions.filter((q) => q.order < question.order);

  const updateLogic = (updates: Partial<ConditionalLogic>) => {
    const newLogic = { ...logic, ...updates };
    setLogic(newLogic);
    onUpdate(newLogic);
  };

  const addCondition = () => {
    const newConditions = [
      ...logic.conditions,
      {
        questionId: previousQuestions[0]?.id || '',
        operator: 'equals' as const,
        value: '',
      },
    ];
    updateLogic({ conditions: newConditions });
  };

  const updateCondition = (index: number, updates: Partial<LogicRule>) => {
    const newConditions = logic.conditions.map((condition, i) =>
      i === index ? { ...condition, ...updates } : condition
    );
    updateLogic({ conditions: newConditions });
  };

  const removeCondition = (index: number) => {
    const newConditions = logic.conditions.filter((_, i) => i !== index);
    updateLogic({ conditions: newConditions });
  };

  const toggleEnabled = (enabled: boolean) => {
    if (enabled && logic.conditions.length === 0) {
      // Add a default condition when enabling
      updateLogic({
        enabled: true,
        conditions: [
          {
            questionId: previousQuestions[0]?.id || '',
            operator: 'equals',
            value: '',
          },
        ],
      });
    } else {
      updateLogic({ enabled });
    }
  };

  // Get the question object for a given questionId
  const getQuestion = (questionId: string) => {
    return allQuestions.find((q) => q.id === questionId);
  };

  // Get available operators based on question type
  const getAvailableOperators = (questionId: string) => {
    const q = getQuestion(questionId);
    if (!q) return ['equals', 'not_equals'];

    const baseOperators = ['equals', 'not_equals'];
    
    if (q.type === 'number') {
      return [...baseOperators, 'greater_than', 'less_than'];
    }
    
    if (q.type === 'short_text' || q.type === 'long_text') {
      return [...baseOperators, 'contains', 'not_contains'];
    }

    return baseOperators;
  };

  // Render value input based on question type
  const renderValueInput = (condition: LogicRule, index: number) => {
    const sourceQuestion = getQuestion(condition.questionId);
    
    if (!sourceQuestion) {
      return (
        <Input
          value={condition.value || ''}
          onChange={(e) => updateCondition(index, { value: e.target.value })}
          placeholder="Enter value"
          className="text-foreground"
        />
      );
    }

    // For multiple choice, checkboxes, dropdown - show options
    if (['multiple_choice', 'checkboxes', 'dropdown'].includes(sourceQuestion.type)) {
      return (
        <Select
          value={condition.value || ''}
          onValueChange={(value) => updateCondition(index, { value })}
        >
          <SelectTrigger className="text-foreground">
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            {sourceQuestion.options?.map((option) => (
              <SelectItem key={option.id} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // For number type
    if (sourceQuestion.type === 'number') {
      return (
        <Input
          type="number"
          value={condition.value || ''}
          onChange={(e) => updateCondition(index, { value: e.target.value })}
          placeholder="Enter number"
          className="text-foreground"
        />
      );
    }

    // Default: text input
    return (
      <Input
        value={condition.value || ''}
        onChange={(e) => updateCondition(index, { value: e.target.value })}
        placeholder="Enter value"
        className="text-foreground"
      />
    );
  };

  if (previousQuestions.length === 0) {
    return (
      <Card className="p-6 glass-panel border-0">
        <div className="text-center text-muted-foreground">
          <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            Add questions before this one to enable conditional logic
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 glass-panel border-0 space-y-6">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <Label className="text-base font-semibold text-foreground">
              Conditional Logic
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Show or hide this question based on other answers
          </p>
        </div>
        <Switch
          checked={logic.enabled}
          onCheckedChange={toggleEnabled}
        />
      </div>

      {logic.enabled && (
        <>
          {/* Logic Rules */}
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {logic.action === 'show' ? 'Show' : logic.action === 'hide' ? 'Hide' : 'Jump to'} this question when:
            </div>

            {/* Conditions */}
            {logic.conditions.map((condition, index) => (
              <div key={index} className="space-y-3">
                {/* Logic Operator (AND/OR) */}
                {index > 0 && (
                  <div className="flex items-center justify-center">
                    <Select
                      value={logic.logicOperator || 'AND'}
                      onValueChange={(value: 'AND' | 'OR') =>
                        updateLogic({ logicOperator: value })
                      }
                    >
                      <SelectTrigger className="w-24 h-8 text-xs bg-primary/10 border-primary/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">AND</SelectItem>
                        <SelectItem value="OR">OR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Condition Card */}
                <Card className={cn(
                  "p-4 border-2 transition-all",
                  index === 0 ? "border-primary/30 bg-primary/5" : "border-white/10 bg-white/5"
                )}>
                  <div className="flex items-start gap-3">
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-2 shrink-0" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                      {/* Question Selection */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Question</Label>
                        <Select
                          value={condition.questionId}
                          onValueChange={(value) =>
                            updateCondition(index, { questionId: value })
                          }
                        >
                          <SelectTrigger className="text-foreground">
                            <SelectValue placeholder="Select question" />
                          </SelectTrigger>
                          <SelectContent>
                            {previousQuestions.map((q) => (
                              <SelectItem key={q.id} value={q.id}>
                                {q.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Operator Selection */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Condition</Label>
                        <Select
                          value={condition.operator}
                          onValueChange={(value: any) =>
                            updateCondition(index, { operator: value })
                          }
                        >
                          <SelectTrigger className="text-foreground">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableOperators(condition.questionId).map((op) => (
                              <SelectItem key={op} value={op}>
                                {operatorLabels[op as keyof typeof operatorLabels]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Value Input */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Value</Label>
                        {renderValueInput(condition, index)}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCondition(index)}
                      className="shrink-0 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 mt-6"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </div>
            ))}

            {/* Add Condition Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={addCondition}
              className="w-full border-dashed border-2 text-foreground hover:bg-primary/10 hover:border-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Condition
            </Button>
          </div>

          {/* Action Selection */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <Label className="text-foreground">Then...</Label>
            <Select
              value={logic.action}
              onValueChange={(value: 'show' | 'hide' | 'jump_to') =>
                updateLogic({ action: value })
              }
            >
              <SelectTrigger className="text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="show">Show this question</SelectItem>
                <SelectItem value="hide">Hide this question</SelectItem>
                <SelectItem value="jump_to">Jump to another question</SelectItem>
              </SelectContent>
            </Select>

            {/* Jump To Target */}
            {logic.action === 'jump_to' && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Jump to question</Label>
                <Select
                  value={logic.targetQuestionId || ''}
                  onValueChange={(value) =>
                    updateLogic({ targetQuestionId: value })
                  }
                >
                  <SelectTrigger className="text-foreground">
                    <SelectValue placeholder="Select target question" />
                  </SelectTrigger>
                  <SelectContent>
                    {allQuestions
                      .filter((q) => q.id !== question.id)
                      .map((q) => (
                        <SelectItem key={q.id} value={q.id}>
                          {q.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Logic Summary:</p>
            <p className="text-sm text-foreground">
              <strong>{actionLabels[logic.action]}</strong> when{' '}
              {logic.conditions.length > 0 ? (
                <>
                  <strong>
                    {logic.conditions.length === 1
                      ? '1 condition'
                      : `${logic.logicOperator === 'AND' ? 'ALL' : 'ANY'} of ${logic.conditions.length} conditions`}
                  </strong>{' '}
                  {logic.conditions.length === 1 ? 'is' : 'are'} met
                </>
              ) : (
                <span className="text-red-400">No conditions defined</span>
              )}
            </p>
          </div>
        </>
      )}
    </Card>
  );
}
