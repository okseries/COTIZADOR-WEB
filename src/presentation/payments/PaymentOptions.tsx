'use client';

import React from 'react';
// import { useRouter } from 'next/navigation';
import { PlanPaymentCard } from './ui/PlanPaymentCard';
import { PaymentSummary } from './ui/PaymentSummary';
import { usePaymentOptions, PeriodoPago } from './hooks/usePaymentOptions';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuotationStore } from '@/core';
// import { useQuotationStore } from '@/core';
// import { useQuotationStore } from '../quotations/store/useQuotationStore';
// import { useAuth } from '../auth/store/useAuth.store';

export const PaymentOptions: React.FC = () => {

  // //! Eliminar
  const {getFinalObject} = useQuotationStore();
  // const { user: authUser } = useAuth();
  // const router = useRouter();
  const {
    paymentPlans,
    isSubmitting,
    error,
    isFormValid,
    totalGeneral,
    handlePeriodChange,
    submitQuotation
  } = usePaymentOptions();

  // const handleBack = () => {
  //   router.push('/dashboard/cotizacion?step=3');
  // };

  const handleSubmit = async () => {
    const payload = getFinalObject();
    
    console.log("🚀 PAYLOAD FINAL ANTES DEL ENVÍO:", JSON.stringify(payload, null, 2));
    console.log("🔍 VERIFICANDO ORIGINAL_OPT_ID EN OPCIONALES:");
    payload.planes?.forEach(plan => {
      console.log(`Plan ${plan.plan}:`, plan.opcionales?.map(opt => ({
        nombre: opt.nombre,
        originalOptId: opt.originalOptId || 'NO_PRESENTE',
        id: opt.id,
        tipoOpcionalId: opt.tipoOpcionalId || 'NO_PRESENTE'
      })));
    });
    
    debugger
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
    <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
      {/* Header */}
     

      {/* Error Global */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Plan Payment Cards */}
      <div className="space-y-6">
        {paymentPlans.map((plan) => (
          <PlanPaymentCard
            key={plan.plan}
            plan={plan}
            selectedPeriod={plan.selectedPeriod}
            onPeriodChange={(period: PeriodoPago | undefined) => handlePeriodChange(plan.plan, period)}
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
      />

      
    </div>
  );
};

export default PaymentOptions;
