"use client"
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingStateProps {
  isLoading: boolean;
  hasError: boolean;
  isEmpty: boolean;
}

const LoadingState = ({ isLoading, hasError, isEmpty }: LoadingStateProps) => {
  if (isEmpty) {
    return (
      <div className="text-center py-8">
        <p>No hay planes seleccionados para mostrar coberturas opcionales.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p>Cargando coberturas opcionales...</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Error al cargar las coberturas opcionales.</p>
      </div>
    );
  }

  return null;
};

export default LoadingState;
