import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Plan } from '../../quotations/interface/createQuotation.interface';
import { PeriodoPago, MULTIPLICADORES } from '../hooks/usePaymentOptions';
import { formatCurrency } from '@/presentation/helpers/FormattCurrency';

interface PlanPaymentCardProps {
  plan: Plan;
  selectedPeriod?: PeriodoPago;
  onPeriodChange: (period: PeriodoPago) => void;
}

const PERIODO_OPTIONS: PeriodoPago[] = ['Mensual', 'Trimestral', 'Semestral', 'Anual'];

export const PlanPaymentCard: React.FC<PlanPaymentCardProps> = ({
  plan,
  selectedPeriod = 'Mensual',
  onPeriodChange
}) => {
  

  const subTotalAfiliado = plan.afiliados.reduce((sum, afiliado) => 
    sum + parseFloat(afiliado.subtotal.toString()), 0
  );
  
  const subTotalOpcional = plan.opcionales.reduce((sum, opcional) => 
    sum + opcional.prima, 0
  );

  const total = subTotalAfiliado + subTotalOpcional;
  const multiplicador = MULTIPLICADORES[selectedPeriod];
  const totalPagar = total * multiplicador;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {plan.plan}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Subtotal Afiliado
            </label>
            <div className="text-base font-semibold">
              {formatCurrency(subTotalAfiliado)}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Subtotal Opcionales
            </label>
            <div className="text-base font-semibold">
              {formatCurrency(subTotalOpcional)}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Período de Pago
            </label>
            <Select 
              value={selectedPeriod} 
              onValueChange={(value) => onPeriodChange(value as PeriodoPago)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {PERIODO_OPTIONS.map((periodo) => (
                  <SelectItem key={periodo} value={periodo}>
                    {periodo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Total a Pagar
            </label>
            <div className="text-lg font-bold text-[#005BBB]">
              {formatCurrency(totalPagar)}
            </div>
          </div>
        </div>

        {/* Detalles adicionales */}
        {/* {selectedPeriod !== 'Mensual' && (
          <div className="mt-4 p-3 bg-[#005BBB]/10 rounded-lg">
            <div className="text-sm text-[#005BBB]">
              <strong>Cálculo:</strong> {formatCurrency(total)} × {multiplicador} meses = {formatCurrency(totalPagar)}
            </div>
          </div>
        )} */}
      </CardContent>
    </Card>
  );
};
