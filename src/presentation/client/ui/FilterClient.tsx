"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FiltrarClientFormValues,
  filtrarClientSchema,
} from "../schema/filtrar-client.schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Search, Trash2 } from "lucide-react";
import { DocumentTypeSelect } from "@/components/shared/DocumentTypeSelect";
import { useClientSearchAdapter } from "../hooks/useClientSearchAdapter";
import { ClientByIdentification } from "../services/client.services";
import { Spinner } from "@/components/shared/Spinner";
import { useUnifiedQuotationStore } from "@/core";
import { IdentificationInput } from "./IdentificationInput";
import { getCleanIdentification } from "../helpers/indentification-format";
import ThemedAlertDialog from "@/components/shared/ThemedAlertDialog";

interface FilterClientProps {
  onClearForm?: () => void;
}

const FilterClient = ({ onClearForm }: FilterClientProps) => {
  const { setSearchData, setClientData, clientData } = useClientSearchAdapter();
  const { filterData, clearQuotation, clearCurrentForm, cliente, setFilterData, mode } = useUnifiedQuotationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [alertDialogMessage, setAlertDialogMessage] = useState("");
  const [alertDialogTitle, setAlertDialogTitle] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    watch,
  } = useForm<FiltrarClientFormValues>({
    resolver: zodResolver(filtrarClientSchema),
    defaultValues: {
      tipoDocumento: filterData?.tipoDocumento || "1",
      identificacion: filterData?.identificacion || "",
    },
  });

  // Observar el tipo de documento para pasarlo al input de identificación
  const tipoDocumento = watch("tipoDocumento");
  const identificacion = watch("identificacion");

  // Verificar si el cliente ya tiene información completa
  const hasCompleteClientInfo = cliente && cliente.name && cliente.name.length > 0;

  // Verificar si hay identificación pero no se ha buscado cliente
  // Solo mostrar el mensaje si:
  // 1. Hay identificación ingresada
  // 2. NO hay datos del cliente desde la búsqueda
  // 3. NO hay información completa del cliente en el store
  // 4. NO está cargando
  const hasIdentificationButNotSearched = 
    identificacion && 
    identificacion.length > 0 && 
    !clientData && 
    !hasCompleteClientInfo && 
    !isLoading;

  // Función para limpiar todo (modo editar)
  const handleClearAll = React.useCallback(() => {
    clearQuotation();
    reset({
      tipoDocumento: "1",
      identificacion: "",
    });
    setClientData(null);
    setSearchData({
      tipoDocumento: "1",
      identificacion: "",
    });
    // Llamar al callback para resetear el formulario principal
    onClearForm?.();
  }, [clearQuotation, reset, setClientData, setSearchData, onClearForm]);

  // Función para limpiar solo el formulario actual (modo crear)
  const handleClearForm = React.useCallback(() => {
    clearCurrentForm();
    reset({
      tipoDocumento: "1",
      identificacion: "",
    });
    setClientData(null);
    setSearchData({
      tipoDocumento: "1",
      identificacion: "",
    });
    // Llamar al callback para resetear el formulario principal
    onClearForm?.();
  }, [clearCurrentForm, reset, setClientData, setSearchData, onClearForm]);

  // Manejar tecla ESC para cerrar el alert dialog
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && openAlertDialog) {
        setOpenAlertDialog(false);
      }
    };

    if (openAlertDialog) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openAlertDialog]);

  // Efecto principal para sincronizar formulario con store
  React.useEffect(() => {
    if (filterData) {
      const currentValues = getValues();

      // Solo actualizar si los valores son diferentes para evitar bucle infinito
      if (
        currentValues.tipoDocumento !== filterData.tipoDocumento ||
        currentValues.identificacion !== filterData.identificacion
      ) {
        reset({
          tipoDocumento: filterData.tipoDocumento,
          identificacion: filterData.identificacion,
        });
      }
    }
  }, [filterData, reset, getValues]);

  // Efecto adicional para sincronizar identificación desde el cliente cuando no hay filterData
  React.useEffect(() => {
    if (cliente && cliente.identification && !filterData) {
      const currentValues = getValues();
      
      // Solo actualizar si la identificación es diferente
      if (currentValues.identificacion !== cliente.identification) {
        // Detectar el tipo de documento correcto basado en la identificación
        const detectDocumentType = (identification: string): "1" | "2" | "3" => {
          if (!identification) return "1";
          
          const cleanId = identification.replace(/\D/g, "");
          
          // Si tiene exactamente 11 dígitos numéricos, es cédula
          if (cleanId.length === 11 && /^\d{11}$/.test(cleanId)) {
            return "1";
          }
          
          // Si tiene exactamente 9 dígitos numéricos, es RNC
          if (cleanId.length === 9 && /^\d{9}$/.test(cleanId)) {
            return "3";
          }
          
          // Si contiene letras o no coincide con los formatos anteriores, es pasaporte
          if (/[A-Za-z]/.test(identification) || (cleanId.length !== 11 && cleanId.length !== 9)) {
            return "2";
          }
          
          // Por defecto, asumir cédula
          return "1";
        };

        const detectedType = detectDocumentType(cliente.identification);
        
        const syncData = {
          tipoDocumento: detectedType,
          identificacion: cliente.identification,
        };
        
        reset({
          tipoDocumento: detectedType,
          identificacion: cliente.identification,
        });
        setFilterData(syncData);
      }
    }
  }, [cliente, filterData, reset, getValues, setFilterData]);

  const onSubmit = React.useCallback(async (data: FiltrarClientFormValues) => {
    setIsLoading(true);
    try {
      // Convertir el tipo de documento a número para la API
      const tipoDocumentoNumber = parseInt(data.tipoDocumento);

      // Obtener identificación limpia (sin formato) para la API
      const cleanIdentification = getCleanIdentification(
        data.tipoDocumento as "1" | "2" | "3",
        data.identificacion
      );

      // Guardar los datos de búsqueda para que los use ClientInformation
      const response = await ClientByIdentification(
        cleanIdentification,
        tipoDocumentoNumber
      );

      setSearchData(data);
      
      // Asegurar que setFilterData se llame para preservar el tipo de documento
      setFilterData({
        tipoDocumento: data.tipoDocumento as "1" | "2" | "3",
        identificacion: data.identificacion,
      });

      // Guardar la información del cliente encontrado
      if (response) {
        setClientData(response);
      } else {
        setAlertDialogTitle("Sin Resultados");
        setAlertDialogMessage(
          `No se encontraron datos con la información proporcionada, vuelva a intentarlo.`
        );
        setOpenAlertDialog(true);
        setClientData(null);
      }
    } catch (error) {
      console.error("❌ Error al buscar cliente:", error);
      setClientData(null);
    } finally {
      setIsLoading(false);
    }
  }, [setSearchData, setClientData, setFilterData]);

  return (
    <Card className="mb-2 py-4 shadow-sm border border-border/50 bg-gradient-to-r from-[#005BBB]/5 to-[#FFA500]/5">
      <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="w-full sm:w-auto">
          <Button
            onClick={mode === "create" ? handleClearForm : handleClearAll}
            className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto"
            variant="outline"
            size="sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {mode === "create" ? "Limpiar Campos" : "Eliminar Todo"}
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          {/* Mensaje informativo cuando hay identificación pero no se ha buscado */}
          {hasIdentificationButNotSearched &&  (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-700">
                  Para continuar, presione Buscar Cliente.
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-end gap-3 w-full">
            {/* Tipo de Documento */}
            <div className="w-full sm:w-36">
              <Controller
                name="tipoDocumento"
                control={control}
                render={({ field }) => (
                  <DocumentTypeSelect
                    {...field}
                    placeholder="Selecciona tipo"
                    error={!!errors.tipoDocumento}
                    className="w-full"
                  />
                )}
              />
            </div>

            {/* Identificación */}
            <div className="flex-1 min-w-0 lg:max-w-lg">
              <Controller
                name="identificacion"
                control={control}
                render={({ field }) => (
                  <IdentificationInput
                    {...field}
                    id="identificacion"
                    label="Identificación"
                    error={!!errors.identificacion}
                    required
                    tipoDocumento={tipoDocumento as "1" | "2" | "3"}
                  />
                )}
              />
            </div>

            {/* Botón de búsqueda */}
            <div className="w-full sm:w-auto">
              <Button
                type="submit"
                disabled={isLoading}
                className={`h-10 px-4 font-medium shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 w-full sm:w-auto ${
                  hasIdentificationButNotSearched 
                    ? "bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-600 animate-pulse" 
                    : "bg-[#005BBB] hover:bg-[#003E7E] text-white focus:ring-[#005BBB]"
                }`}
              >
                {isLoading ? (
                  <Spinner className="text-white w-4 h-4 mr-2" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                {hasIdentificationButNotSearched ? "¡Buscar Cliente!" : "Buscar Cliente"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
      {openAlertDialog && (
        <ThemedAlertDialog
          onClose={() => setOpenAlertDialog(false)}
          open={openAlertDialog}
          title={alertDialogTitle}
          message={alertDialogMessage}
          icon={<AlertCircle className="h-6 w-6 text-[#FFA500]" />}
          type="error"
          actionLabel="Continuar"
          onAction={() => setOpenAlertDialog(false)}
        />
      )}
    </Card>
  );
};

export default FilterClient;
