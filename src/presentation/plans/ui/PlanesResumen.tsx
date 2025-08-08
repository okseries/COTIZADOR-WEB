"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'
import { Plan } from '@/presentation/quotations/interface/createQuotation.interface'
import { formatCurrency } from '@/presentation/helpers/FormattCurrency'

interface Props {
  planes: Plan[]
}

const PlanesResumen = ({ planes }: Props) => {
  if (planes.length === 0) return null

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const totalMonto = planes.reduce((acc, plan) => {
    const planTotal = plan.afiliados.reduce((planAcc, afiliado) => 
      planAcc + parseFloat(afiliado.subtotal || '0'), 0)
    const opcionalesTotal = plan.opcionales.reduce((optAcc, opcional) => 
      optAcc + opcional.prima, 0)
    return acc + planTotal + opcionalesTotal
  }, 0)

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
            const planTotalAfiliados = plan.afiliados.reduce((acc, afiliado) => 
              acc + parseFloat(afiliado.subtotal || '0'), 0)
            const planTotalOpcionales = plan.opcionales.reduce((acc, opcional) => 
              acc + opcional.prima, 0)
            const planTotal = planTotalAfiliados + planTotalOpcionales
            
            return (
              <div key={index} className="grid grid-cols-3 gap-4 py-2 border-b last:border-b-0">
                <div className="text-sm font-medium">{plan.plan}</div>
                <div className="text-sm">{plan.afiliados.length}</div>
                <div className="text-sm font-medium">{formatCurrency(planTotal)}</div>
              </div>
            )
          })}
          
          {/* Total general */}
          {planes.length > 1 && (
            <div className="grid grid-cols-3 gap-4 pt-2 border-t font-bold">
              <div className="text-sm">TOTAL</div>
              <div className="text-sm">{planes.reduce((acc, plan) => acc + plan.afiliados.length, 0)}</div>
              <div className="text-sm">{formatCurrency(totalMonto)}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default PlanesResumen
