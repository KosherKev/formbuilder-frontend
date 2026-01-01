"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formService } from "@/lib/api/forms";
import { responseService } from "@/lib/api/responses";
import type { Form } from "@/lib/api/forms";
import type { Response } from "@/lib/api/responses";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Download,
  Trash2,
  Eye,
  Search,
  Loader2,
  FileText,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";
import { useToast } from "@/components/ui/toaster";

export default function ResponsesPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const formId = params.id as string;

  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);

  useEffect(() => {
    loadFormAndResponses();
  }, [formId]);

  const loadFormAndResponses = async () => {
    try {
      setIsLoading(true);
      const [formRes, responsesRes] = await Promise.all([
        formService.getForm(formId),
        responseService.getResponses(formId, { limit: 100 }),
      ]);
      setForm(formRes.data);
      setResponses(responsesRes.data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load responses",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await responseService.exportCSV(formId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${form?.slug || "form"}-responses-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Success",
        description: "CSV exported successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to export CSV",
      });
    }
  };

  const handleDeleteResponse = async (responseId: string) => {
    if (!confirm("Are you sure you want to delete this response?")) return;

    try {
      await responseService.deleteResponse(formId, responseId);
      setResponses(responses.filter((r) => r._id !== responseId));
      if (selectedResponse?._id === responseId) {
        setSelectedResponse(null);
      }
      toast({
        title: "Success",
        description: "Response deleted successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete response",
      });
    }
  };

  const getAnswerValue = (response: Response, questionId: string): string => {
    const answer = response.answers.find((a) => a.questionId === questionId);
    if (!answer) return "-";
    
    if (Array.isArray(answer.value)) {
      return answer.value.join(", ");
    }
    
    return String(answer.value || "-");
  };

  const filteredResponses = responses.filter((response) => {
    if (!searchTerm) return true;
    return response.answers.some((answer) =>
      String(answer.value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Form not found</p>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

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
                <p className="text-sm text-gray-500">Responses</p>
              </div>
            </div>
            <Button onClick={handleExportCSV} className="bg-blue-500 hover:bg-blue-600 text-white">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Responses List */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  All Responses ({responses.length})
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search responses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 bg-white text-gray-900"
                  />
                </div>
              </div>

              {filteredResponses.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-600">
                    {responses.length === 0
                      ? "No responses yet. Share your form to start collecting data!"
                      : "No responses match your search."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Submitted
                        </th>
                        {form.questions.slice(0, 3).map((question) => (
                          <th
                            key={question.id}
                            className="text-left py-3 px-4 text-sm font-medium text-gray-700"
                          >
                            {question.label}
                          </th>
                        ))}
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResponses.map((response) => (
                        <tr
                          key={response._id}
                          className="border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedResponse(response)}
                        >
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {formatDateTime(response.submittedAt)}
                          </td>
                          {form.questions.slice(0, 3).map((question) => (
                            <td key={question.id} className="py-3 px-4 text-sm text-gray-600">
                              <div className="max-w-xs truncate">
                                {getAnswerValue(response, question.id)}
                              </div>
                            </td>
                          ))}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedResponse(response);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteResponse(response._id);
                                }}
                                className="hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* Response Detail */}
          <div className="lg:col-span-1">
            {selectedResponse ? (
              <Card className="p-6 bg-white sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Response Detail</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedResponse(null)}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="pb-4 border-b">
                    <p className="text-sm text-gray-500">Submitted</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDateTime(selectedResponse.submittedAt)}
                    </p>
                  </div>

                  {form.questions.map((question) => (
                    <div key={question.id} className="pb-4 border-b">
                      <p className="text-sm text-gray-500 mb-1">{question.label}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {getAnswerValue(selectedResponse, question.id)}
                      </p>
                    </div>
                  ))}

                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleDeleteResponse(selectedResponse._id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Response
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-6 bg-white sticky top-6">
                <div className="text-center py-8">
                  <Eye className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600">
                    Select a response to view details
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
