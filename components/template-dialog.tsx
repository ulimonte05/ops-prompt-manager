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
import { templatesApi, Template } from "@/lib/api-client";
import { useToast } from "@/components/toast";
import { Plus, X } from "lucide-react";

interface TemplateDialogProps {
  open: boolean;
  onClose: (success: boolean) => void;
  template?: Template | null;
}

export function TemplateDialog({ open, onClose, template }: TemplateDialogProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    fields: {} as Record<string, string>,
  });
  const [newFieldKey, setNewFieldKey] = useState("");
  const [editingField, setEditingField] = useState<string | null>(null);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        fields: template.fields || {},
      });
    } else {
      setFormData({
        name: "",
        fields: {},
      });
    }
    setError(null);
    setNewFieldKey("");
  }, [template, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (template) {
        await templatesApi.update(template.id, formData);
        showToast("Template updated successfully", "success");
      } else {
        await templatesApi.create(formData);
        showToast("Template created successfully", "success");
      }
      onClose(true);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to save template";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const addField = () => {
    if (newFieldKey.trim() && !formData.fields[newFieldKey.trim()]) {
      setFormData({
        ...formData,
        fields: {
          ...formData.fields,
          [newFieldKey.trim()]: "",
        },
      });
      setEditingField(newFieldKey.trim());
      setNewFieldKey("");
    }
  };

  const updateFieldContent = (key: string, content: string) => {
    setFormData({
      ...formData,
      fields: {
        ...formData.fields,
        [key]: content,
      },
    });
  };

  const removeField = (key: string) => {
    const newFields = { ...formData.fields };
    delete newFields[key];
    setFormData({ ...formData, fields: newFields });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent className="w-[80vw] max-w-[80vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? "Edit Template" : "Create Template"}</DialogTitle>
          <DialogDescription>
            {template
              ? "Update the template name and fields."
              : "Create a reusable template with fields that will be used when creating prompts."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="Sales Agent Template"
              required
              className="text-lg"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Fields</Label>
            <p className="text-sm text-muted-foreground">
              Add fields that will be available when applying this template to a prompt. These fields can be used as variables in the prompt content.
            </p>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newFieldKey}
                  onChange={(e) => setNewFieldKey(e.target.value)}
                  placeholder="field_name (e.g., company_name, agent_role)"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addField();
                    }
                  }}
                  className="flex-1"
                />
                <Button type="button" onClick={addField} size="default">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </div>
              {Object.keys(formData.fields).length > 0 && (
                <div className="space-y-4">
                  {Object.keys(formData.fields).map((key) => (
                    <div
                      key={key}
                      className="border rounded-lg p-4 bg-background space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">{key}</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingField(editingField === key ? null : key)}
                          >
                            {editingField === key ? "Collapse" : "Expand"}
                          </Button>
                          <button
                            type="button"
                            onClick={() => removeField(key)}
                            className="hover:text-destructive transition-colors p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {editingField === key ? (
                        <Textarea
                          value={formData.fields[key]}
                          onChange={(e) => updateFieldContent(key, e.target.value)}
                          placeholder={`Write the prompt content for ${key}...`}
                          rows={15}
                          className="font-mono text-sm min-h-[300px] resize-y"
                        />
                      ) : (
                        <div className="p-3 bg-muted rounded-md">
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                            {formData.fields[key] || "No content yet. Click Expand to add content."}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {Object.keys(formData.fields).length === 0 && (
                <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                  <p className="text-sm">No fields added yet. Add fields that will be available when using this template.</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : template ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

