"use client"
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FiltrarClientFormValues,
  filtrarClientSchema,
} from "../schema/filtrar-client.schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { DocumentTypeSelect } from "@/components/shared/DocumentTypeSelect";
import { IdentificationInput } from "@/components/shared/IdentificationInput";
import { useClientSearch } from "../hooks/useClientSearch";
import { ClientByIdentification } from "../services/client.services";
import { LoadingSpinner } from "@/components/shared/loading";
import { useQuotationStore } from "@/presentation/quotations/store/useQuotationStore";

const FilterClient = () => {
  const { setSearchData, setClientData } = useClientSearch();
  const { filterData } = useQuotationStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<FiltrarClientFormValues>({
    resolver: zodResolver(filtrarClientSchema),
    defaultValues: {
      tipoDocumento: "",
      identificacion: "",
    },
  });

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
      
      console.log('=== BÚSQUEDA DE CLIENTE ===');
      console.log('Datos del formulario:', data);
      console.log('Tipo documento (string):', data.tipoDocumento);
      console.log('Tipo documento (número):', tipoDocumentoNumber);
      console.log('Identificación:', data.identificacion);
      console.log('URL que se llamará:', `/users/${data.identificacion}/${tipoDocumentoNumber}`);

      // Guardar los datos de búsqueda para que los use ClientInformation
      const response = await ClientByIdentification(data.identificacion, tipoDocumentoNumber);

      console.log('Respuesta de la API:', response);
      setSearchData(data);
      
      // Guardar la información del cliente encontrado
      if (response) {
        setClientData(response);
        console.log('✅ Cliente encontrado:', response);
      } else {
        alert('Cliente no encontrado');
        setClientData(null);
        console.log('❌ Cliente no encontrado');
      }
    } catch (error) {
      console.error('❌ Error al buscar cliente:', error);
      alert('Error al buscar cliente');
      setClientData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6 shadow-sm border border-border/50 bg-gradient-to-r from-[#005BBB]/5 to-[#FFA500]/5">
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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
                  placeholder="Ingrese la identificación"
                  error={!!errors.identificacion}
                  required
                />
              )}
            />

            {/* Botón de búsqueda */}
            <div className="flex justify-start">
              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 px-6 bg-[#005BBB] hover:bg-[#003E7E] text-white font-medium shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#005BBB] focus:ring-offset-2"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="w-4 h-4 mr-2" />
                    Buscando...
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
    </Card>
  );
};

export default FilterClient;
