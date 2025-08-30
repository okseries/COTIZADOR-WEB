/**
 * Funciones de utilidad para handlers
 */

/**
 * Actualiza selecciones considerando el tipo de cliente (individual vs colectivo)
 */
export const updateSelectionsForClientType = <T>(
  currentSelections: Record<string, T>,
  planName: string,
  newValue: T,
  isCollective: boolean,
  allPlans: Array<{ plan: string }>
): Record<string, T> => {
  const newSelections = { ...currentSelections };
  
  if (isCollective) {
    // Colectivo: solo actualizar el plan específico
    newSelections[planName] = newValue;
  } else {
    // Individual: aplicar a todos los planes
    allPlans.forEach(plan => {
      newSelections[plan.plan] = newValue;
    });
  }
  
  return newSelections;
};

/**
 * Actualiza los planes en el store según el tipo de cliente
 */
export const updatePlansInStore = (
  planName: string,
  odontologiaValue: string,
  isCollective: boolean,
  allPlans: Array<{ plan: string }>,
  planSelections: Record<string, Record<string, string>>,
  updateFunction: (planName: string, value: string) => void
): void => {
  if (isCollective) {
    updateFunction(planName, odontologiaValue);
  } else {
    allPlans.forEach(plan => {
      const planOdontologiaValue = planSelections[plan.plan]?.odontologia || "0";
      updateFunction(plan.plan, planOdontologiaValue);
    });
  }
};
