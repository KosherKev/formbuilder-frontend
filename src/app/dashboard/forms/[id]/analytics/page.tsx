"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formService } from "@/lib/api/forms";
import { responseService } from "@/lib/api/responses";
import type { Form } from "@/lib/api/forms";
import type { Response } from "@/lib/api/responses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [formId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [formRes, responsesRes, analyticsRes] = await Promise.all([
        formService.getForm(formId),
        responseService.getResponses(formId, { limit: 1000 }),
        formService.getFormAnalytics(formId),
      ]);
      setForm(formRes.data);
      setResponses(responsesRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!form || !analytics) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Form not found</p>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const submissionsOverTime = prepareSubmissionsOverTime(responses);
  const questionResponseRates = prepareQuestionResponseRates(form, responses);
  const completionData = [
    { name: "Completed", value: analytics.totalSubmissions, color: "#10b981" },
    { name: "Partial", value: analytics.partialSubmissions, color: "#f59e0b" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/dashboard/forms/${formId}/edit`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Form
              </Button>
              <div className="border-l h-8" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{form.title}</h1>
                <p className="text-sm text-gray-500">Analytics</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Views</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{analytics.totalViews}</div>
              <p className="text-xs text-gray-500 mt-1">Form page visits</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Submissions</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {analytics.totalSubmissions}
              </div>
              <p className="text-xs text-gray-500 mt-1">Completed responses</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Completion Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {analytics.completionRate}
              </div>
              <p className="text-xs text-gray-500 mt-1">Views to submissions</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Avg. Time</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(analytics.averageCompletionTime)}
              </div>
              <p className="text-xs text-gray-500 mt-1">To complete</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submissions Over Time */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900">Submissions Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={submissionsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Completion Status */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900">Completion Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Question Response Rates */}
          <Card className="bg-white lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-gray-900">Question Response Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={questionResponseRates}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="question" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="responses" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function prepareSubmissionsOverTime(responses: Response[]) {
  const grouped: { [key: string]: number } = {};

  responses.forEach((response) => {
    const date = new Date(response.submittedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    grouped[date] = (grouped[date] || 0) + 1;
  });

  return Object.entries(grouped)
    .map(([date, count]) => ({ date, count }))
    .slice(-7); // Last 7 days
}

function prepareQuestionResponseRates(form: Form, responses: Response[]) {
  return form.questions.map((question) => {
    const answeredCount = responses.filter((response) =>
      response.answers.some((a) => a.questionId === question.id && a.value)
    ).length;

    return {
      question: question.label.substring(0, 20) + "...",
      responses: answeredCount,
    };
  });
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}
