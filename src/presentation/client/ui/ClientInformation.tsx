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
import { usePlans, useSubPlansType } from "@/presentation/plans/hooks/usePlans";

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
  const { cliente, setCliente, filterData, setFilterData, agentOptions, setAgentOptions } = useQuotationStore();
  // Obtener datos de búsqueda del filtro (solo para tipo documento e identificación)
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
      // Si hay clientData disponible, usar ese nombre en lugar del del store
      const nameToUse = clientData?.NOMBRE_COMPLETO || cliente.name;
      
      console.log('=== RESET FORMULARIO ===');
      console.log('cliente.name:', cliente.name);
      console.log('clientData?.NOMBRE_COMPLETO:', clientData?.NOMBRE_COMPLETO);
      console.log('nameToUse:', nameToUse);
      
      reset({
        clientChoosen: cliente.clientChoosen,
        identification: cliente.identification,
        name: nameToUse,
        contact: cliente.contact,
        email: cliente.email,
        address: cliente.address,
        office: cliente.office,
        agent: cliente.agent,
        agentId: cliente.agentId || 0,
        tipoPlan: cliente.tipoPlan,
      });
    }
  }, [cliente, reset, clientData]);

  // Efecto para llenar el formulario con datos de búsqueda (solo identificación)
  React.useEffect(() => {
    if (searchData) {
      // Solo llenar la identificación desde el filtro
      setValue('identification', searchData.identificacion);
      
      // Guardar los datos del filtro para persistencia
      if (!filterData || 
          filterData.tipoDocumento !== searchData.tipoDocumento ||
          filterData.identificacion !== searchData.identificacion) {
        setFilterData({
          tipoDocumento: searchData.tipoDocumento,
          identificacion: searchData.identificacion
        });
      }
    }
  }, [searchData, setValue, setFilterData, filterData]);

  const canal = watch("office"); // para obtener el valor seleccionado
  const { data: dynamicOptions, isLoading } = useDynamicSelectOptions(canal);
  
  // Obtener opciones de planes
  const { data: plans } = usePlans();
  const { data: subPlans } = useSubPlansType();

  // Efecto para guardar las opciones de agente en el store
  React.useEffect(() => {
    if (dynamicOptions && dynamicOptions.length > 0 && JSON.stringify(agentOptions) !== JSON.stringify(dynamicOptions)) {
      setAgentOptions(dynamicOptions);
    }
  }, [dynamicOptions, setAgentOptions, agentOptions]);

  // Función para guardar datos en el store
  const saveToStore = React.useCallback(() => {
    const formData = getValues();
    setCliente(formData);
  }, [getValues, setCliente]);

  // Efecto para llenar el nombre del cliente encontrado
  React.useEffect(() => {
    console.log('=== EFECTO NOMBRE CLIENTE ===');
    console.log('clientData:', clientData);
    console.log('clientData?.NOMBRE_COMPLETO:', clientData?.NOMBRE_COMPLETO);
    
    if (clientData?.NOMBRE_COMPLETO) {
      console.log('✅ Llenando campo nombre con:', clientData.NOMBRE_COMPLETO);
      setValue('name', clientData.NOMBRE_COMPLETO);
      
      // También disparar auto-save para persistir el nombre en el store
      setTimeout(() => {
        const currentValue = getValues('name');
        console.log('✅ Valor actual del campo nombre después del setValue:', currentValue);
        saveToStore(); // Auto-guardar para persistir el nombre
      }, 100);
    } else {
      console.log('❌ No hay NOMBRE_COMPLETO disponible');
    }
  }, [clientData, setValue, getValues, saveToStore]);

  // Efecto para guardar automáticamente cuando cambien los campos importantes
  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      // Auto-guardar cuando cambien campos importantes
      if (name === 'tipoPlan' || name === 'clientChoosen' || name === 'identification') {
        saveToStore();
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, saveToStore]);

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
    <div className="space-y-6">
      <FilterClient />
      
      {/* Información del Cliente */}
      <Card className="shadow-sm border border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-[#005BBB]">
            Información del Cliente
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Complete la información requerida para el cliente
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Campos de tipo de póliza y sub tipo - fundamentales para la cotización */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="tipoPlan" className="text-sm font-medium text-foreground">
                {errors.tipoPlan ? (
                  <span className="text-destructive">{errors.tipoPlan.message}</span>
                ) : (
                  "Tipo de póliza *"
                )}
              </Label>
              <Controller
                name="tipoPlan"
                control={control}
                render={({ field }) => (
                  <SelectSimple
                    {...field}
                    id="tipoPlan"
                    placeholder="Selecciona tipo de póliza"
                    value={String(field.value || "")}
                    onChange={(value) => field.onChange(Number(value))}
                    options={
                      plans?.map((plan) => ({
                        label: plan.tipoPlanName,
                        value: String(plan.id),
                      })) || []
                    }
                    error={!!errors.tipoPlan}
                    className="h-11"
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientChoosen" className="text-sm font-medium text-foreground">
                {errors.clientChoosen ? (
                  <span className="text-destructive">{errors.clientChoosen.message}</span>
                ) : (
                  "Sub tipo de póliza *"
                )}
              </Label>
              <Controller
                name="clientChoosen"
                control={control}
                render={({ field }) => (
                  <SelectSimple
                    {...field}
                    id="clientChoosen"
                    placeholder="Selecciona sub tipo"
                    value={String(field.value || "")}
                    onChange={(value) => field.onChange(Number(value))}
                    options={
                      subPlans?.map((plan) => ({
                        label: plan.nameCotizante,
                        value: String(plan.id),
                      })) || []
                    }
                    error={!!errors.clientChoosen}
                    className="h-11"
                  />
                )}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-6 items-center py-2">
              <div className="space-y-2 mb-2 flex flex-col justify-center">
                <Label htmlFor="name">Nombre *</Label>
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
                <Label htmlFor="contact">Contacto *</Label>
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

            <div className="grid grid-cols-2 gap-6 items-center py-2">
              <div className="space-y-2 mb-2 flex flex-col justify-center">
                <Label htmlFor="email">Correo *</Label>
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

            <div className="grid grid-cols-2 gap-6 items-center">
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

              <FormField
                control={control}
                name="agentId"
                render={({ field }) => {
                  const selected = dynamicOptions.find(
                    (item) => item.id === field.value
                  );

                  return (
                    <FormItem className="flex flex-col">
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
            </div>

            {/* Campos ocultos */}
            <div className="hidden">
              <Controller
                name="agent"
                control={control}
                render={({ field }) => <input type="hidden" {...field} />}
              />
              <Controller
                name="identification"
                control={control}
                render={({ field }) => <input type="hidden" {...field} />}
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
});

export default ClientInformation;
