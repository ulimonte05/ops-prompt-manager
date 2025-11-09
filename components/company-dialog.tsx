"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { companiesApi, templatesApi, Company, Template } from "@/lib/api-client";
import { useToast } from "@/components/toast";

interface CompanyDialogProps {
  open: boolean;
  onClose: (success: boolean) => void;
  company?: Company | null;
}

export function CompanyDialog({ open, onClose, company }: CompanyDialogProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    company_id: "",
    description: "",
    template_id: "",
    metadata: {} as Record<string, any>,
  });

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        company_id: company.company_id,
        description: company.description || "",
        template_id: company.template_id || "none",
        metadata: company.metadata || {},
      });
    } else {
      setFormData({
        name: "",
        company_id: "",
        description: "",
        template_id: "none",
        metadata: {},
      });
    }
    setError(null);
  }, [company, open]);

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const data = await templatesApi.list();
      setTemplates(data);
    } catch (err) {
      console.error("Error loading templates:", err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        template_id: formData.template_id && formData.template_id !== "none" ? formData.template_id : undefined,
        metadata: Object.keys(formData.metadata).length > 0 ? formData.metadata : undefined,
      };

      if (company) {
        await companiesApi.update(company.id, payload);
        showToast("Company updated successfully", "success");
      } else {
        await companiesApi.create(payload);
        showToast("Company created successfully", "success");
      }
      onClose(true);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to save company";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{company ? "Edit Company" : "Create Company"}</DialogTitle>
          <DialogDescription>
            {company
              ? "Update the company details."
              : "Add a new company to the system. The Company ID must be unique."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Company"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_id">Company ID *</Label>
            <Input
              id="company_id"
              value={formData.company_id}
              onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
              placeholder="my-company"
              required
              disabled={!!company}
            />
            <p className="text-xs text-muted-foreground">
              Unique identifier used in API calls. Cannot be changed after creation.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Company description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template_id">Base Template</Label>
            <Select
              value={formData.template_id}
              onValueChange={(value) => setFormData({ ...formData, template_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a template (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {loadingTemplates ? (
                  <SelectItem value="loading" disabled>
                    Loading templates...
                  </SelectItem>
                ) : (
                  templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Optional template to use as a base for prompts.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : company ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

