import { useIntermediarios, usePromotores, useSucursales } from "@/presentation/helpers/hooks/useAuxiliares";
import { mapIntermediarios, mapPromotores, mapSucursales } from "../mapper/client.mappers";


export const useDynamicSelectOptions = (canal: string | undefined) => {
  const intermediariosQuery = useIntermediarios();
  const promotoresQuery = usePromotores();
  const sucursalesQuery = useSucursales();

  if (canal === "Intermediarios")
    return {
      data: mapIntermediarios(intermediariosQuery.data ?? []),
      isLoading: intermediariosQuery.isLoading,
    };

  if (canal === "Negocios")
    return {
      data: mapPromotores(promotoresQuery.data ?? []),
      isLoading: promotoresQuery.isLoading,
    };

  if (canal === "Sucursales")
    return {
      data: mapSucursales(sucursalesQuery.data ?? []),
      isLoading: sucursalesQuery.isLoading,
    };

  return {
    data: [],
    isLoading: false,
  };
};
