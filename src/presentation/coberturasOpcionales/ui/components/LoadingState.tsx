"use client"
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, FileX, Loader2 } from 'lucide-react';

interface LoadingStateProps {
  isLoading: boolean;
  hasError: boolean;
  isEmpty: boolean;
}

const LoadingState = ({ isLoading, hasError, isEmpty }: LoadingStateProps) => {
  if (isEmpty) {
    return (
      <Alert>
        <FileX className="h-4 w-4" />
        <AlertDescription>
          No hay planes seleccionados para mostrar coberturas opcionales. 
          Por favor, regrese al paso anterior y seleccione al menos un plan.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#005BBB]" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">Cargando coberturas opcionales</p>
            <p className="text-sm text-gray-600">Esto puede tomar unos segundos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">
          Error al cargar las coberturas opcionales. Por favor, intente nuevamente o contacte al soporte técnico.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default LoadingState;
