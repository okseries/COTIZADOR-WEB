
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Info,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import React from "react";

type AlertType = "info" | "success" | "error" | "warning";

interface ThemedAlertDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  type?: AlertType;
  icon?: React.ReactNode;
  actionLabel?: string;
  cancelLabel?: string;
  onAction?: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
}

const typeConfig: Record<AlertType, { icon: React.ReactNode; color: string }> = {
  info: { icon: <Info className="text-blue-500" />, color: "bg-blue-50" },
  success: { icon: <CheckCircle className="text-green-500" />, color: "bg-green-50" },
  error: { icon: <XCircle className="text-red-500" />, color: "bg-red-50" },
  warning: { icon: <AlertCircle className="text-yellow-500" />, color: "bg-yellow-50" },
};

export default function ThemedAlertDialog({
  open,
  onClose,
  title,
  message,
  type = "info",
  icon,
  actionLabel = "Aceptar",
  cancelLabel,
  onAction,
  onCancel,
  children,
}: ThemedAlertDialogProps) {
  const config = typeConfig[type] || typeConfig.info;

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className={`rounded-lg shadow-lg ${config.color}`}>
        <AlertDialogHeader className="flex flex-col items-center gap-2 pb-2">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow mb-2">
            {icon || config.icon}
          </div>
          <AlertDialogTitle className="text-lg font-semibold text-center">
            {title}
          </AlertDialogTitle>
        </AlertDialogHeader>
        {message && (
          <AlertDialogDescription className="text-center text-gray-700 mb-2">
            {message}
          </AlertDialogDescription>
        )}
        {children && (
          <div className="mb-2 text-center">{children}</div>
        )}
        <AlertDialogFooter className="flex flex-row gap-2 justify-center pt-2">
          {cancelLabel && (
            <AlertDialogCancel asChild>
              <Button variant="outline" onClick={onCancel}>{cancelLabel}</Button>
            </AlertDialogCancel>
          )}
          <AlertDialogAction asChild>
            <Button className="bg-[#005BBB] hover:bg-[#003E7E] text-white"  onClick={onAction} autoFocus>
              {actionLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
