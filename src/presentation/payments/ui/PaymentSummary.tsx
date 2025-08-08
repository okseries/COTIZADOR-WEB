import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { AlertCircle, Download, ArrowLeft } from 'lucide-react';

interface PaymentSummaryProps {
  totalGeneral: number;
  isFormValid: boolean;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: () => void;
  onBack: () => void;
}

export const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  totalGeneral,
  isFormValid,
  isSubmitting,
  error,
  onSubmit,
  onBack
}) => {
  const formatCurrency = (amount: number) => {
    return `DOP${amount.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Resumen Final
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total General */}
        <div className="p-4 bg-gradient-to-r from-[#005BBB]/10 to-[#005BBB]/20 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-700">
              Total General a Pagar:
            </span>
            <span className="text-2xl font-bold text-[#005BBB]">
              {formatCurrency(totalGeneral)}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Validation Warning */}
        {!isFormValid && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Por favor, selecciona el período de pago para todos los planes antes de continuar.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          
          
          <Button
            onClick={onSubmit}
            disabled={!isFormValid || isSubmitting}
            className="flex items-center gap-2 flex-1"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Finalizar Cotización
              </>
            )}
          </Button>
        </div>

        
      </CardContent>
    </Card>
  );
};
