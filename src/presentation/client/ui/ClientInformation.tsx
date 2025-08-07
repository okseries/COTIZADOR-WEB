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
import React, { forwardRef, use, useImperativeHandle, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  clienteSchema,
  ClienteFormValues,
} from "../../quotations/schema/quotatio-schema";
import useStepperStore from "../../quotations/store/useStepperStore";
import {
  mockAgents,
  mockClients,
  mockOffices,
  mockPlanTypes,
} from "../../quotations/ui/stepper/DataFicticio";
import { Label } from "@/components/ui/label";
import FilterClient from "./FilterClient";
import { SelectSimple } from "@/components/shared/FormFieldSelectSimple";
import {
  Intermediario,
  Promotor,
  Sucursal,
} from "@/presentation/helpers/auxs.service";
import { useDynamicSelectOptions } from "@/presentation/client/hooks/useDynamicSelectOptions";
import { useQuotationStore } from "@/presentation/quotations/store/useQuotationStore";

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
  const { clientData, setClientData } = useStepperStore();

  // Estados para los popovers
  const [openAgent, setOpenAgent] = useState(false);
  const [openOffice, setOpenOffice] = useState(false);
  const [openPlanType, setOpenPlanType] = useState(false);

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
      clientChoosen: 0,
      identification: "",
      name: "",
      contact: "",
      email: "",
      address: "",
      office: "",
      agent: "",
      tipoPlan: 0,
    },
  });
  const setCliente = useQuotationStore((state) => state.setCliente);

  const canal = watch("office"); // para obtener el valor seleccionado
  const { data: dynamicOptions, isLoading } = useDynamicSelectOptions(canal);

  // Función para guardar datos en el store
  const saveToStore = React.useCallback(() => {
    const formData = getValues(); // <-- usa getValues del hook actual
    setClientData(formData);
    setCliente(formData); // si también quieres guardarlo en `useQuotationStore`
  }, [setClientData, setCliente]);

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
    setClientData(data);
    setCliente({
      clientChoosen: data.clientChoosen,
      identification: data.identification,
      name: data.name,
      contact: data.contact,
      email: data.email,
      address: data.address,
      office: data.office,
      agent: data.agent,
      tipoPlan: data.tipoPlan,
    });
  };

  // const form = useForm<ClienteFormValues>({
  //   resolver: zodResolver(clienteSchema),
  //   mode: 'onChange',
  //   defaultValues: {
  //     clientChoosen: clientData.clientChoosen || 0,
  //     identification: clientData.identification || '',
  //     name: clientData.name || '',
  //     contact: clientData.contact || '',
  //     email: clientData.email || '',
  //     address: clientData.address || '',
  //     office: clientData.office || '',
  //     agent: clientData.agent || '',
  //     tipoPlan: clientData.tipoPlan || 0,
  //   }
  // });

  // // Auto-completar datos cuando se selecciona un cliente
  // const handleClientSelect = React.useCallback((clientId: number) => {
  //   if (clientId > 0) {
  //     const client = mockClients.find(c => c.id === clientId);
  //     if (client) {
  //       form.setValue('identification', client.identification);
  //       form.setValue('name', client.name);
  //       form.setValue('contact', client.contact);
  //       form.setValue('email', client.email);
  //       form.setValue('address', client.address);
  //     }
  //   }
  // }, [form]);

  // // Función para guardar datos en el store
  // const saveToStore = React.useCallback(() => {
  //   const formData = form.getValues();
  //   setClientData(formData);
  // }, [form, setClientData]);

  // // Función para validar y guardar
  // const validateAndSave = React.useCallback(async () => {
  //   const isValid = await form.trigger();
  //   if (isValid) {
  //     saveToStore();
  //     return true;
  //   }
  //   return false;
  // }, [form, saveToStore]);

  // // Exponer las funciones a través de ref
  // useImperativeHandle(ref, () => ({
  //   saveToStore,
  //   validateAndSave
  // }), [saveToStore, validateAndSave]);

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
            <Label htmlFor="identificacion">Dirección *</Label>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Input {...field} id="address" placeholder="Dirección" />
              )}
            />
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
          </div>

          {/* Segundo Select dinámico */}
          <FormField
            control={control}
            name="clientChoosen"
            render={({ field }) => {
              const selected = dynamicOptions.find(
                (item) => item.id === field.value
              );

              return (
                <FormItem className="flex flex-col ">
                  <FormLabel>Seleccione el agente</FormLabel>
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
                          {/* {selected
                            ? `${selected.label} - ${selected.subLabel ?? ""}`
                            : "Seleccionar..."} */}

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
                                // value={`${item.label} ${item.subLabel ?? ""}`}
                                value={`${item.label}?? ""}`}
                                onSelect={() => {
                                  field.onChange(item.id);
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
                                  {/* {item.subLabel && (
                                    <span className="text-sm text-muted-foreground">
                                      {item.subLabel}
                                    </span>
                                  )} */}
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
      </form>
    </div>
  );
});

export default ClientInformation;
