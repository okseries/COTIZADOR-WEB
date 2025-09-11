/**
 * Hook utilitario para gestión de caché de React Query
 * Específico para limpiar caché antes de editar cotizaciones
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export const useCacheManager = () => {
  const queryClient = useQueryClient();

  /**
   * Limpia completamente todo el caché de React Query
   * Úsalo cuando necesites asegurar datos completamente frescos
   */
  const clearAllCache = useCallback(() => {
    queryClient.clear();
  }, [queryClient]);

  /**
   * Limpia solo el caché relacionado con coberturas opcionales
   * Más específico que clearAllCache
   */
  const clearCoverageCache = useCallback(() => {
    console.log('🔄 CLEARING COVERAGE CACHE...');
    
    // Remover queries completamente
    queryClient.removeQueries({ queryKey: ["planesOpcionales"] });
    queryClient.removeQueries({ queryKey: ["coberturasOpcionalesColectivo"] });
    queryClient.removeQueries({ queryKey: ["coberturasOpcionalesByType"] });
    queryClient.removeQueries({ queryKey: ["copagos"] });
    
    // También invalidar por seguridad
    queryClient.invalidateQueries({ queryKey: ["planesOpcionales"] });
    queryClient.invalidateQueries({ queryKey: ["coberturasOpcionalesColectivo"] });
    queryClient.invalidateQueries({ queryKey: ["coberturasOpcionalesByType"] });
    queryClient.invalidateQueries({ queryKey: ["copagos"] });
  }, [queryClient]);

  /**
   * Función para llamar antes de editar una cotización
   * Garantiza que no haya datos cacheados que interfieran
   */
  const prepareForEdit = useCallback(async () => {
    
    // Limpiar completamente el caché
    clearAllCache();
    
    // Esperar un poco para asegurar que se limpie
    await new Promise(resolve => setTimeout(resolve, 100));
    
  }, [clearAllCache]);

  /**
   * 🔥 FUNCIÓN ULTRA-AGRESIVA para casos extremos
   * Limpia TODO el caché Y fuerza el refresco de la página si es necesario
   */
  const nuclearReset = useCallback(async (quotationId: number) => {
    console.log(`💥 NUCLEAR RESET for quotation ID: ${quotationId}`);
    
    // Limpiar completamente React Query
    clearAllCache();
    
    // Limpiar también el localStorage de Zustand si existe
    try {
      if (typeof window !== 'undefined') {
        // Limpiar cualquier storage relacionado con cotizaciones
        const storageKeys = Object.keys(localStorage).filter(key => 
          key.includes('quotation') || 
          key.includes('coverage') || 
          key.includes('stepper')
        );
        
        storageKeys.forEach(key => {
          localStorage.removeItem(key);
          console.log(`🗑️ Removed localStorage key: ${key}`);
        });
      }
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
    }
    
    // Esperar más tiempo para asegurar limpieza completa
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log(`💥 NUCLEAR RESET COMPLETE`);
  }, [clearAllCache]);

  return {
    clearAllCache,
    clearCoverageCache,
    prepareForEdit,
    nuclearReset
  };
};
