"use client";

import { useState, useEffect } from "react";
import { Template, templateService } from "@/lib/api/templates";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TemplateGallery } from "./TemplateGallery";
import { TemplatePreview } from "./TemplatePreview";
import { FileText, Sparkles, Upload, ChevronRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBlank: () => void;
  onUseTemplate: (template: Template) => void;
  onImport?: () => void;
}

type ViewMode = "selector" | "gallery" | "preview";

export function TemplateSelector({
  isOpen,
  onClose,
  onCreateBlank,
  onUseTemplate,
  onImport,
}: TemplateSelectorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("selector");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [popularTemplates, setPopularTemplates] = useState<Template[]>([]);

  // Load popular templates
  useEffect(() => {
    if (isOpen) {
      loadPopularTemplates();
    }
  }, [isOpen]);

  const loadPopularTemplates = async () => {
    try {
      const response = await templateService.getPopularTemplates(3);
      setPopularTemplates(response.data.data);
    } catch (error) {
      console.error("Error loading popular templates:", error);
    }
  };

  const handleClose = () => {
    setViewMode("selector");
    setSelectedTemplate(null);
    onClose();
  };

  const handleCreateBlank = () => {
    handleClose();
    onCreateBlank();
  };

  const handleViewAllTemplates = () => {
    setViewMode("gallery");
  };

  const handleBackToSelector = () => {
    setViewMode("selector");
    setSelectedTemplate(null);
  };

  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setViewMode("preview");
  };

  const handleUseTemplate = async (template: Template) => {
    try {
      // Increment usage count
      await templateService.incrementUsage(template._id);
      handleClose();
      onUseTemplate(template);
    } catch (error) {
      console.error("Error using template:", error);
      // Still proceed even if increment fails
      handleClose();
      onUseTemplate(template);
    }
  };

  return (
    <>
      {/* Main Selector Dialog */}
      <Dialog open={isOpen && viewMode === "selector"} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl glass-panel border-0">
          <DialogHeader>
            <DialogTitle className="text-2xl text-foreground">Create New Form</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Choose how you'd like to start building your form
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            {/* Primary Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Blank Form */}
              <Card
                className="p-6 glass-panel border-0 hover:border-primary/50 cursor-pointer transition-all group"
                onClick={handleCreateBlank}
              >
                <div className="text-center space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Start from Scratch</h3>
                    <p className="text-xs text-muted-foreground">
                      Create a blank form and add your own questions
                    </p>
                  </div>
                </div>
              </Card>

              {/* Use Template */}
              <Card
                className="p-6 glass-panel border-0 hover:border-primary/50 cursor-pointer transition-all group"
                onClick={handleViewAllTemplates}
              >
                <div className="text-center space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Use a Template</h3>
                    <p className="text-xs text-muted-foreground">
                      Start with a pre-built form template
                    </p>
                  </div>
                </div>
              </Card>

              {/* Import */}
              {onImport && (
                <Card
                  className="p-6 glass-panel border-0 hover:border-primary/50 cursor-pointer transition-all group"
                  onClick={() => {
                    handleClose();
                    onImport();
                  }}
                >
                  <div className="text-center space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Import Form</h3>
                      <p className="text-xs text-muted-foreground">
                        Upload an existing form file
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Popular Templates Quick Access */}
            {popularTemplates.length > 0 && (
              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Popular Templates
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewAllTemplates}
                    className="text-xs text-primary hover:text-primary"
                  >
                    View All
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {popularTemplates.map((template) => (
                    <motion.div
                      key={template._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card
                        className="p-4 glass-panel border-0 hover:border-primary/50 cursor-pointer transition-all"
                        onClick={() => handlePreviewTemplate(template)}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{template.icon}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-foreground truncate mb-1">
                              {template.name}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {template.questions.length} questions
                            </p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Gallery Dialog */}
      <Dialog open={isOpen && viewMode === "gallery"} onOpenChange={handleClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0 glass-panel border-0">
          <DialogHeader className="p-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToSelector}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <DialogTitle className="text-2xl text-foreground">
                  Choose a Template
                </DialogTitle>
                <DialogDescription className="text-base text-muted-foreground">
                  Browse our collection of pre-built form templates
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <TemplateGallery
              onPreview={handlePreviewTemplate}
              onUse={handleUseTemplate}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Preview (separate component) */}
      <TemplatePreview
        template={selectedTemplate}
        isOpen={viewMode === "preview"}
        onClose={() => {
          setSelectedTemplate(null);
          setViewMode("gallery");
        }}
        onUse={handleUseTemplate}
      />
    </>
  );
}
