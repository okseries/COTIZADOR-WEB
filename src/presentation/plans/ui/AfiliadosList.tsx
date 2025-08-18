"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import React from "react";
import { Afiliado } from "@/presentation/quotations/interface/createQuotation.interface";
import { formatCurrency } from "@/presentation/helpers/FormattCurrency";
import { Badge } from "@/components/ui/badge";

interface Props {
  planName: string;
  planType: string;
  afiliados: Afiliado[];
  clienteChousen: number; // Agregado para pasar el tipo de cliente
  onRemoveAfiliado: (index: number) => void;
}

const AfiliadosList = ({
  planName,
  planType,
  afiliados,
  onRemoveAfiliado,
  clienteChousen
}: Props) => {
  if (afiliados.length === 0) return null;

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          <Badge className=" bg-gradient-to-b from-[#009590] to-[#0269aa] text-white mr-2">
            {planName}
          </Badge>
        </CardTitle>
        <span className="text-sm text-gray-500 px-1">{planType}</span>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 sm:space-y-2">
          {/* Header */}
          <div className="sm:block hidden">
            <div className="grid grid-cols-5 gap-4 pb-2 border-b font-medium text-sm text-gray-600">
              <div>Parentesco</div>
              <div>{clienteChousen === 2 ? 'Cantidad' : 'Edad'}</div>
              <div>Prima Plan</div>
              <div>Prima Total</div>
              <div>Acciones</div>
            </div>
          </div>
          <div className="sm:hidden pb-2 border-b">
            <div className="text-sm font-medium text-gray-600">Afiliados</div>
          </div>

          {/* Afiliados */}
          {afiliados.map((afiliado, index) => {
            const cantidad = clienteChousen === 2 ? afiliado.cantidadAfiliados : 1;
            const edadOCantidad = clienteChousen === 2 ? afiliado.cantidadAfiliados : afiliado.edad;
            const primaUnitaria = cantidad > 0 ? parseFloat(afiliado.subtotal) / cantidad : 0;
            const primaTotal = parseFloat(afiliado.subtotal);

            return (
              <div key={index}>
                {/* Mobile Layout */}
                <div className="sm:hidden bg-gray-50 rounded-lg p-3 border">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium text-sm">{afiliado.parentesco}</div>
                      <div className="text-xs text-gray-500">
                        {clienteChousen === 2 ? `Cantidad: ${edadOCantidad}` : `Edad: ${edadOCantidad}`}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onRemoveAfiliado(index)}
                      className="h-7 w-7 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Prima Total:</span>
                    <span className="font-medium">{formatCurrency(primaTotal)}</span>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:grid grid-cols-5 gap-4 py-2 border-b last:border-b-0 items-center">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{afiliado.parentesco}</div>
                  </div>
                  <div className="text-sm truncate">{edadOCantidad}</div>
                  <div className="text-sm font-medium min-w-0 truncate">
                    {formatCurrency(primaUnitaria)}
                  </div>
                  <div className="text-sm font-medium min-w-0 truncate">
                    {formatCurrency(primaTotal)}
                  </div>
                  <div className="flex justify-start">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onRemoveAfiliado(index)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AfiliadosList;
