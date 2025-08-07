import { useQuotationStore } from '@/presentation/quotations/store/useQuotationStore';
import React from 'react'

const CoberturasOpcionales = () => {
    const {getFinalObject} = useQuotationStore();

    console.log('Coberturas Opcionales:', getFinalObject());
    
  return (
    <div>
      en desarrollo
    </div>
  )
}

export default CoberturasOpcionales
