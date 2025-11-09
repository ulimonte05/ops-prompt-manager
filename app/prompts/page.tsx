"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, MessageSquare, Eye } from "lucide-react";
import { promptsApi, companiesApi, Prompt, Company } from "@/lib/api-client";
import { PromptDialog } from "@/components/prompt-dialog";
import { DeleteDialog } from "@/components/delete-dialog";
import { PromptViewDialog } from "@/components/prompt-view-dialog";
import { useToast } from "@/components/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PromptsPage() {
  const { showToast } = useToast();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCompanies = async () => {
    try {
      const data = await companiesApi.list();
      setCompanies(data);
    } catch (err) {
      console.error("Error loading companies:", err);
    }
  };

  const loadPrompts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (selectedCompanyId === "all") {
        // Load prompts from all companies
        const allPrompts: Prompt[] = [];
        for (const company of companies) {
          try {
            const companyPrompts = await promptsApi.getAllByCompany(company.company_id);
            allPrompts.push(...companyPrompts);
          } catch (err) {
            console.error(`Error loading prompts for ${company.company_id}:`, err);
          }
        }
        setPrompts(allPrompts);
      } else {
        const company = companies.find(c => c.company_id === selectedCompanyId);
        if (company) {
          const data = await promptsApi.getAllByCompany(company.company_id);
          setPrompts(data);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load prompts");
      console.error("Error loading prompts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (companies.length > 0) {
      loadPrompts();
    }
  }, [selectedCompanyId, companies]);

  const handleCreate = () => {
    setSelectedPrompt(null);
    setDialogOpen(true);
  };

  const handleEdit = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setDialogOpen(true);
  };

  const handleView = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setViewDialogOpen(true);
  };

  const handleDelete = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPrompt) return;
    
    try {
      await promptsApi.delete(selectedPrompt.id);
      showToast("Prompt deleted successfully", "success");
      await loadPrompts();
      setDeleteDialogOpen(false);
      setSelectedPrompt(null);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete prompt";
      setError(errorMessage);
      showToast(errorMessage, "error");
    }
  };

  const handleDialogClose = (success: boolean) => {
    setDialogOpen(false);
    setSelectedPrompt(null);
    if (success) {
      loadPrompts();
    }
  };

  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    return company?.name || companyId;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Prompts</h1>
            <p className="text-muted-foreground">
              Manage prompts for companies with versioning and conditions
            </p>
          </div>
          <Button onClick={handleCreate} disabled={companies.length === 0}>
            <Plus className="mr-2 h-4 w-4" />
            Create Prompt
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-64">
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.company_id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {companies.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No companies available</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a company first before adding prompts
                </p>
              </div>
            </CardContent>
          </Card>
        ) : loading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Loading prompts...</p>
            </CardContent>
          </Card>
        ) : prompts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No prompts yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get started by creating your first prompt
                </p>
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Prompt
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Prompts</CardTitle>
              <CardDescription>
                {prompts.length} prompt{prompts.length !== 1 ? "s" : ""} found
                {selectedCompanyId !== "all" && ` for selected company`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Variables</TableHead>
                    <TableHead>Conditions</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prompts.map((prompt) => (
                    <TableRow key={prompt.id}>
                      <TableCell className="font-medium">
                        {getCompanyName(prompt.company_id)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">v{prompt.version}</Badge>
                      </TableCell>
                      <TableCell>
                        {prompt.is_active ? (
                          <Badge>Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {prompt.variables && Object.keys(prompt.variables).length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {Object.keys(prompt.variables).slice(0, 2).map((key) => (
                              <Badge key={key} variant="outline" className="text-xs">
                                {key}
                              </Badge>
                            ))}
                            {Object.keys(prompt.variables).length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{Object.keys(prompt.variables).length - 2}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {prompt.conditions && prompt.conditions.length > 0 ? (
                          <Badge variant="outline" className="text-xs">
                            {prompt.conditions.length} condition{prompt.conditions.length !== 1 ? "s" : ""}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(prompt.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(prompt)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(prompt)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(prompt)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <PromptDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          prompt={selectedPrompt}
          companies={companies}
        />

        <PromptViewDialog
          open={viewDialogOpen}
          onClose={() => {
            setViewDialogOpen(false);
            setSelectedPrompt(null);
          }}
          prompt={selectedPrompt}
          companyName={selectedPrompt ? getCompanyName(selectedPrompt.company_id) : ""}
        />

        <DeleteDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setSelectedPrompt(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Prompt"
          description={`Are you sure you want to delete this prompt? This action cannot be undone.`}
        />
      </div>
    </AppLayout>
  );
}

