'use client';

import React, { useEffect, useState } from 'react';
import { useQuotationStore } from '@/presentation/quotations/store/useQuotationStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const StoreDebugger: React.FC = () => {
  const { cliente, planes } = useQuotationStore();
  const [isVisible, setIsVisible] = useState(false);
  
  // Solo mostrar en desarrollo
  useEffect(() => {
    setIsVisible(process.env.NODE_ENV === 'development');
  }, []);

  if (!isVisible) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-y-auto z-50 border-2 border-red-500 bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-sm text-red-600">🐛 Store Debugger</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div>
          <strong>Cliente:</strong>
          <div className="ml-2">
            <Badge variant="outline">Tipo: {cliente?.clientChoosen}</Badge>
            <Badge variant="outline" className="ml-1">Plan: {cliente?.tipoPlan}</Badge>
          </div>
        </div>
        
        <div>
          <strong>Planes ({planes?.length || 0}):</strong>
          {planes?.map((plan, index) => (
            <div key={index} className="ml-2 mb-2 p-2 bg-gray-50 rounded">
              <div><strong>{plan.plan}</strong></div>
              <div>Afiliados: {plan.afiliados?.length || 0}</div>
              <div>Cantidad: {plan.cantidadAfiliados}</div>
              <div>Opcionales ({plan.opcionales?.length || 0}):</div>
              {plan.opcionales?.map((opcional, i) => (
                <div key={i} className="ml-2 text-xs">
                  • {opcional.nombre}: ${opcional.prima}
                  {opcional.idCopago && <span className="text-blue-600"> (Copago: {opcional.idCopago})</span>}
                </div>
              ))}
              <div className="mt-1">
                <Badge variant="secondary" className="text-xs">
                  SubTotal Afiliado: ${plan.resumenPago?.subTotalAfiliado || 0}
                </Badge>
                <Badge variant="secondary" className="text-xs ml-1">
                  SubTotal Opcional: ${plan.resumenPago?.subTotalOpcional || 0}
                </Badge>
                <Badge variant="destructive" className="text-xs ml-1">
                  Total: ${plan.resumenPago?.totalPagar || 0}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StoreDebugger;
