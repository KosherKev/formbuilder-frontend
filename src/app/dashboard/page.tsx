"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { formService } from "@/lib/api/forms";
import type { Form } from "@/lib/api/forms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Plus, FileText, BarChart3, Eye } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, checkAuth, logout } = useAuthStore();
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    if (user) {
      loadForms();
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

  const handleCreateForm = async () => {
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

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Show loading state while checking auth
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FormBuilder</h1>
                <p className="text-sm text-gray-500 capitalize">{user.plan || "Free"} Plan</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 font-medium">
                {user.name}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Forms</CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalForms}</div>
              <p className="text-xs text-gray-500">
                {user.planLimits?.maxForms || 3} forms limit
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Published</CardTitle>
              <Eye className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.publishedForms}</div>
              <p className="text-xs text-gray-500">Live forms</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Views</CardTitle>
              <BarChart3 className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalViews}</div>
              <p className="text-xs text-gray-500">Across all forms</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Responses</CardTitle>
              <BarChart3 className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalResponses}</div>
              <p className="text-xs text-gray-500">Total submissions</p>
            </CardContent>
          </Card>
        </div>

        {/* Forms List */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gray-900">Your Forms</CardTitle>
                <CardDescription className="text-gray-600">Manage and create new forms</CardDescription>
              </div>
              <Button onClick={handleCreateForm} className="bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Create Form
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="text-gray-500">Loading forms...</div>
              </div>
            ) : forms.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center space-y-3">
                <FileText className="h-12 w-12 text-gray-400" />
                <p className="text-gray-600">No forms yet. Create your first form to get started!</p>
                <Button onClick={handleCreateForm} variant="outline" className="text-gray-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Form
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {forms.map((form) => (
                  <div
                    key={form._id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/dashboard/forms/${form._id}/edit`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-gray-900">{form.title}</h3>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          form.status === "published" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {form.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {form.description || "No description"}
                      </p>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span>{form.analytics?.totalViews || 0} views</span>
                        <span>{form.analytics?.totalSubmissions || 0} responses</span>
                        <span>Updated {formatDate(form.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/forms/${form._id}/edit`);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/forms/${form._id}/responses`);
                        }}
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
