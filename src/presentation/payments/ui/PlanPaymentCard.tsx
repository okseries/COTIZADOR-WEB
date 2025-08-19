import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Plan } from '../../quotations/interface/createQuotation.interface';
import { PeriodoPago, MULTIPLICADORES } from '../hooks/usePaymentOptions';
import { formatCurrency } from '@/presentation/helpers/FormattCurrency';
import PaymentIntervalSelector from './PaymentIntervalSelector';
import { Badge } from '@/components/ui/badge';

interface PlanPaymentCardProps {
  plan: Plan;
  selectedPeriod?: PeriodoPago;
  onPeriodChange: (period: PeriodoPago | undefined) => void;
}


export const PlanPaymentCard: React.FC<PlanPaymentCardProps> = ({
  plan,
  selectedPeriod,
  onPeriodChange
}) => {
  

  const subTotalAfiliado = plan.afiliados.reduce((sum, afiliado) => 
    sum + parseFloat(afiliado.subtotal.toString()), 0
  );
  
  const subTotalOpcional = plan.opcionales.reduce((sum, opcional) => 
    sum + opcional.prima, 0
  );

  const total = subTotalAfiliado + subTotalOpcional;
  const multiplicador = selectedPeriod ? MULTIPLICADORES[selectedPeriod] : 0;
  const totalPagar = selectedPeriod ? total * multiplicador : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
           <Badge className=" bg-gradient-to-b from-[#009590] to-[#0269aa] text-white mr-2">
            {plan.plan}
          </Badge>
          
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Subtotal Afiliado</label>
            <div className="text-base font-semibold truncate min-w-0">
              {formatCurrency(subTotalAfiliado)}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Subtotal Opcionales</label>
            <div className="text-base font-semibold truncate min-w-0">
              {formatCurrency(subTotalOpcional)}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Seleccionar período</label>
            <PaymentIntervalSelector
              value={selectedPeriod}
              onChange={onPeriodChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Total a Pagar</label>
            <div className="text-lg font-bold text-[#005BBB] truncate min-w-0">
              {selectedPeriod ? formatCurrency(totalPagar) : "Seleccionar período"}
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
