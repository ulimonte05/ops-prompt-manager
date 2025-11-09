"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Template } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface TemplateViewDialogProps {
  open: boolean;
  onClose: () => void;
  template: Template | null;
}

export function TemplateViewDialog({ open, onClose, template }: TemplateViewDialogProps) {
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Template Details</DialogTitle>
          <DialogDescription>
            View the complete template information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Name:</span>
            <span className="text-sm font-semibold">{template.name}</span>
          </div>

          {template.description && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Description:</span>
              <span className="text-sm text-muted-foreground">{template.description}</span>
            </div>
          )}

          {template.fields && Object.keys(template.fields).length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(template.fields).map(([key, value]) => (
                    <div key={key} className="border rounded-lg p-4 bg-background space-y-2">
                      <Label className="text-base font-semibold">{key}</Label>
                      <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-md min-h-[100px]">
                        {value || "No content"}
                      </pre>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">
                  No fields defined in this template.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Created: {new Date(template.created_at).toLocaleString()}</span>
            <span>Updated: {new Date(template.updated_at).toLocaleString()}</span>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

