import React from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { TableCell } from '@/components/ui/table';

interface Props {
    children: React.ReactNode;
}

const ThemedTableCell = ({ children }: Props) => {
  return (
    <TableCell className=" flex items-center justify-center">
      {children}
    </TableCell>
  )
}

export default ThemedTableCell
