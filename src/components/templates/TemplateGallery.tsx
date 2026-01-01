"use client";

import { useState, useEffect } from "react";
import { Template, templateService } from "@/lib/api/templates";
import { TemplateCard } from "./TemplateCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, FileQuestion } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TemplateGalleryProps {
  onPreview: (template: Template) => void;
  onUse: (template: Template) => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

const categories = [
  { id: "all", label: "All Templates", icon: "📋" },
  { id: "education", label: "Education", icon: "🎓" },
  { id: "event", label: "Events", icon: "🎫" },
  { id: "business", label: "Business", icon: "💼" },
  { id: "survey", label: "Surveys", icon: "📊" },
  { id: "hr", label: "HR", icon: "👥" },
];

export function TemplateGallery({
  onPreview,
  onUse,
  selectedCategory = "all",
  onCategoryChange,
}: TemplateGalleryProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(selectedCategory);

  // Load templates
  useEffect(() => {
    loadTemplates();
  }, []);

  // Filter templates when category or search changes
  useEffect(() => {
    filterTemplates();
  }, [templates, activeCategory, searchQuery]);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await templateService.getTemplates({ limit: 50 });
      setTemplates(response.data.data);
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter((t) => t.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    setFilteredTemplates(filtered);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    onCategoryChange?.(category);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Section */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass-panel border-0 text-foreground"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange(category.id)}
              className={`
                shrink-0 transition-all
                ${
                  activeCategory === category.id
                    ? "glass-button"
                    : "glass-panel border-0 hover:border-primary/50"
                }
              `}
            >
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? (
            "Loading templates..."
          ) : (
            <>
              Showing {filteredTemplates.length} template
              {filteredTemplates.length !== 1 ? "s" : ""}
              {searchQuery && ` for "${searchQuery}"`}
            </>
          )}
        </p>
        {!isLoading && filteredTemplates.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("all");
            }}
            className="text-xs"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="mb-4 p-4 bg-white/5 rounded-full">
            <FileQuestion className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No templates found
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {searchQuery
              ? `No templates match "${searchQuery}". Try different keywords or browse all templates.`
              : "No templates available in this category yet."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("all");
            }}
            className="mt-4"
          >
            View All Templates
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                layout
              >
                <TemplateCard
                  template={template}
                  onPreview={onPreview}
                  onUse={onUse}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
