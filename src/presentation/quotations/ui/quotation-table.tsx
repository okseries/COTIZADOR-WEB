import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, Download, MoreHorizontal, FileSearch, PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Quotations } from "../interface/quotation.interface";

interface QuotationTableProps {
  data: Quotations[];
  isLoading?: boolean;
  onViewDetail?: (quotation: Quotations) => void;
  onCreateNew?: () => void;
}

// --- Skeleton Loader ---
function QuotationTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64 mt-1" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Empty State ---
function EmptyState({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <Card className="flex flex-col items-center justify-center py-16">
      <FileSearch className="h-16 w-16 text-muted-foreground/50 mb-4" />
      <CardTitle className="text-xl mb-1">No se encontraron cotizaciones</CardTitle>
      <CardDescription className="mb-6">
        Parece que aún no has creado ninguna cotización.
      </CardDescription>
      <Button onClick={onCreateNew}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Crear nueva cotización
      </Button>
    </Card>
  );
}

// --- Main Table Component ---
export default function QuotationTable({
  data,
  isLoading = false,
  onViewDetail,
  onCreateNew,
}: QuotationTableProps) {
  if (isLoading) {
    return <QuotationTableSkeleton />;
  }

  if (!data || data.length === 0) {
    return <EmptyState onCreateNew={onCreateNew} />;
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Cotizaciones Recientes
            <Badge variant="secondary">{data.length}</Badge>
          </CardTitle>
          <CardDescription>
            Aquí puedes ver y gestionar todas tus cotizaciones guardadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Cliente</TableHead>
                  <TableHead>Identificación</TableHead>
                  <TableHead>Agente</TableHead>
                  <TableHead>Planes</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Fecha</TableHead>
                  <TableHead className="w-[100px] text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((q) => {
                  const total = q.cotizacion.planes
                    .map(p => Number(p.resumenPago.totalPagar))
                    .reduce((a, b) => a + b, 0);
                  const fecha = new Date(q.fecha_creado);

                  return (
                    <TableRow key={q.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="font-medium">{q.cotizacion.cliente.name}</div>
                        <div className="text-xs text-muted-foreground">{q.cotizacion.cliente.email}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{q.cotizacion.cliente.identification}</TableCell>
                      <TableCell>
                        <div className="font-medium">{q.cotizacion.cliente.agent}</div>
                        <div className="text-xs text-muted-foreground">{q.cotizacion.cliente.office}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {q.cotizacion.planes.map(p => (
                            <Badge key={p.plan} variant="outline">{p.plan}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {total.toLocaleString("es-DO", { style: "currency", currency: "DOP" })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="text-sm">{format(fecha, "dd MMM yyyy")}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDistanceToNow(fecha, { addSuffix: true, locale: es })}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {format(fecha, "dd/MM/yyyy HH:mm:ss", { locale: es })}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewDetail?.(q)}>
                              <Eye className="mr-2 h-4 w-4" /> Ver Detalle
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={q.pdf} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" /> Descargar PDF
                              </a>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}





