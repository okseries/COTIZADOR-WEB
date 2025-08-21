"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'
import { Plan } from '@/presentation/quotations/interface/createQuotation.interface'
import { formatCurrency } from '@/presentation/helpers/FormattCurrency'

interface Props {
  planes: Plan[]
  clienteChousen?: number // Agregar para saber si es colectivo (2) o individual (1)
}

const PlanesResumen = ({ planes, clienteChousen = 1 }: Props) => {
  if (planes.length === 0) return null;

  // Calcular totales por plan - SOLO AFILIADOS (sin opcionales para Step 2)
  const getPlanTotal = (plan: Plan) => {
    // En el Step 2, solo mostrar el total de afiliados (sin opcionales)
    const afiliadosTotal = plan.afiliados.reduce((acc, afiliado) => acc + parseFloat(afiliado.subtotal || '0'), 0);
    return afiliadosTotal;
  };

  // Calcular cantidad total de afiliados
  const getTotalAfiliados = () => {
    if (clienteChousen === 2) {
      // Para colectivos, sumar las cantidades (campo cantidadAfiliados)
      return planes.reduce((acc, plan) => acc + plan.afiliados.reduce((a, af) => a + af.cantidadAfiliados, 0), 0);
    } else {
      // Para individuales, contar número de afiliados
      return planes.reduce((acc, plan) => acc + plan.afiliados.length, 0);
    }
  };

  // Calcular total general
  const totalMonto = planes.reduce((acc, plan) => acc + getPlanTotal(plan), 0);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Resumen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Header */}
          <div className="grid grid-cols-3 gap-4 pb-2 border-b font-medium text-sm text-gray-600">
            <div>Planes</div>
            <div>Cantidad</div>
            <div>Total</div>
          </div>

          {/* Planes */}
          {planes.map((plan, index) => {
            // Cantidad: para colectivo usar cantidadAfiliados, para individual usar length
            const cantidad = clienteChousen === 2
              ? plan.afiliados.reduce((acc, af) => acc + af.cantidadAfiliados, 0) // cantidadAfiliados para colectivos
              : plan.afiliados.length;
            const planTotal = getPlanTotal(plan);
            return (
              <div key={index} className="grid grid-cols-3 gap-4 py-2 border-b last:border-b-0">
                <div className="text-sm font-medium">{plan.plan}</div>
                <div className="text-sm">{cantidad}</div>
                <div className="text-sm font-medium">{formatCurrency(planTotal)}</div>
              </div>
            );
          })}

          {/* Total general */}
          {planes.length > 1 && (
            <div className="grid grid-cols-3 gap-4 pt-2 border-t font-bold">
              <div className="text-sm">TOTAL</div>
              <div className="text-sm">{getTotalAfiliados()}</div>
              <div className="text-sm">{formatCurrency(totalMonto)}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default PlanesResumen
