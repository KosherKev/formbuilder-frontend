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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Form not found</p>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
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
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/dashboard/forms/${formId}/edit`)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Form
              </Button>
              <div className="border-l border-white/10 h-8" />
              <div>
                <h1 className="text-xl font-semibold text-foreground">{form.title}</h1>
                <p className="text-sm text-muted-foreground">Responses</p>
              </div>
            </div>
            <Button onClick={handleExportCSV} className="glass-button text-foreground">
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
            <Card className="p-6 glass-panel border-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  All Responses ({responses.length})
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search responses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {filteredResponses.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    {responses.length === 0
                      ? "No responses yet. Share your form to start collecting data!"
                      : "No responses match your search."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Submitted
                        </th>
                        {form.questions.slice(0, 3).map((question) => (
                          <th
                            key={question.id}
                            className="text-left py-3 px-4 text-sm font-medium text-muted-foreground"
                          >
                            {question.label}
                          </th>
                        ))}
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResponses.map((response) => (
                        <tr
                          key={response._id}
                          className="border-b border-white/10 hover:bg-white/5 cursor-pointer transition-colors"
                          onClick={() => setSelectedResponse(response)}
                        >
                          <td className="py-3 px-4 text-sm text-foreground">
                            {formatDateTime(response.submittedAt)}
                          </td>
                          {form.questions.slice(0, 3).map((question) => (
                            <td key={question.id} className="py-3 px-4 text-sm text-muted-foreground">
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
                                className="hover:bg-white/10 text-muted-foreground hover:text-foreground"
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
                                className="hover:bg-red-500/10 text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
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
              <Card className="p-6 glass-panel border-0 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Response Detail</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedResponse(null)}
                    className="hover:bg-white/10 text-muted-foreground hover:text-foreground"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="pb-4 border-b border-white/10">
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p className="text-sm font-medium text-foreground">
                      {formatDateTime(selectedResponse.submittedAt)}
                    </p>
                  </div>

                  {form.questions.map((question) => (
                    <div key={question.id} className="pb-4 border-b border-white/10">
                      <p className="text-sm text-muted-foreground mb-1">{question.label}</p>
                      <p className="text-sm font-medium text-foreground">
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
              <Card className="p-6 glass-panel border-0 sticky top-6">
                <div className="text-center py-8">
                  <Eye className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
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
