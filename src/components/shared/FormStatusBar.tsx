"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ClearButton } from "./ClearButton";
import { useClearActions } from "@/presentation/helpers/hooks/useClearActions";

interface FormStatusBarProps {
  steps: {
    name: string;
    completed: boolean;
    hasData: boolean;
    errors?: number;
  }[];
  className?: string;
}

export const FormStatusBar = ({ steps, className = "" }: FormStatusBarProps) => {
  const { clearAll } = useClearActions();
  
  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const hasErrors = steps.some(step => step.errors && step.errors > 0);
  const hasData = steps.some(step => step.hasData);

  const getStepIcon = (step: typeof steps[0]) => {
    if (step.errors && step.errors > 0) {
      return <AlertCircle className="w-3 h-3 text-red-500" />;
    }
    if (step.completed) {
      return <CheckCircle className="w-3 h-3 text-green-500" />;
    }
    if (step.hasData) {
      return <Clock className="w-3 h-3 text-yellow-500" />;
    }
    return <div className="w-3 h-3 rounded-full bg-gray-300" />;
  };

  const getStepVariant = (step: typeof steps[0]) => {
    if (step.errors && step.errors > 0) return "destructive";
    if (step.completed) return "default"; // Cambiado de "success" a "default"
    if (step.hasData) return "secondary";
    return "outline";
  };

  return (
    <Card className={`border-t-4 ${hasErrors ? 'border-t-red-500' : completedSteps === totalSteps ? 'border-t-green-500' : 'border-t-[#005BBB]'} ${className}`}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          {/* Estado del progreso */}
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="font-semibold text-gray-900">
                Progreso: {completedSteps}/{totalSteps}
              </span>
              <div className="flex items-center gap-1 mt-1">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <Badge variant={getStepVariant(step)} className="text-xs px-2 py-1">
                      {getStepIcon(step)}
                      <span className="ml-1">{step.name}</span>
                      {step.errors && step.errors > 0 && (
                        <span className="ml-1">({step.errors})</span>
                      )}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            {hasData && (
              <ClearButton
                onClear={clearAll}
                variant="confirm"
                confirmTitle="¿Limpiar todo el formulario?"
                confirmMessage="Esta acción eliminará todos los datos ingresados en todos los pasos. Esta acción no se puede deshacer."
                className="bg-red-500 hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Limpiar Todo
              </ClearButton>
            )}
          </div>
        </div>

        {/* Barra de progreso visual */}
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${hasErrors ? 'bg-red-500' : 'bg-[#005BBB]'}`}
            style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default FormStatusBar;
