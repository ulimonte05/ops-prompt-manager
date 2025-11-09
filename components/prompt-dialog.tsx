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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { promptsApi, templatesApi, Prompt, Company, Template, PromptCondition } from "@/lib/api-client";
import { useToast } from "@/components/toast";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

interface PromptDialogProps {
  open: boolean;
  onClose: (success: boolean) => void;
  prompt?: Prompt | null;
  companies: Company[];
}

export function PromptDialog({ open, onClose, prompt, companies }: PromptDialogProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    company_id: "",
    prompt_content: " ", // Always send a space for API validation
    variables: {} as Record<string, string>,
    conditions: [] as PromptCondition[],
    is_active: false,
  });
  const [newCondition, setNewCondition] = useState({ key: "", value: "", content: "" });
  const [newVariable, setNewVariable] = useState({ key: "", value: "" });

  useEffect(() => {
    if (open && !prompt) {
      loadTemplates();
    }
  }, [open, prompt]);

  useEffect(() => {
    if (prompt) {
      setFormData({
        company_id: prompt.company_id,
        prompt_content: prompt.prompt_content,
        variables: prompt.variables || {},
        conditions: prompt.conditions || [],
        is_active: prompt.is_active,
      });
      setSelectedTemplateId("");
      setSelectedTemplate(null);
    } else {
      setFormData({
        company_id: companies[0]?.id || "",
        prompt_content: "",
        variables: {},
        conditions: [],
        is_active: false,
      });
      setSelectedTemplateId("");
      setSelectedTemplate(null);
    }
    setError(null);
    setNewCondition({ key: "", value: "", content: "" });
    setNewVariable({ key: "", value: "" });
  }, [prompt, open, companies]);

  // Load template when selected
  useEffect(() => {
    if (selectedTemplateId && selectedTemplateId !== "none" && !prompt) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        setSelectedTemplate(template);
        // Pre-fill variables with template fields content
        const preFilledVariables: Record<string, string> = {};
        Object.entries(template.fields || {}).forEach(([key, content]) => {
          preFilledVariables[key] = content || "";
        });

        setFormData(prev => ({
          ...prev,
          variables: Object.keys(preFilledVariables).length > 0 ? preFilledVariables : prev.variables,
        }));
      }
    } else if (selectedTemplateId === "none" || !selectedTemplateId) {
      setSelectedTemplate(null);
      if (selectedTemplateId === "none") {
        setFormData(prev => ({
          ...prev,
          variables: {},
        }));
      }
    }
  }, [selectedTemplateId, templates, prompt]);

  const loadTemplates = async () => {
    try {
      const data = await templatesApi.list();
      setTemplates(data);
    } catch (err) {
      console.error("Error loading templates:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (prompt) {
        // Update existing prompt
        await promptsApi.update(prompt.id, formData);
        showToast("Prompt updated successfully", "success");
      } else {
        // Create new prompt (always use create, template is just for pre-filling)
        await promptsApi.create(formData);
        showToast("Prompt created successfully", "success");
      }
      onClose(true);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to save prompt";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const addCondition = () => {
    if (newCondition.key && newCondition.value && newCondition.content) {
      setFormData({
        ...formData,
        conditions: [...formData.conditions, { ...newCondition }],
      });
      setNewCondition({ key: "", value: "", content: "" });
    }
  };

  const removeCondition = (index: number) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.filter((_, i) => i !== index),
    });
  };

  const addVariable = () => {
    if (newVariable.key && newVariable.value) {
      setFormData({
        ...formData,
        variables: {
          ...formData.variables,
          [newVariable.key]: newVariable.value,
        },
      });
      setNewVariable({ key: "", value: "" });
    }
  };

  const removeVariable = (key: string) => {
    const newVariables = { ...formData.variables };
    delete newVariables[key];
    setFormData({ ...formData, variables: newVariables });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent className="w-[95vw] min-w-[95vw] max-w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{prompt ? "Edit Prompt" : "Create Prompt"}</DialogTitle>
          <DialogDescription>
            {prompt
              ? "Update the prompt content, variables, and conditions."
              : "Create a new prompt manually or from a template."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="company_id">Company *</Label>
            <Select
              value={formData.company_id}
              onValueChange={(value) => setFormData({ ...formData, company_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name} ({company.company_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!prompt && (
            <div className="space-y-2">
              <Label htmlFor="template_id">Load from Template (Optional)</Label>
              <Select
                value={selectedTemplateId}
                onValueChange={setSelectedTemplateId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template to pre-fill variables" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None - Start from scratch</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select a template to pre-fill variables. You can edit everything after loading.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Variables</Label>
              {selectedTemplate && !prompt && (
                <div className="p-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                  <p className="text-xs text-blue-900 dark:text-blue-100">
                    <strong>Template loaded:</strong> {selectedTemplate.name}
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Variable name (e.g., company_name, agent_role)"
                  value={newVariable.key}
                  onChange={(e) => setNewVariable({ ...newVariable, key: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addVariable();
                    }
                  }}
                  className="flex-1"
                />
                <Button type="button" onClick={addVariable} size="default">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variable
                </Button>
              </div>
              {Object.keys(formData.variables).length > 0 && (
                <div className="space-y-4">
                  {Object.entries(formData.variables).map(([key, value]) => (
                    <div
                      key={key}
                      className="border rounded-lg p-4 bg-background space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">{key}</Label>
                        <button
                          type="button"
                          onClick={() => removeVariable(key)}
                          className="hover:text-destructive transition-colors p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <Textarea
                        value={value}
                        onChange={(e) => {
                          const newVariables = { ...formData.variables };
                          newVariables[key] = e.target.value;
                          setFormData({ ...formData, variables: newVariables });
                        }}
                        placeholder={`Write the content for ${key}...`}
                        rows={15}
                        className="font-mono text-sm min-h-[300px] resize-y"
                      />
                    </div>
                  ))}
                </div>
              )}
              {Object.keys(formData.variables).length === 0 && (
                <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                  <p className="text-sm">No variables added yet. Add variables to define your prompt content.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Conditions</Label>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Key (e.g., channel)"
                  value={newCondition.key}
                  onChange={(e) => setNewCondition({ ...newCondition, key: e.target.value })}
                />
                <Input
                  placeholder="Value (e.g., whatsapp)"
                  value={newCondition.value}
                  onChange={(e) => setNewCondition({ ...newCondition, value: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="Content to add when condition matches..."
                  value={newCondition.content}
                  onChange={(e) => setNewCondition({ ...newCondition, content: e.target.value })}
                  rows={8}
                  className="font-mono text-sm min-h-[200px] resize-y"
                />
                <Button type="button" onClick={addCondition} size="default" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>
              </div>
              {formData.conditions.length > 0 && (
                <div className="space-y-4">
                  {formData.conditions.map((condition, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 bg-background space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            {condition.key} = {condition.value}
                          </Badge>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCondition(index)}
                          className="hover:text-destructive transition-colors p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <Textarea
                        value={condition.content}
                        onChange={(e) => {
                          const newConditions = [...formData.conditions];
                          newConditions[index].content = e.target.value;
                          setFormData({ ...formData, conditions: newConditions });
                        }}
                        placeholder="Content to add when condition matches..."
                        rows={10}
                        className="font-mono text-sm min-h-[250px] resize-y"
                      />
                    </div>
                  ))}
                </div>
              )}
              {formData.conditions.length === 0 && (
                <div className="p-6 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                  <p className="text-sm">No conditions added yet. Conditions add content to the prompt when the context matches the key-value pair.</p>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Conditions add content to the prompt when the context matches the key-value pair.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Set as active prompt (will deactivate other prompts for this company)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : prompt ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

