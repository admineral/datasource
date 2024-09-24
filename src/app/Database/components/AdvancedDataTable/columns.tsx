// columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./DataTableColumnHeader"; // Reusable component

import { SearchData } from "./types";

export const getColumns = (dates: string[]): ColumnDef<SearchData>[] => {
  // Base columns
  const baseColumns: ColumnDef<SearchData>[] = [
    {
      accessorKey: "client",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Client" />
      ),
    },
    {
      accessorKey: "warehouse",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Warehouse" />
      ),
    },
    {
      accessorKey: "product",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Product" />
      ),
    },
  ];

  // Dynamic date columns
  const dateColumns: ColumnDef<SearchData>[] = dates.map((date) => ({
    accessorKey: date,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={date} />
    ),
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return value;
    },
  }));

  return [...baseColumns, ...dateColumns];
};