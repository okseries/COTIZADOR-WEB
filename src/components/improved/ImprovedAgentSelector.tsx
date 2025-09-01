import React, { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, ChevronsUpDown, Search, X, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentOption {
  id: number;
  label: string;
  subLabel?: string;
  region?: string;
  isActive?: boolean;
}

interface ImprovedAgentSelectorProps {
  value: number;
  onValueChange: (agentId: number, agentName: string) => void;
  options: AgentOption[];
  isLoading?: boolean;
  error?: string;
  placeholder?: string;
  required?: boolean;
}

/* 🔹 Agente individual */
const AgentItem = ({
  agent,
  selected,
  onSelect,
}: {
  agent: AgentOption;
  selected: boolean;
  onSelect: (a: AgentOption) => void;
}) => (
  <div
    role="option"
    aria-selected={selected}
    onClick={() => onSelect(agent)}
    className={cn(
      "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all",
      selected
        ? "bg-blue-50 border border-blue-200"
        : "hover:bg-gray-50 border border-transparent"
    )}
  >
    <div className="flex flex-col">
      <span className="font-medium text-gray-900 text-sm">{agent.label}</span>
      {agent.subLabel && (
        <span className="text-xs text-gray-500 truncate">{agent.subLabel}</span>
      )}
    </div>
    {selected && <Check className="w-4 h-4 text-blue-600" />}
  </div>
);

/* 🔹 Lista con buscador */
const AgentList = ({
  options,
  searchTerm,
  setSearchTerm,
  isLoading,
  value,
  onSelect,
  isMobile,
}: {
  options: AgentOption[];
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  isLoading: boolean;
  value: number;
  onSelect: (a: AgentOption) => void;
  isMobile: boolean;
}) => {
  const filteredAgents = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const search = searchTerm.toLowerCase().trim();

    return options.filter((agent) => {
      const name = agent.label.toLowerCase();
      const subtitle = (agent.subLabel || "").toLowerCase();
      const initials = name
        .split(" ")
        .map((w) => w[0])
        .join("");

      return (
        name.includes(search) ||
        subtitle.includes(search) ||
        initials.includes(search)
      );
    });
  }, [options, searchTerm]);

  return (
    <div className={cn("flex flex-col h-full")}>
      {/* 🔍 Caja de búsqueda */}
      <div className="relative mb-3 flex-shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar por nombre o iniciales..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-10 rounded-xl focus:ring-2 focus:ring-blue-500 my-2"
          autoFocus={!isMobile}
        />
        {searchTerm && (
          <button
            aria-label="Limpiar búsqueda"
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Lista o estados */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 text-sm">Cargando...</span>
          </div>
        ) : filteredAgents.length > 0 ? (
          <div role="listbox" className="space-y-1">
            {filteredAgents.map((agent) => (
              <AgentItem
                key={agent.id}
                agent={agent}
                selected={agent.id === value}
                onSelect={onSelect}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-500 py-8">
            <SearchX className="w-6 h-6 mb-2" />
            <p className="text-sm">
              {searchTerm
                ? "No se encontraron agentes"
                : "No hay agentes disponibles"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* 🔹 Componente principal */
export const ImprovedAgentSelector: React.FC<ImprovedAgentSelectorProps> = ({
  value,
  onValueChange,
  options = [],
  isLoading = false,
  error,
  placeholder = "Seleccionar agente...",
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedAgent = useMemo(
    () => options.find((agent) => agent.id === value),
    [options, value]
  );

  const handleSelect = useCallback(
    (agent: AgentOption) => {
      onValueChange(agent.id, agent.label);
      setOpen(false);
      setSearchTerm("");
    },
    [onValueChange]
  );

  return (
    <div >
      
      {/* 🔽 Botón de disparo */}
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full justify-between h-11  mt-0",
          !value && "text-muted-foreground",
          error && "border-red-500"
        )}
      >
        {selectedAgent ? (
          <div className="flex flex-col text-left truncate">
            <span className="font-medium">{selectedAgent.label}</span>
            {selectedAgent.subLabel && (
              <span className="text-xs text-gray-500">
                {selectedAgent.subLabel}
              </span>
            )}
          </div>
        ) : (
          <span>{placeholder}</span>
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
      </Button>
      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={cn(
            "w-full sm:max-w-lg sm:rounded-xl",
            "p-0", // Quitamos padding aquí, lo ponemos adentro
            "sm:h-auto",
            "h-full sm:h-[500px] py-4 my-4 flex flex-col"
          )}
        >
          {/* Header fijo */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-white sticky top-0 z-10">
            <DialogTitle className="text-lg">Seleccionar Agente</DialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Cerrar"
              onClick={() => setOpen(false)}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Contenido scrollable */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 bg-white">
            <AgentList
              options={options}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              isLoading={isLoading}
              value={value}
              onSelect={handleSelect}
              isMobile={true}
            />
          </div>
        </DialogContent>
      </Dialog>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
