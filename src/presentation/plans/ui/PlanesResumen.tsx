"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'
import { Plan } from '@/presentation/quotations/interface/createQuotation.interface'

interface Props {
  planes: Plan[]
}

const PlanesResumen = ({ planes }: Props) => {
  if (planes.length === 0) return null

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _totalAfiliados = planes.reduce((acc, plan) => acc + plan.afiliados.length, 0)
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
          <div className="grid grid-cols-4 gap-4 pb-2 border-b font-medium text-sm text-gray-600">
            <div>Planes</div>
            <div>Subtotal Afiliados</div>
            <div>Subtotal Opcionales</div>
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
              <div key={index} className="grid grid-cols-4 gap-4 py-2 border-b last:border-b-0">
                <div className="text-sm font-medium">{plan.plan}</div>
                <div className="text-sm">DOP {planTotalAfiliados.toFixed(2)}</div>
                <div className="text-sm">DOP {planTotalOpcionales.toFixed(2)}</div>
                <div className="text-sm font-medium">DOP {planTotal.toFixed(2)}</div>
              </div>
            )
          })}
          
          {/* Total general */}
          {planes.length > 1 && (
            <div className="grid grid-cols-4 gap-4 pt-2 border-t font-bold">
              <div className="text-sm">TOTAL</div>
              <div className="text-sm">DOP {planes.reduce((acc, plan) => acc + plan.afiliados.reduce((planAcc, afiliado) => planAcc + parseFloat(afiliado.subtotal || '0'), 0), 0).toFixed(2)}</div>
              <div className="text-sm">DOP {planes.reduce((acc, plan) => acc + plan.opcionales.reduce((optAcc, opcional) => optAcc + opcional.prima, 0), 0).toFixed(2)}</div>
              <div className="text-sm">DOP {totalMonto.toFixed(2)}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default PlanesResumen
