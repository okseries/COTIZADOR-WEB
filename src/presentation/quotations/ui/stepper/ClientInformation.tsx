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
import { clienteSchema, ClienteFormValues } from "../../schema/quotatio-schema";
import useStepperStore from "../../store/useStepperStore";
import {
  mockAgents,
  mockClients,
  mockOffices,
  mockPlanTypes,
} from "./DataFicticio";
import { Label } from "@/components/ui/label";
import FilterClient from "./FilterClient";

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
  const [openClient, setOpenClient] = useState(false);
  const [openOffice, setOpenOffice] = useState(false);
  const [openAgent, setOpenAgent] = useState(false);
  const [openPlanType, setOpenPlanType] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
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
      <FilterClient/>
      <form onSubmit={handleSubmit(() => {})}>
       
      </form>
    </div>
  );
});

ClientInformation.displayName = "ClientInformation";

export default ClientInformation;
