"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";
import { Spinner } from "@/components/shared/Spinner";

interface StepLayoutProps {
  title: string;
  subtitle?: string;
  onClearStep?: () => void;
  showClearButton?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
  stepNumber?: number;
  totalSteps?: number;
}

export const StepLayout = ({
  title,
  subtitle,
  onClearStep,
  showClearButton = true,
  isLoading = false,
  children,
  className = "",
  stepNumber,
  totalSteps
}: StepLayoutProps) => {
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {stepNumber && totalSteps && (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#005BBB] text-white text-sm font-semibold">
                  {stepNumber}
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                {subtitle && (
                  <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                )}
              </div>
            </div>
            
            {stepNumber && totalSteps && (
              <div className="mt-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Paso {stepNumber} de {totalSteps}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-[#005BBB] rounded-full transition-all duration-300"
                      style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {showClearButton && onClearStep && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearStep}
              className="text-gray-500 hover:text-red-500 hover:bg-red-50"
              disabled={isLoading}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reiniciar paso
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Spinner size="lg" color="primary" className="mx-auto mb-4" />
              <p className="text-gray-600">Cargando...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};

export default StepLayout;
