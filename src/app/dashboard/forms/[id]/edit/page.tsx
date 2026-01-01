"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFormStore } from "@/lib/store/forms";
import { useAuthStore } from "@/lib/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormBuilderCanvas } from "@/components/form-builder/FormBuilderCanvas";
import { QuestionTypesSidebar } from "@/components/form-builder/QuestionTypesSidebar";
import { FormSettings } from "@/components/form-builder/FormSettings";
import { FormPreview } from "@/components/form-builder/FormPreview";
import { useToast } from "@/components/ui/toaster";
import { 
  ArrowLeft, 
  Eye, 
  Save, 
  Settings, 
  Loader2,
  Globe,
  BarChart3,
  MessageSquare
} from "lucide-react";
import type { Question } from "@/lib/api/forms";

export default function FormBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { currentForm, fetchForm, updateForm, isLoading } = useFormStore();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("build");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const formId = params.id as string;

  useEffect(() => {
    if (formId) {
      fetchForm(formId);
    }
  }, [formId, fetchForm]);

  useEffect(() => {
    if (currentForm) {
      setTitle(currentForm.title);
      setDescription(currentForm.description || "");
      setQuestions(currentForm.questions || []);
      setHasUnsavedChanges(false);
    }
  }, [currentForm]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateForm(formId, {
        title,
        description,
        questions,
      });
      setHasUnsavedChanges(false);
      toast({
        title: "Success",
        description: "Form saved successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save form",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forms/${formId}/publish`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to publish");

      const data = await response.json();
      toast({
        title: "Success",
        description: data.data.status === "published" ? "Form published!" : "Form unpublished",
      });
      fetchForm(formId);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to publish form",
      });
    }
  };

  // Debounced settings update - only updates local state, doesn't save to API
  const handleSettingsUpdate = useCallback((updates: any) => {
    setHasUnsavedChanges(true);
    // This will be saved when user clicks Save button
    // Settings component handles its own debouncing for preview
  }, []);

  const addQuestion = (type: Question["type"]) => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      type,
      label: `${type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())} Question`,
      description: "",
      required: false,
      placeholder: "",
      options: type === "multiple_choice" || type === "checkboxes" || type === "dropdown"
        ? [
            { id: `opt_${Date.now()}_1`, label: "Option 1", value: "option_1" },
            { id: `opt_${Date.now()}_2`, label: "Option 2", value: "option_2" },
          ]
        : [],
      order: questions.length,
    };

    setQuestions([...questions, newQuestion]);
    setSelectedQuestionId(newQuestion.id);
    setHasUnsavedChanges(true);
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setQuestions(
      questions.map((q) => (q.id === questionId ? { ...q, ...updates } : q))
    );
    setHasUnsavedChanges(true);
  };

  const deleteQuestion = (questionId: string) => {
    setQuestions(questions.filter((q) => q.id !== questionId));
    if (selectedQuestionId === questionId) {
      setSelectedQuestionId(null);
    }
    setHasUnsavedChanges(true);
  };

  const duplicateQuestion = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const newQuestion = {
      ...question,
      id: `q_${Date.now()}`,
      label: `${question.label} (Copy)`,
      order: questions.length,
    };

    setQuestions([...questions, newQuestion]);
    setHasUnsavedChanges(true);
  };

  const reorderQuestions = (newQuestions: Question[]) => {
    setQuestions(newQuestions.map((q, index) => ({ ...q, order: index })));
    setHasUnsavedChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20 animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-20 animate-pulse delay-1000" />
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentForm) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20 animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-20 animate-pulse delay-1000" />
        </div>
        <div className="text-center glass-panel p-8">
          <p className="text-muted-foreground mb-4">Form not found</p>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (showPreview) {
    return (
      <FormPreview
        form={{ ...currentForm, title, description, questions }}
        onClose={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/50 backdrop-blur-xl shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="text-muted-foreground hover:text-foreground hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="border-l border-white/10 h-8" />
            <div>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                className="text-lg font-semibold border-none shadow-none focus-visible:ring-0 px-2 bg-transparent text-foreground placeholder:text-muted-foreground/50"
                placeholder="Untitled Form"
              />
              <p className="text-xs text-muted-foreground px-2">
                {user?.name} • {currentForm.status}
                {hasUnsavedChanges && <span className="text-orange-400 ml-2">• Unsaved changes</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/forms/${formId}/responses`)}
              className="text-muted-foreground hover:text-foreground hover:bg-white/5"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Responses
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/forms/${formId}/analytics`)}
              className="text-muted-foreground hover:text-foreground hover:bg-white/5"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <div className="border-l border-white/10 h-8 mx-2" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(true)}
              className="text-muted-foreground hover:text-foreground hover:bg-white/5"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePublish}
              className="border-white/10 bg-white/5 text-foreground hover:bg-white/10"
            >
              <Globe className="h-4 w-4 mr-2" />
              {currentForm.status === "published" ? "Unpublish" : "Publish"}
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="bg-primary hover:bg-primary/90 text-white disabled:opacity-50 shadow-lg shadow-primary/20"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {hasUnsavedChanges ? "Save" : "Saved"}
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-65px)]">
        {/* Question Types Sidebar */}
        <QuestionTypesSidebar onAddQuestion={addQuestion} />

        {/* Form Builder Canvas */}
        <div className="flex-1 p-6 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 bg-muted/50 backdrop-blur-sm border border-white/10">
              <TabsTrigger 
                value="build" 
                className="data-[state=active]:bg-background/50 data-[state=active]:backdrop-blur-sm data-[state=active]:text-foreground text-muted-foreground"
              >
                Build
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="data-[state=active]:bg-background/50 data-[state=active]:backdrop-blur-sm data-[state=active]:text-foreground text-muted-foreground"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="build" className="mt-0">
              <FormBuilderCanvas
                questions={questions}
                selectedQuestionId={selectedQuestionId}
                onSelectQuestion={setSelectedQuestionId}
                onUpdateQuestion={updateQuestion}
                onDeleteQuestion={deleteQuestion}
                onDuplicateQuestion={duplicateQuestion}
                onReorderQuestions={reorderQuestions}
                description={description}
                onDescriptionChange={(desc) => {
                  setDescription(desc);
                  setHasUnsavedChanges(true);
                }}
              />
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <FormSettings
                form={currentForm}
                onUpdate={handleSettingsUpdate}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
