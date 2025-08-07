"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Label } from "@/components/ui/label";
import FilterClient from "./FilterClient";
import { SelectSimple } from "@/components/shared/FormFieldSelectSimple";
import { useDynamicSelectOptions } from "@/presentation/client/hooks/useDynamicSelectOptions";
import { useQuotationStore } from "@/presentation/quotations/store/useQuotationStore";
import { ClienteFormValues, clienteSchema } from "../schema/ClientInfo.schema";
import { useClientSearch } from "../hooks/useClientSearch";

interface ClientInformationProps {
  onFormChange?: () => void;
}

export interface ClientInformationRef {
  saveToStore: () => void;
  validateAndSave: () => Promise<boolean>;
}

const ClientInformation = forwardRef<
  ClientInformationRef,
  ClientInformationProps
>(({ onFormChange }, ref) => {
  // Obtener datos del store principal de cotización
  const { cliente, setCliente } = useQuotationStore();
  // Obtener datos de búsqueda del filtro
  const { searchData, clientData } = useClientSearch();

  // Estados para los popovers
  const [openAgent, setOpenAgent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    trigger,
    getValues,
    watch,
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      clientChoosen: cliente?.clientChoosen || 0,
      identification: cliente?.identification || "",
      name: cliente?.name || "",
      contact: cliente?.contact || "",
      email: cliente?.email || "",
      address: cliente?.address || "",
      office: cliente?.office || "",
      agent: cliente?.agent || "",
      agentId: cliente?.agentId || 0,
      tipoPlan: cliente?.tipoPlan || 0,
    },
  });

  // Efecto para resetear el formulario cuando cambien los datos del store
  React.useEffect(() => {
    if (cliente) {
      reset({
        clientChoosen: cliente.clientChoosen,
        identification: cliente.identification,
        name: cliente.name,
        contact: cliente.contact,
        email: cliente.email,
        address: cliente.address,
        office: cliente.office,
        agent: cliente.agent,
        agentId: cliente.agentId || 0,
        tipoPlan: cliente.tipoPlan,
      });
    }
  }, [cliente, reset]);

  // Efecto para llenar el formulario con datos de búsqueda
  React.useEffect(() => {
    if (searchData) {
      // Llenar los campos que vienen del filtro de búsqueda
      setValue('identification', searchData.identificacion);
      setValue('tipoPlan', Number(searchData.tipoPoliza));
      setValue('clientChoosen', Number(searchData.subTipoPoliza));
    }
  }, [searchData, setValue]);

  // Efecto para llenar el nombre del cliente encontrado
  React.useEffect(() => {
    if (clientData?.NOMBRE_COMPLETO) {
      setValue('name', clientData.NOMBRE_COMPLETO);
    }
  }, [clientData, setValue]);

  const canal = watch("office"); // para obtener el valor seleccionado
  const { data: dynamicOptions, isLoading } = useDynamicSelectOptions(canal);

  // Función para guardar datos en el store
  const saveToStore = React.useCallback(() => {
    const formData = getValues();
    setCliente(formData);
  }, [getValues, setCliente]);

  // Función para validar y guardar
  const validateAndSave = React.useCallback(async () => {
    const isValid = await trigger();
    
    if (!isValid) {
      // Mostrar errores específicos para debug
      const currentErrors = errors;
      console.log("Errores de validación:", currentErrors);
      // alert(`Formulario inválido. Errores: ${Object.keys(currentErrors).join(", ")}`);
    } else {
    }
    
    if (isValid) {
      saveToStore();
      return true;
    }
    return false;
  }, [trigger, saveToStore, errors]);

  // Exponer las funciones al padre
  useImperativeHandle(ref, () => ({
    saveToStore,
    validateAndSave,
  }));

  const onSubmit = (data: ClienteFormValues) => {
    setCliente(data);
    alert("Datos guardados correctamente");
  };

  return (
    <div>
      <FilterClient />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-6  items-center  py-2">
          <div className="space-y-2 mb-2 flex flex-col justify-center">
            <Label htmlFor="identificacion">Nombre *</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="name"
                  placeholder="Nombre"
                  className={`py-5 ${errors.name ? "border-red-500" : ""}`}
                />
              )}
            />

            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2 mb-2 flex flex-col justify-center">
            <Label htmlFor="identificacion">Contacto *</Label>
            <Controller
              name="contact"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="contact"
                  placeholder="Contacto"
                  className={`py-5 ${errors.contact ? "border-red-500" : ""}`}
                />
              )}
            />

            {errors.contact && (
              <p className="text-sm text-red-500">{errors.contact.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6  items-center  py-2">
          <div className="space-y-2 mb-2 flex flex-col justify-center">
            <Label htmlFor="identificacion">Correo *</Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  type="email"
                  {...field}
                  id="email"
                  placeholder="Correo"
                  className={`py-5 ${errors.email ? "border-red-500" : ""}`}
                />
              )}
            />

            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2 mb-2 flex flex-col justify-center">
            <Label htmlFor="address">Dirección *</Label>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Input 
                  {...field} 
                  id="address" 
                  placeholder="Dirección"
                  className={`py-5 ${errors.address ? "border-red-500" : ""}`}
                />
              )}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6  items-center">
          <div className="space-y-2 flex flex-col justify-center">
            <Label htmlFor="office">Canal *</Label>
            <Controller
              name="office"
              control={control}
              render={({ field }) => (
                <SelectSimple
                  {...field}
                  id="office"
                  placeholder="Selecciona el canal"
                  options={[
                    { label: "Sucursales", value: "Sucursales" },
                    { label: "Intermediarios", value: "Intermediarios" },
                    { label: "Negocios", value: "Negocios" },
                  ]}
                  error={!!errors.office}
                  className="mt-1 h-10"
                />
              )}
            />
            {errors.office && (
              <p className="text-sm text-red-500">{errors.office.message}</p>
            )}
          </div>

          {/* Segundo Select dinámico */}
          <FormField
            control={control}
            name="agentId"
            render={({ field }) => {
              const selected = dynamicOptions.find(
                (item) => item.id === field.value
              );

              return (
                <FormItem className="flex flex-col ">
                  <FormLabel>Seleccione el agente *</FormLabel>
                  <Popover open={openAgent} onOpenChange={setOpenAgent}>
                    <PopoverTrigger asChild>
                      <FormControl className="py-5">
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openAgent}
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {selected ? `${selected.label}` : "Seleccionar..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Buscar..." />
                        <CommandList>
                          <CommandEmpty>
                            No se encontraron resultados.
                          </CommandEmpty>
                          <CommandGroup>
                            {dynamicOptions.map((item) => (
                              <CommandItem
                                key={item.id}
                                value={`${item.label}`}
                                onSelect={() => {
                                  field.onChange(item.id);
                                  // También actualizar el campo agent con el nombre
                                  setValue("agent", item.label);
                                  setOpenAgent(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    item.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {item.label}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                  {errors.agentId && (
                    <p className="text-sm text-red-500">{errors.agentId.message}</p>
                  )}
                </FormItem>
              );
            }}
          />

          {/* Campo oculto para agent */}
          <Controller
            name="agent"
            control={control}
            render={({ field }) => (
              <div>
                <input type="hidden" {...field} />
                {errors.agent && (
                  <p className="text-sm text-red-500">{errors.agent.message}</p>
                )}
              </div>
            )}
          />

          {/* Campos ocultos para identificación y tipo de plan */}
          <Controller
            name="identification"
            control={control}
            render={({ field }) => <input type="hidden" {...field} />}
          />
          <Controller
            name="tipoPlan"
            control={control}
            render={({ field }) => <input type="hidden" {...field} />}
          />
          <Controller
            name="clientChoosen"
            control={control}
            render={({ field }) => <input type="hidden" {...field} />}
          />
        </div>
      </form>
    </div>
  );
});

export default ClientInformation;
