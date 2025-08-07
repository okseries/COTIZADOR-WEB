import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useQuotationStore } from "../../store/useQuotationStore";
import QuotationTableSkeleton from "./quotation-skeleton";

interface QuotationTableProps {
  data: Quotations[];
  isLoading?: boolean;
  onViewDetail?: (quotation: Quotations) => void;
}


export default function QuotationTable({data, isLoading = false}: QuotationTableProps) {
  const router = useRouter();
  const { loadExistingQuotation } = useQuotationStore();
  
  // Estados para búsqueda y paginación
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtrar datos por búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(quotation => 
      quotation.cotizacion.cliente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.cotizacion.cliente.identification.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // Calcular datos paginados
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset página cuando cambia la búsqueda
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Función para generar páginas visibles en la paginación
  const getVisiblePages = () => {
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(currentPage - halfVisible, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const handleEditQuotation = (quotation: Quotations) => {
    // Convert the quotation data to the expected format
    const quotationRequest = {
      user: quotation.cotizacion.user,
      cliente: quotation.cotizacion.cliente,
      planes: quotation.cotizacion.planes.map(plane => ({
        ...plane,
        afiliados: plane.afiliados.map(afiliado => ({
          ...afiliado,
          subtotal: String(afiliado.subtotal) // Ensure subtotal is a string
        })),
        opcionales: plane.opcionales.map(opcional => ({
          nombre: opcional.nombre,
          descripcion: opcional.descripcion,
          prima: opcional.prima
        }))
      }))
    };
    
    // Load the existing quotation data into the store
    loadExistingQuotation(quotationRequest);
    // Navigate to the quotation form (Step 1) to edit
    router.push('/dashboard/cotizacion');
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

  // Si no hay resultados después de filtrar
  if (filteredData.length === 0) {
    return (
      <TooltipProvider>
        <div className="h-full flex flex-col space-y-4">
          {/* Barra de búsqueda */}
          <Card className="px-4 py-3 shadow-sm border border-border/50 bg-white">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre del cliente o identificación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <div className="text-sm text-muted-foreground">
                0 de {data.length} cotizaciones
              </div>
            </div>
          </Card>

          {/* Estado vacío para búsqueda */}
          <Card className="px-4 shadow-lg border-0 bg-white flex-1 flex flex-col">
            <CardContent className="p-8 flex-1 flex flex-col items-center justify-center text-center">
              <Search className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No se encontraron resultados
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                No hay cotizaciones que coincidan con "{searchTerm}"
              </p>
              <Button
                variant="outline"
                onClick={() => setSearchTerm("")}
                className="text-[#005BBB] border-[#005BBB] hover:bg-[#005BBB] hover:text-white"
              >
                Limpiar búsqueda
              </Button>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col space-y-4">
        {/* Barra de búsqueda */}
        <Card className="px-4 py-3 shadow-sm border border-border/50 bg-white">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre del cliente o identificación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <div className="text-sm text-muted-foreground">
              {filteredData.length} de {data.length} cotizaciones
            </div>
          </div>
        </Card>

        {/* Tabla con scroll mejorado */}
        <Card className="px-4 shadow-lg border-0 bg-white flex-1 flex flex-col min-h-0">
          <QuotationTableHeader
            quantity={filteredData.length}
            onCreateNew={onCreateNew}
          />

          <CardContent className="p-0 flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-auto max-h-[calc(100vh-300px)]">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-primary/20">
                    <TableHead className="w-[180px] font-semibold text-foreground">
                      CLIENTE
                    </TableHead>
                    <TableHead className="text-center font-semibold text-foreground">
                      IDENTIFICACIÓN
                    </TableHead>
                    <TableHead className="text-center font-semibold text-foreground">
                      AGENTE
                    </TableHead>
                    <TableHead className="text-center font-semibold text-foreground">
                      PLANES
                    </TableHead>
                    <TableHead className="text-center font-semibold text-foreground">
                      TOTAL
                    </TableHead>
                    <TableHead className="text-center font-semibold text-foreground">
                      FECHA
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
                              <div className="text-sm text-[#FFA500] truncate">
                                {q.cotizacion.cliente.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center py-4">
                          <span className="font-medium text-foreground">
                            {q.cotizacion.cliente.identification}
                          </span>
                        </TableCell>
                        <TableCell className="text-center py-4">
                          <div className="space-y-1">
                            <div className="font-medium text-foreground">
                              {q.cotizacion.cliente.agent}
                            </div>
                            <div className="text-sm text-[#FFA500]">
                              {q.cotizacion.cliente.office}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center py-4">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {q.cotizacion.planes.map((p) => (
                              <Badge
                                key={p.plan}
                                variant="secondary"
                                className="bg-[#008080] text-white border-[#D1D5DB]"
                              >
                                {p.plan}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-center py-4">
                          <span className="font-bold text-lg text-[#005BBB]">
                            {total.toLocaleString("es-DO", {
                              style: "currency",
                              currency: "DOP",
                            })}
                          </span>
                        </TableCell>
                        <TableCell className="text-center py-4">
                          <Tooltip>
                            <TooltipTrigger className="inline-block">
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-foreground">
                                  {format(fecha, "dd MMM yyyy")}
                                </div>
                                <div className="text-xs text-[#FFA500]">
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
                          <div className="flex items-center justify-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditQuotation(q)}
                                  className="h-8 w-8 p-0 hover:bg-[#005BBB]/10 hover:text-[#005BBB]"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Editar cotización
                              </TooltipContent>
                            </Tooltip>
                            <Link
                              href={q.pdf}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-[#FFA500]/10 hover:text-[#FFA500]"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Descargar PDF
                                </TooltipContent>
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
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="text-sm text-muted-foreground">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, filteredData.length)} de {filteredData.length} resultados
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center space-x-1">
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
