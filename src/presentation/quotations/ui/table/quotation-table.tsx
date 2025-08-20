import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Download,
  FileText,
  Edit,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Quotations } from "../../interface/quotation.interface";
import QuotationTableHeader from "./table-header";
import Link from "next/link";
import EmptyState from "./empty-table";
import { useRouter } from "next/navigation";
import { useQuotations } from "@/core";
import QuotationTableSkeleton from "./quotation-skeleton";
import { formatCurrency } from "@/presentation/helpers/FormattCurrency";

interface QuotationTableProps {
  data: Quotations[];
  isLoading?: boolean;
  onViewDetail?: (quotation: Quotations) => void;
}

export default function QuotationTable({
  data,
  isLoading = false,
}: QuotationTableProps) {
  const router = useRouter();
  const { editQuotation } = useQuotations();

  // Estados para búsqueda y paginación
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtrar datos por búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(
      (quotation) =>
        quotation.cotizacion.cliente.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        quotation.cotizacion.cliente.identification
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // Calcular datos paginados
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset página cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Función para generar páginas visibles en la paginación
  const getVisiblePages = () => {
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(currentPage - halfVisible, 1);
    const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  };

  const handleEditQuotation = (quotation: Quotations) => {
    // Convert the quotation data to the expected format
    const quotationRequest = {
      user: quotation.cotizacion.user,
      cliente: quotation.cotizacion.cliente,
      planes: quotation.cotizacion.planes.map((plane) => ({
        ...plane,
        afiliados: plane.afiliados.map((afiliado) => ({
          ...afiliado,
          subtotal: String(afiliado.subtotal), // Ensure subtotal is a string
        })),
        opcionales: plane.opcionales.map((opcional, index) => ({
          id: index + 1, // Generate a unique ID for each opcional
          nombre: opcional.nombre,
          descripcion: opcional.descripcion,
          prima: opcional.prima,
        })),
      })),
    };

    // Use the correct editQuotation method that sets mode and loads data
    editQuotation(Number(quotation.id), quotationRequest);
    
    // Navigate to the quotation form (Step 1) to edit
    router.push("/dashboard/cotizacion");
  };

  if (isLoading) {
    return <QuotationTableSkeleton />;
  }

  const onCreateNew = () => {
    router.push("/dashboard/cotizacion");
  };

  if (!data || data.length === 0) {
    return <EmptyState onCreateNew={onCreateNew} />;
  }


  return (
    <TooltipProvider>
      <div className="h-[600px]  sm:h-[600px] md:h-[600px] lg:h-[500px] xl:h-[600px] 2xl:h-[700px] flex flex-col space-y-4 ">
        {/* Barra de búsqueda */}
        <Card className=" bg-white  px-4 py-3 shadow-sm border border-border/50">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre del cliente"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            
          </div>
        </Card>

        {/* Tabla con scroll mejorado */}
        <Card className="px-4 shadow-lg border-0 bg-white flex-1 flex flex-col min-h-0">
          <QuotationTableHeader
            quantity={filteredData.length}
            onCreateNew={onCreateNew}
          />

          <CardContent className="p-0 flex-1 flex flex-col min-h-0">
            {/* Mobile list view (visible on small screens) */}
            <div className="block sm:hidden overflow-auto max-h-[calc(100vh-300px)] space-y-3 p-3">
              {paginatedData.map((q) => {
                const total = q.cotizacion.planes
                  .map((p) => Number(p.resumenPago.totalPagar))
                  .reduce((a, b) => a + b, 0);
                const fecha = new Date(q.fecha_creado);

                return (
                  <div
                    key={q.id}
                    className="bg-white border border-border/50 rounded-lg p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground truncate">
                          {q.cotizacion.cliente.name}
                        </div>
                        <div className="text-sm text-[#009590] truncate">
                          {q.cotizacion.cliente.email}
                        </div>
                      </div>
                      <div className="ml-3 text-right">
                        <div className="font-bold text-[#003E7E]">
                          {formatCurrency(total)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(fecha, "dd MMM yyyy")}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm text-[#009590]">
                        {q.cotizacion.cliente.agent} •{" "}
                        {q.cotizacion.cliente.office}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditQuotation(q)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Link
                          href={q.pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop/tablet view (hidden on small screens) */}
            <div className="hidden sm:block flex-1 overflow-auto max-h-[calc(100vh-300px)]">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-primary/20">
                    <TableHead className="w-[180px] font-semibold text-foreground">
                      CLIENTE
                    </TableHead>
                    <TableHead className="text-center font-semibold text-foreground">
                      TOTAL
                    </TableHead>
                    <TableHead className="text-center font-semibold text-foreground">
                      FECHA
                    </TableHead>
                    <TableHead className="text-center font-semibold text-foreground">
                      AGENTE
                    </TableHead>
                    <TableHead className="w-[120px] text-center font-semibold text-foreground">
                      ACCIONES
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((q) => {
                    const total = q.cotizacion.planes
                      .map((p) => Number(p.resumenPago.totalPagar))
                      .reduce((a, b) => a + b, 0);
                    const fecha = new Date(q.fecha_creado);

                    return (
                      <TableRow
                        key={q.id}
                        className="hover:bg-muted/30 border-b border-border/50 transition-colors"
                      >
                        <TableCell className="py-4">
                          <div className="flex flex-row gap-3 items-center">
                            <div className="flex-shrink-0">
                              <FileText className="w-6 h-6 text-[#008080]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-foreground truncate">
                                {q.cotizacion.cliente.name}
                              </div>
                              <div className="text-sm text-[#009590] truncate">
                                {q.cotizacion.cliente.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-center py-4">
                          <span className="font-bold text-lg text-[#003E7E]">
                            {formatCurrency(total)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center py-4">
                          <Tooltip>
                            <TooltipTrigger className="inline-block">
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-foreground">
                                  {format(fecha, "dd MMM yyyy")}
                                </div>
                                <div className="text-xs text-[#009590]">
                                  {formatDistanceToNow(fecha, {
                                    addSuffix: true,
                                    locale: es,
                                  })}
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {format(fecha, "dd/MM/yyyy HH:mm:ss", {
                                locale: es,
                              })}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>

                        <TableCell className="text-center py-4">
                          <div className="space-y-1">
                            <div className="font-medium text-foreground">
                              {q.cotizacion.cliente.agent}
                            </div>
                            <div className="text-sm text-[#009590]">
                              {q.cotizacion.cliente.office}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-center py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditQuotation(q)}
                                  className="h-8 w-8 p-0 hover:bg-[#009590]/10 hover:text-[#009590]"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Editar cotización</TooltipContent>
                            </Tooltip>
                            <Link
                              href={q.pdf}
                              download="cotizacion-123.pdf"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-[#009590]/10 hover:text-[#009590]"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Descargar PDF</TooltipContent>
                              </Tooltip>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Controles de paginación */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t gap-3">
                {/* Texto con contador */}
                <div className="text-sm text-muted-foreground text-center sm:text-left">
                  Mostrando {startIndex + 1} a{" "}
                  {Math.min(endIndex, filteredData.length)} de{" "}
                  {filteredData.length} resultados
                </div>

                {/* Controles de paginación */}
                <div className="flex items-center justify-center sm:justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  {/* Para pantallas pequeñas mostramos solo la página actual */}
                  <div className="flex items-center space-x-1">
                    <span className="block sm:hidden text-sm">
                      Página {currentPage} de {totalPages}
                    </span>

                    {/* En pantallas medianas/grandes mostramos botones */}
                    <div className="hidden sm:flex items-center space-x-1">
                      {getVisiblePages().map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="h-8 w-8 p-0"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
