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
import { useClientSearch } from "../hooks/useClientSearch";
import { ClientByIdentification } from "../services/client.services";
import { Spinner } from "@/components/shared/Spinner";
import { useQuotationStore } from "@/presentation/quotations/store/useQuotationStore";
import { IdentificationInput } from "./IdentificationInput";
import { getCleanIdentification } from "../helpers/indentification-format";
import ThemedAlertDialog from "@/components/shared/ThemedAlertDialog";

const FilterClient = () => {
  const { setSearchData, setClientData } = useClientSearch();
  const { filterData, clearQuotation } = useQuotationStore();
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
      tipoDocumento: "1",
      identificacion: "",
    },
  });

  // Observar el tipo de documento para pasarlo al input de identificación
  const tipoDocumento = watch("tipoDocumento");

  // Función mejorada para limpiar todo
  const handleClearAll = () => {
    clearQuotation();
    reset({
      tipoDocumento: "1",
      identificacion: "",
    });
    setClientData(null);
    // Corregir el tipo - usar valores por defecto en lugar de null
    setSearchData({
      tipoDocumento: "1",
      identificacion: "",
    });
  };

  // Manejar tecla ESC para cerrar el alert dialog
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && openAlertDialog) {
        setOpenAlertDialog(false);
      }
    };

    if (openAlertDialog) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openAlertDialog]);

  // Efecto para cargar datos del store en el formulario (solo campos del filtro real)
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

  const onSubmit = async (data: FiltrarClientFormValues) => {
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

      console.log("Respuesta de la API:", response);
      setSearchData(data);

      // Guardar la información del cliente encontrado
      if (response) {
        setClientData(response);
        console.log("✅ Cliente encontrado:", response);
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
  };

  return (
    <Card className="mb-2 py-4 shadow-sm border border-border/50 bg-gradient-to-r from-[#005BBB]/5 to-[#FFA500]/5">
      <CardContent className="flex flex-row items-center justify-between">
        <div>
          <Button 
            onClick={handleClearAll} 
            className="bg-red-500 hover:bg-red-600 text-white" 
            variant="outline"
            size="sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpiar Todo
          </Button>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="flex flex-col md:flex-row items-end justify-end  gap-4">
            {/* Tipo de Documento */}
            <Controller
              name="tipoDocumento"
              control={control}
              render={({ field }) => (
                <DocumentTypeSelect
                  {...field}
                  label="Tipo de documento"
                  placeholder="Selecciona tipo"
                  error={!!errors.tipoDocumento}
                  required
                />
              )}
            />

            {/* Identificación */}
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

            {/* Botón de búsqueda */}
            <div className="flex justify-start">
              <Button
                type="submit"
                disabled={isLoading}
                className="h-10.5 px-6 bg-[#005BBB] hover:bg-[#003E7E] text-white font-medium shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#005BBB] focus:ring-offset-2"
              >
                {isLoading ? (
                  <>
                    <Spinner  className="text-white w-4 h-4 mr-2" />
                    Buscar Cliente
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar Cliente
                  </>
                )}
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
