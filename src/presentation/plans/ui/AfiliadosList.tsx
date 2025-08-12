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
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-5 gap-4 pb-2 border-b font-medium text-sm text-gray-600">
            <div>Parentesco</div>
            <div>{clienteChousen === 2 ? 'Cantidad' : 'Edad'}</div>
            <div>Prima Plan</div>
            <div>Prima Total</div>
            <div>Acciones</div>
          </div>

          {/* Afiliados */}
          {afiliados.map((afiliado, index) => {
            // Para colectivos, calcular prima unitaria dividiendo el subtotal por la cantidad
            const primaUnitaria = clienteChousen === 2 
              ? parseFloat(afiliado.subtotal) / afiliado.edad
              : parseFloat(afiliado.subtotal);
            const primaTotal = parseFloat(afiliado.subtotal);
            
            return (
              <div
                key={index}
                className="grid grid-cols-5 gap-4 py-2 border-b last:border-b-0"
              >
                <div className="text-sm">{afiliado.parentesco}</div>
                <div className="text-sm">{afiliado.edad}</div>
                <div className="text-sm font-medium">
                  {formatCurrency(primaUnitaria)}
                </div>
                <div className="text-sm font-medium">
                  {formatCurrency(primaTotal)}
                </div>
                <div>
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
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AfiliadosList;
