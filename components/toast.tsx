"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Card
            key={toast.id}
            className={cn(
              "min-w-[300px] shadow-lg animate-in slide-in-from-right",
              toast.type === "success" && "border-green-500 bg-green-50 dark:bg-green-950",
              toast.type === "error" && "border-destructive bg-destructive/10",
              toast.type === "info" && "border-blue-500 bg-blue-50 dark:bg-blue-950"
            )}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <p
                className={cn(
                  "text-sm font-medium",
                  toast.type === "success" && "text-green-900 dark:text-green-100",
                  toast.type === "error" && "text-destructive",
                  toast.type === "info" && "text-blue-900 dark:text-blue-100"
                )}
              >
                {toast.message}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => removeToast(toast.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

