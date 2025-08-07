'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { PlanPaymentCard } from './ui/PlanPaymentCard';
import { PaymentSummary } from './ui/PaymentSummary';
import { usePaymentOptions, PeriodoPago } from './hooks/usePaymentOptions';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { AlertCircle, CreditCard } from 'lucide-react';

export const PaymentOptions: React.FC = () => {
  const router = useRouter();
  const {
    paymentPlans,
    isSubmitting,
    error,
    isFormValid,
    totalGeneral,
    handlePeriodChange,
    submitQuotation
  } = usePaymentOptions();

  const handleBack = () => {
    router.push('/dashboard/cotizacion?step=3');
  };

  const handleSubmit = async () => {
    await submitQuotation();
  };

  // Loading state
  if (paymentPlans.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-2 border-[#005BBB] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-600">Cargando información de pagos...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <CreditCard className="w-6 h-6 text-[#005BBB]" />
            Opciones de Pago
          </CardTitle>
          <p className="text-gray-600">
            Selecciona el período de pago para cada plan y revisa el resumen final de tu cotización.
          </p>
        </CardHeader>
      </Card>

      {/* Error Global */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Plan Payment Cards */}
      <div className="space-y-4">
        {paymentPlans.map((plan) => (
          <PlanPaymentCard
            key={plan.plan}
            plan={plan}
            selectedPeriod={plan.selectedPeriod}
            onPeriodChange={(period: PeriodoPago) => handlePeriodChange(plan.plan, period)}
          />
        ))}
      </div>

      {/* Payment Summary */}
      <PaymentSummary
        totalGeneral={totalGeneral}
        isFormValid={isFormValid}
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
        onBack={handleBack}
      />

      {/* Instructions */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-gray-600">
            <h4 className="font-medium text-gray-900">Información importante:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Los montos se calculan automáticamente según el período seleccionado</li>
              <li>Mensual: Sin multiplicador adicional</li>
              <li>Trimestral: Se multiplica por 3 meses</li>
              <li>Semestral: Se multiplica por 6 meses</li>
              <li>Anual: Se multiplica por 12 meses</li>
              <li>El PDF se generará automáticamente al finalizar</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentOptions;
