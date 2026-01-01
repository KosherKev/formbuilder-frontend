import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Plus, Trash2, Settings2, Zap } from "lucide-react";
import { LogicBuilder } from "./LogicBuilder";
import type { Question } from "@/lib/api/forms";

interface QuestionEditorProps {
  question: Question;
  allQuestions: Question[];
  onUpdate: (updates: Partial<Question>) => void;
  onClose: () => void;
}

export function QuestionEditor({ question, allQuestions, onUpdate, onClose }: QuestionEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("settings");
  const hasOptions = ["multiple_choice", "checkboxes", "dropdown"].includes(question.type);

  const addOption = () => {
    const newOption = {
      id: `opt_${Date.now()}`,
      label: `Option ${(question.options?.length || 0) + 1}`,
      value: `option_${(question.options?.length || 0) + 1}`,
    };
    onUpdate({ options: [...(question.options || []), newOption] });
  };

  const updateOption = (optionId: string, updates: { label?: string; value?: string }) => {
    onUpdate({
      options: question.options?.map((opt) =>
        opt.id === optionId ? { ...opt, ...updates } : opt
      ),
    });
  };

  const deleteOption = (optionId: string) => {
    onUpdate({
      options: question.options?.filter((opt) => opt.id !== optionId),
    });
  };

  return (
    <div className="sticky top-24 space-y-4">
      <Card className="p-4 glass-panel border-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Edit Question</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass-panel">
            <TabsTrigger value="settings" className="flex items-center gap-2 text-xs">
              <Settings2 className="h-3.5 w-3.5" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="logic" className="flex items-center gap-2 text-xs">
              <Zap className="h-3.5 w-3.5" />
              Logic
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4 mt-4">
            {/* Question Label */}
            <div className="space-y-2">
              <Label className="text-foreground">Question Label</Label>
              <Input
                value={question.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                placeholder="Enter question text"
                className="text-foreground"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-foreground">Description (Optional)</Label>
              <Textarea
                value={question.description || ""}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="Add helpful context..."
                rows={2}
                className="text-foreground"
              />
            </div>

            {/* Placeholder */}
            {(question.type === "short_text" ||
              question.type === "long_text" ||
              question.type === "email" ||
              question.type === "phone" ||
              question.type === "number") && (
              <div className="space-y-2">
                <Label className="text-foreground">Placeholder</Label>
                <Input
                  value={question.placeholder || ""}
                  onChange={(e) => onUpdate({ placeholder: e.target.value })}
                  placeholder="Enter placeholder text"
                  className="text-foreground"
                />
              </div>
            )}

            {/* Options for Multiple Choice, Checkboxes, Dropdown */}
            {hasOptions && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground">Options</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="h-7 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {question.options?.map((option, index) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground w-6">{index + 1}.</span>
                      <Input
                        value={option.label}
                        onChange={(e) =>
                          updateOption(option.id, {
                            label: e.target.value,
                            value: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                          })
                        }
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 h-9 text-foreground"
                      />
                      {(question.options?.length || 0) > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteOption(option.id)}
                          className="h-9 w-9 p-0 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Validation for Number */}
            {question.type === "number" && (
              <div className="space-y-3">
                <Label className="text-foreground">Validation</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Min Value</Label>
                    <Input
                      type="number"
                      value={question.validation?.min || ""}
                      onChange={(e) =>
                        onUpdate({
                          validation: {
                            ...question.validation,
                            min: e.target.value ? Number(e.target.value) : undefined,
                          },
                        })
                      }
                      placeholder="No min"
                      className="mt-1 h-9 text-foreground"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Max Value</Label>
                    <Input
                      type="number"
                      value={question.validation?.max || ""}
                      onChange={(e) =>
                        onUpdate({
                          validation: {
                            ...question.validation,
                            max: e.target.value ? Number(e.target.value) : undefined,
                          },
                        })
                      }
                      placeholder="No max"
                      className="mt-1 h-9 text-foreground"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Required Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div>
                <Label className="text-foreground">Required</Label>
                <p className="text-xs text-muted-foreground">Make this question mandatory</p>
              </div>
              <Switch
                checked={question.required}
                onCheckedChange={(checked) => onUpdate({ required: checked })}
              />
            </div>
          </TabsContent>

          <TabsContent value="logic" className="mt-4">
            {/* Logic Builder Component */}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Logic Builder (shown when Logic tab is active) */}
      {activeTab === "logic" && (
        <LogicBuilder
          question={question}
          allQuestions={allQuestions}
          onUpdate={(logic) => onUpdate({ conditionalLogic: logic })}
        />
      )}
    </div>
  );
}
