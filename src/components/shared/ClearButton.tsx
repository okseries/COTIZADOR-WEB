"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import ThemedAlertDialog from "@/components/shared/ThemedAlertDialog";

interface ClearButtonProps {
  onClear: () => void;
  variant?: "simple" | "confirm";
  size?: "sm" | "lg" | "default";
  className?: string;
  confirmTitle?: string;
  confirmMessage?: string;
  children?: React.ReactNode;
}

export const ClearButton = ({
  onClear,
  variant = "simple",
  size = "sm",
  className = "",
  confirmTitle = "¿Confirmar limpieza?",
  confirmMessage = "Esta acción limpiará todos los datos del formulario. ¿Deseas continuar?",
  children
}: ClearButtonProps) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = () => {
    if (variant === "confirm") {
      setShowConfirm(true);
    } else {
      onClear();
    }
  };

  const handleConfirm = () => {
    onClear();
    setShowConfirm(false);
  };

  return (
    <>
      <Button 
        onClick={handleClick} 
        className={`bg-red-500 hover:bg-red-600 text-white ${className}`}
        variant="outline"
        size={size}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        {children || "Limpiar Todo"}
      </Button>

      {variant === "confirm" && (
        <ThemedAlertDialog
          open={showConfirm}
          onClose={() => setShowConfirm(false)}
          title={confirmTitle}
          message={confirmMessage}
          icon={<AlertTriangle className="h-6 w-6 text-yellow-500" />}
          type="warning"
          actionLabel="Confirmar"
          cancelLabel="Cancelar"
          onAction={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

export default ClearButton;
