"use client"
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FiltrarClientFormValues,
  filtrarClientSchema,
} from "../schema/filtrar-client.schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { SelectSimple } from "@/components/shared/FormFieldSelectSimple";
import { useClientSearch } from "../hooks/useClientSearch";
import { ClientByIdentification } from "../services/client.services";
import { LoadingSpinner } from "@/components/shared/loading";
import { useQuotationStore } from "@/presentation/quotations/store/useQuotationStore";

const FilterClientOld = () => {

  const { setSearchData, setClientData } = useClientSearch();
  const { filterData } = useQuotationStore();
  const [isLoading, setIsLoading] = useState( false);


  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<FiltrarClientFormValues>({
    resolver: zodResolver(filtrarClientSchema),
    defaultValues: {
      tipoDocumento: "1",
      identificacion: "",
    },
  });

  // Efecto para cargar datos del store en el formulario (solo campos del filtro real)
  React.useEffect(() => {
    if (filterData) {
      console.log('FilterClient: Cargando filterData desde store:', filterData);
      const currentValues = getValues();
      console.log('FilterClient: Valores actuales del formulario:', currentValues);
      
      // Solo actualizar si los valores son diferentes para evitar bucle infinito
      if (
        currentValues.tipoDocumento !== filterData.tipoDocumento ||
        currentValues.identificacion !== filterData.identificacion
      ) {
        console.log('FilterClient: Actualizando formulario con:', {
          tipoDocumento: filterData.tipoDocumento,
          identificacion: filterData.identificacion,
        });
        
        reset({
          tipoDocumento: filterData.tipoDocumento,
          identificacion: filterData.identificacion,
        });
      }
    }
  }, [filterData, reset, getValues]);

  const onSubmit = async  (data: FiltrarClientFormValues) => {
    setIsLoading(true);
    // Guardar los datos de búsqueda para que los use ClientInformation
    const response = await ClientByIdentification(data.identificacion, +data.tipoDocumento);

    setSearchData(data);
    
    // Guardar la información del cliente encontrado
    if (response) {
      setClientData(response);
      console.log('Cliente encontrado:', response);
      setIsLoading(false);

    } else {
      alert('Cliente no encontradoasfasfasfasfasfas');
      setClientData(null);
      console.log('Cliente no encontrado');
      setIsLoading(false);
    }
    
    // Aquí podrías hacer una llamada a la API para buscar el cliente
    // Si no se encuentra, ClientInformation usará estos datos para prellenar el formulario
    console.log('Datos de búsqueda:', data);
  };


  if (isLoading) {
    return <LoadingSpinner className="h-10 w-10 mx-auto mb-4 mt-10 text-[#005BBB]" />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* filtrar cliente - solo tipo documento e identificación */}
      <div className="grid grid-cols-4 gap-6 items-center py-2">
        <div className="space-y-2 flex flex-col justify-center">
          <Label htmlFor="tipoDocumento">
            {errors.tipoDocumento ? errors.tipoDocumento.message : "Tipo documento *"}
          </Label>
          <Controller
            name="tipoDocumento"
            control={control}
            render={({ field }) => (
              <SelectSimple
                {...field}
                id="tipoDocumento"
                placeholder="Selecciona tipo"
                options={[
                  { label: "Cédula", value: "CEDULA" },
                  { label: "Pasaporte", value: "PASAPORTE" },
                  { label: "RNC", value: "RNC" },
                ]}
                error={!!errors.tipoDocumento}
                className="py-5"
              />
            )}
          />
        </div>

        <div className="space-y-2 flex flex-col justify-center">
          <Label htmlFor="identificacion">
            {errors.identificacion ? errors.identificacion.message : "Identificación *"}
          </Label>
          <Controller
            name="identificacion"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="identificacion"
                placeholder="Identificación"
                className={`py-5 ${
                  errors.identificacion ? "border-red-500" : ""
                }`}
              />
            )}
          />
        </div>

        <div className="space-y-2 flex flex-col justify-center">
          {/* Label invisible para mantener la altura */}
          <Label className="invisible">Buscar</Label>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-[#005BBB] hover:bg-[#003E7E] text-white rounded-full h-10 w-10 flex items-center justify-center shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#005BBB] focus:ring-offset-2"
            aria-label="Buscar cliente"
          >
            {isLoading ? (
              <LoadingSpinner className="w-4 h-4" />
            ) : (
              <Search className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default FilterClientOld;