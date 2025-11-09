"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Prompt } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PromptViewDialogProps {
  open: boolean;
  onClose: () => void;
  prompt: Prompt | null;
  companyName: string;
}

export function PromptViewDialog({ open, onClose, prompt, companyName }: PromptViewDialogProps) {
  if (!prompt) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] min-w-[95vw] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prompt Details</DialogTitle>
          <DialogDescription>
            View the complete prompt information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Company:</span>
            <span className="text-sm">{companyName}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Version:</span>
              <Badge variant="outline">v{prompt.version}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              {prompt.is_active ? (
                <Badge>Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>
          </div>

          {prompt.variables && Object.keys(prompt.variables).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Variables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(prompt.variables).map(([key, value]) => (
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
          )}

          {prompt.conditions && prompt.conditions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Conditions</CardTitle>
                <CardDescription>
                  Content added when context matches the condition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {prompt.conditions.map((condition, index) => (
                    <div key={index} className="border-l-2 border-primary pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">
                          {condition.key} = {condition.value}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{condition.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Created: {new Date(prompt.created_at).toLocaleString()}</span>
            <span>Updated: {new Date(prompt.updated_at).toLocaleString()}</span>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

