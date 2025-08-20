// Core exports - Punto de entrada unificado
export * from './types';
export * from './store';
export * from './services';
export * from './hooks';

// Alias para compatibilidad
export { useQuotationStore as useUnifiedQuotationStore } from './store/quotationStore';

// Exportar hooks específicos
export { useStepNavigation } from './hooks/useStepNavigation';
