"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, FileText, Eye } from "lucide-react";
import { templatesApi, Template } from "@/lib/api-client";
import { TemplateDialog } from "@/components/template-dialog";
import { TemplateViewDialog } from "@/components/template-view-dialog";
import { DeleteDialog } from "@/components/delete-dialog";
import { useToast } from "@/components/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TemplatesPage() {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await templatesApi.list();
      setTemplates(data);
    } catch (err: any) {
      setError(err.message || "Failed to load templates");
      console.error("Error loading templates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleCreate = () => {
    setSelectedTemplate(null);
    setDialogOpen(true);
  };

  const handleView = (template: Template) => {
    setSelectedTemplate(template);
    setViewDialogOpen(true);
  };

  const handleEdit = (template: Template) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
  };

  const handleDelete = (template: Template) => {
    setSelectedTemplate(template);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTemplate) return;
    
    try {
      await templatesApi.delete(selectedTemplate.id);
      showToast("Template deleted successfully", "success");
      await loadTemplates();
      setDeleteDialogOpen(false);
      setSelectedTemplate(null);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete template";
      setError(errorMessage);
      showToast(errorMessage, "error");
    }
  };

  const handleDialogClose = (success: boolean) => {
    setDialogOpen(false);
    setSelectedTemplate(null);
    if (success) {
      loadTemplates();
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
            <p className="text-muted-foreground">
              Manage reusable prompt templates with variables
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Loading templates...</p>
            </CardContent>
          </Card>
        ) : templates.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get started by creating your first template
                </p>
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <CardDescription>
                {templates.length} template{templates.length !== 1 ? "s" : ""} available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Fields</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {template.fields && Object.keys(template.fields).length > 0 ? (
                            Object.keys(template.fields).map((key) => (
                              <Badge key={key} variant="outline">
                                {key}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">No variables</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(template.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(template)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(template)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(template)}
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

        <TemplateDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          template={selectedTemplate}
        />

        <TemplateViewDialog
          open={viewDialogOpen}
          onClose={() => {
            setViewDialogOpen(false);
            setSelectedTemplate(null);
          }}
          template={selectedTemplate}
        />

        <DeleteDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setSelectedTemplate(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Template"
          description={`Are you sure you want to delete "${selectedTemplate?.name}"? This action cannot be undone.`}
        />
      </div>
    </AppLayout>
  );
}

