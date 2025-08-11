"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
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
import { formatPhone } from "../helpers/formatPhone";

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
>((_props, ref) => {
  // Obtener datos del store principal de cotización
  const {
    cliente,
    setCliente,
    filterData,
    setFilterData,
    agentOptions,
    setAgentOptions,
  } = useQuotationStore();
  // Obtener datos de búsqueda del filtro (solo para tipo documento e identificación)
  const { searchData, clientData } = useClientSearch();

  // Estados para los popovers
  const [openAgent, setOpenAgent] = useState(false);
  const [searchAgent, setSearchAgent] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    trigger,
    getValues,
    watch,
    setError,
    clearErrors,
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    mode: "onChange", // Habilitar validación en tiempo real
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

  // Función para guardar datos en el store
  const saveToStore = React.useCallback(() => {
    const formData = getValues();
    setCliente(formData);
  }, [getValues, setCliente]);

  // Efecto para resetear el formulario cuando cambien los datos del store
  React.useEffect(() => {
    if (cliente) {
      const nameToUse = clientData?.NOMBRE_COMPLETO || cliente.name;

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

  // Efecto separado para resetear cuando se limpia el store
  React.useEffect(() => {
    if (!cliente) {
      reset({
        clientChoosen: 0,
        identification: "",
        name: "",
        contact: "",
        email: "",
        address: "",
        office: "",
        agent: "",
        agentId: 0,
        tipoPlan: 0,
      });
    }
  }, [cliente, reset]);

  // Efecto para llenar el formulario con datos de búsqueda (solo identificación)
  React.useEffect(() => {
    if (searchData) {
      setValue("identification", searchData.identificacion);

      if (
        !filterData ||
        filterData.tipoDocumento !== searchData.tipoDocumento ||
        filterData.identificacion !== searchData.identificacion
      ) {
        setFilterData({
          tipoDocumento: searchData.tipoDocumento,
          identificacion: searchData.identificacion,
        });
      }
    }
  }, [searchData, setValue, setFilterData, filterData]);

  // Efecto para llenar el nombre del cliente encontrado
  React.useEffect(() => {
    if (clientData?.NOMBRE_COMPLETO) {
      setValue("name", clientData.NOMBRE_COMPLETO);
      setTimeout(() => {
        saveToStore();
      }, 100);
    }
  }, [clientData, setValue, saveToStore]);

  const canal = watch("office");
  const { data: dynamicOptions = [] } = useDynamicSelectOptions(canal);
  const { data: plans } = usePlans();
  const { data: subPlans } = useSubPlansType();

  // Función para filtrar agentes de manera más precisa
  const filteredAgents = React.useMemo(() => {
    if (!searchAgent.trim()) return dynamicOptions;
    
    const searchTerm = searchAgent.toLowerCase().trim();
    
    return dynamicOptions.filter((item) => {
      const label = item.label.toLowerCase();
      const subLabel = (item.subLabel || '').toLowerCase();
      
      // Búsqueda exacta al inicio
      if (label.startsWith(searchTerm) || subLabel.startsWith(searchTerm)) {
        return true;
      }
      
      // Búsqueda por palabras individuales
      const labelWords = label.split(' ');
      const searchWords = searchTerm.split(' ');
      
      const wordsMatch = searchWords.every(searchWord => 
        labelWords.some(labelWord => labelWord.startsWith(searchWord))
      );
      
      if (wordsMatch) return true;
      
      // Búsqueda por iniciales
      const initials = labelWords.map(word => word.charAt(0)).join('');
      if (initials.includes(searchTerm)) return true;
      
      // Búsqueda parcial en cualquier parte
      return label.includes(searchTerm) || subLabel.includes(searchTerm);
    }).sort((a, b) => {
      const aLabel = a.label.toLowerCase();
      const bLabel = b.label.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      // Priorizar coincidencias exactas al inicio
      const aStartsWith = aLabel.startsWith(searchLower) ? 0 : 1;
      const bStartsWith = bLabel.startsWith(searchLower) ? 0 : 1;
      
      if (aStartsWith !== bStartsWith) {
        return aStartsWith - bStartsWith;
      }
      
      // Luego ordenar alfabéticamente
      return aLabel.localeCompare(bLabel);
    });
  }, [dynamicOptions, searchAgent]);

  // Efecto para limpiar la búsqueda cuando se cierre el popover
  React.useEffect(() => {
    if (!openAgent) {
      setSearchAgent("");
    }
  }, [openAgent]);

  // Efecto para guardar las opciones de agente en el store
  React.useEffect(() => {
    if (
      dynamicOptions &&
      dynamicOptions.length > 0 &&
      JSON.stringify(agentOptions) !== JSON.stringify(dynamicOptions)
    ) {
      setAgentOptions(dynamicOptions);
    }
  }, [dynamicOptions, setAgentOptions, agentOptions]);

  // Efecto para guardar automáticamente cuando cambien los campos importantes
  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (
        name === "tipoPlan" ||
        name === "clientChoosen" ||
        name === "identification"
      ) {
        saveToStore();
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, saveToStore]);

  // Función para validar y guardar
  const validateAndSave = React.useCallback(async () => {
    const isValid = await trigger();
    if (isValid) {
      saveToStore();
      return true;
    }
    return false;
  }, [trigger, saveToStore]);

  // Exponer las funciones al padre
  useImperativeHandle(ref, () => ({
    saveToStore,
    validateAndSave,
  }));

  const onSubmit = (data: ClienteFormValues) => {
    setCliente(data);
  };

  return (
    <div className="space-y-6">
      <FilterClient />

      {/* Información del Cliente */}
      <Card className="shadow-sm border border-border/50">
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Información básica del cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo *</Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="name"
                      placeholder="Ingrese el nombre completo"
                      className={`h-11  ${clientData?.NOMBRE_COMPLETO ? " text-green-500" : ""} ${errors.name ? "border-red-500" : ""}`}
                      readOnly={!!clientData?.NOMBRE_COMPLETO}
                    />
                  )}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Teléfono de contacto *</Label>
                <Controller
                  name="contact"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="contact"
                      value={field.value || ""}
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value);
                        field.onChange(formatted);
                        
                        // Validación en tiempo real
                        if (formatted && formatted.length >= 12) {
                          const phoneWithoutFormat = formatted.replace(/\D/g, '');
                          const prefix = phoneWithoutFormat.slice(0, 3);
                          
                          if (!['849', '829', '808'].includes(prefix)) {
                            setError('contact', {
                              type: 'manual',
                              message: 'El teléfono debe comenzar con 849, 829 u 808'
                            });
                          } else {
                            clearErrors('contact');
                          }
                        } else if (formatted && formatted.length > 0) {
                          clearErrors('contact');
                        }
                      }}
                      placeholder="Ingrese el número de teléfono"
                      className={`h-11 ${
                        errors.contact ? "border-red-500" : ""
                      }`}
                    />
                  )}
                />
                {errors.contact && (
                  <p className="text-sm text-red-500">
                    {errors.contact.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico *</Label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="email"
                      {...field}
                      id="email"
                      placeholder="ejemplo@correo.com"
                      className={`h-11 ${errors.email ? "border-red-500" : ""}`}
                    />
                  )}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="address"
                      placeholder="Dirección completa"
                      className={`h-11 ${
                        errors.address ? "border-red-500" : ""
                      }`}
                    />
                  )}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">
                    {errors.address.message}
                  </p>
                )}
              </div>
            </div>

            <div className=" w-full border-[0.5px] border-border/30"></div>

            {/* Tipo de póliza y sub tipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoPlan">Tipo de póliza *</Label>
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
                {errors.tipoPlan && (
                  <p className="text-sm text-red-500">
                    {errors.tipoPlan.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientChoosen">Sub tipo de póliza *</Label>
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
                {errors.clientChoosen && (
                  <p className="text-sm text-red-500">
                    {errors.clientChoosen.message}
                  </p>
                )}
              </div>
            </div>

            {/* Canal y Agente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
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
                      className="h-11"
                    />
                  )}
                />
                {errors.office && (
                  <p className="text-sm text-red-500">
                    {errors.office.message}
                  </p>
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
                      <FormLabel>Agente *</FormLabel>
                      <Popover open={openAgent} onOpenChange={setOpenAgent}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openAgent}
                              className={cn(
                                "w-full justify-between h-11",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {selected
                                ? `${selected.label}`
                                : "Seleccionar agente..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command shouldFilter={false}>
                            <CommandInput 
                              placeholder="Buscar agente..." 
                              value={searchAgent}
                              onValueChange={setSearchAgent}
                            />
                            <CommandList>
                              <CommandEmpty>
                                No se encontraron resultados.
                              </CommandEmpty>
                              <CommandGroup>
                                {filteredAgents.map((item) => (
                                  <CommandItem
                                    key={item.id}
                                    value={`${item.label}`}
                                    onSelect={() => {
                                      field.onChange(item.id);
                                      setValue("agent", item.label);
                                      setOpenAgent(false);
                                      setSearchAgent(""); // Limpiar búsqueda al seleccionar
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
                                      <span className="font-medium">{item.label}</span>
                                      {item.subLabel && (
                                        <span className="text-xs text-muted-foreground">
                                          {item.subLabel}
                                        </span>
                                      )}
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
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

ClientInformation.displayName = "ClientInformation";

export default ClientInformation;
