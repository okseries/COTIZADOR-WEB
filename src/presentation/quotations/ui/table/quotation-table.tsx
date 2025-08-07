import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
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

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Download,
  FileText,
} from "lucide-react";
import { Quotations } from "../../interface/quotation.interface";
import QuotationTableHeader from "./table-header";
import Link from "next/link";
import EmptyState from "./empty-table";
import { useRouter } from "next/navigation";
import QuotationTableSkeleton from "./quotation-skeleton";

interface QuotationTableProps {
  data: Quotations[];
  isLoading?: boolean;
  onViewDetail?: (quotation: Quotations) => void;
}


export default function QuotationTable({data, isLoading = false}: QuotationTableProps) {
  const router = useRouter();


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
      <div className="h-full flex flex-col">
        <Card className="px-4 shadow-lg border-0 bg-white flex-1 flex flex-col">
          <QuotationTableHeader
            quantity={data.length}
            onCreateNew={onCreateNew}
          />

          <CardContent className="p-0 flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-auto">
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
                  {data.map((q) => {
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
                          <Link
                            href={q.pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-foreground hover:text-primary"
                          >
                            <Download className="w-4 h-4 text-accent" />
                            <span>Descargar</span>
                            <span className="text-destructive font-medium">
                              PDF
                            </span>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
