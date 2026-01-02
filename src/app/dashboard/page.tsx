"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { formService } from "@/lib/api/forms";
import { templateService } from "@/lib/api/templates";
import type { Form } from "@/lib/api/forms";
import type { Template } from "@/lib/api/templates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TemplateSelector } from "@/components/templates";
import { formatDate } from "@/lib/utils";
import { Plus, FileText, BarChart3, Eye, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, checkAuth, logout } = useAuthStore();
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [popularTemplates, setPopularTemplates] = useState<Template[]>([]);
  const [stats, setStats] = useState({
    totalForms: 0,
    publishedForms: 0,
    totalResponses: 0,
    totalViews: 0,
  });

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user) {
      loadForms();
      loadPopularTemplates();
    }
  }, [user]);

  const loadForms = async () => {
    try {
      setIsLoading(true);
      const response = await formService.getForms({ limit: 10 });
      setForms(response.data);
      
      // Calculate stats
      const totalForms = response.pagination.total;
      const publishedForms = response.data.filter(f => f.status === "published").length;
      const totalResponses = response.data.reduce((sum, f) => sum + (f.analytics?.totalSubmissions || 0), 0);
      const totalViews = response.data.reduce((sum, f) => sum + (f.analytics?.totalViews || 0), 0);
      
      setStats({ totalForms, publishedForms, totalResponses, totalViews });
    } catch (error) {
      console.error("Failed to load forms:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPopularTemplates = async () => {
    try {
      const response = await templateService.getPopularTemplates(3);
      setPopularTemplates(response.data.data);
    } catch (error) {
      console.error("Failed to load templates:", error);
    }
  };

  const handleCreateBlankForm = async () => {
    try {
      const response = await formService.createForm({
        title: "Untitled Form",
        description: "",
      });
      router.push(`/dashboard/forms/${response.data._id}/edit`);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to create form");
    }
  };

  const handleUseTemplate = async (template: Template) => {
    try {
      // Create form with template data
      const response = await formService.createForm({
        title: template.name,
        description: template.description,
        questions: template.questions,
        settings: template.settings,
        theme: {
          id: template.themeId || 'modern-minimal',
          name: template.name,
          description: template.description,
          preview: '',
          colors: {
            primary: '#6366f1',
            secondary: '#ec4899',
            background: '#0f172a',
            foreground: '#ffffff',
            accent: '#f59e0b',
            muted: '#64748b'
          },
          fonts: {
            heading: 'Inter',
            body: 'Inter'
          },
          borderRadius: 'lg',
          cardStyle: 'glass'
        }
      });
      
      router.push(`/dashboard/forms/${response.data._id}/edit`);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to create form from template");
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Show loading state while checking auth
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-panel border-b border-white/10 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-primary to-indigo-600 shadow-lg shadow-primary/20">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">FormBuilder</h1>
                <p className="text-sm text-muted-foreground capitalize">{user.plan || "Free"} Plan</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <p className="text-sm text-muted-foreground">Welcome, {user.name}</p>
              <Button variant="outline" onClick={handleLogout} className="glass-button">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              className="p-6 glass-panel border-0 hover:border-primary/50 cursor-pointer transition-all group"
              onClick={handleCreateBlankForm}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Blank Form</h3>
                  <p className="text-sm text-muted-foreground">Start from scratch</p>
                </div>
              </div>
            </Card>

            <Card
              className="p-6 glass-panel border-0 hover:border-primary/50 cursor-pointer transition-all group"
              onClick={() => setShowTemplateSelector(true)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">From Template</h3>
                  <p className="text-sm text-muted-foreground">Use pre-built form</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 glass-panel border-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Import File</h3>
                  <p className="text-sm text-muted-foreground">Upload existing form</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-panel border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Total Forms</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.totalForms}</div>
              </CardContent>
            </Card>

            <Card className="glass-panel border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Published</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.publishedForms}</div>
              </CardContent>
            </Card>

            <Card className="glass-panel border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.totalViews}</div>
              </CardContent>
            </Card>

            <Card className="glass-panel border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Responses</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.totalResponses}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Popular Templates */}
        {popularTemplates.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Popular Templates</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTemplateSelector(true)}
                className="text-primary"
              >
                View All →
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {popularTemplates.map((template) => (
                <Card
                  key={template._id}
                  className="p-6 glass-panel border-0 hover:border-primary/50 cursor-pointer transition-all group"
                  onClick={() => handleUseTemplate(template)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{template.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{template.questions.length} questions</span>
                    <span>•</span>
                    <span>~{template.estimatedTime} min</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recent Forms */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Forms</h2>
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/forms")}>
              View All →
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading forms...</div>
          ) : forms.length === 0 ? (
            <Card className="glass-panel border-0 p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No forms yet</h3>
              <p className="text-muted-foreground mb-6">Create your first form to get started</p>
              <Button onClick={() => setShowTemplateSelector(true)} className="glass-button">
                <Plus className="h-4 w-4 mr-2" />
                Create Form
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {forms.map((form) => (
                <Card
                  key={form._id}
                  className="p-6 glass-panel border-0 hover:border-primary/50 cursor-pointer transition-all"
                  onClick={() => router.push(`/dashboard/forms/${form._id}/edit`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">{form.title}</h3>
                      {form.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{form.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{form.questions?.length || 0} questions</span>
                        <span>•</span>
                        <span>{form.analytics?.totalSubmissions || 0} responses</span>
                        <span>•</span>
                        <span>Updated {formatDate(form.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          form.status === "published"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {form.status}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Template Selector Modal */}
      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onCreateBlank={handleCreateBlankForm}
        onUseTemplate={handleUseTemplate}
      />
    </div>
  );
}
