"use client"

import * as React from "react"

import { dataConfig, type DataConfig } from "@/config/data"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CsvImporter } from "@/components/csv-importer"

export function TricksTable() {
  const [data, setData] = React.useState(dataConfig.warehouseData)

  return (
    <div className="flex flex-col gap-4">
      <CsvImporter
        fields={[
          { label: "Warehouse", value: "warehouse", required: true },
          { label: "Client", value: "client", required: true },
          { label: "Product", value: "product", required: true },
          { label: "Price", value: "price", required: true },
          { label: "Sales", value: "sales", required: true },
        ]}
        onImport={(parsedData) => {
          const formattedData = parsedData.map((item) => ({
            id: crypto.randomUUID(),
            warehouse: String(item.warehouse ?? ""),
            client: String(item.client ?? ""),
            product: String(item.product ?? ""),
            price: Number.isNaN(Number(item.price)) ? 0 : Number(item.price),
            sales: Number.isNaN(Number(item.sales)) ? 0 : Number(item.sales),
          }))

          setData((prev) => [...prev, ...formattedData])
        }}
        className="self-end"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Warehouse</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Sales</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <span className="line-clamp-1">{item.warehouse}</span>
                </TableCell>
                <TableCell>
                  <span className="line-clamp-1">{item.client}</span>
                </TableCell>
                <TableCell>
                  <span className="line-clamp-1">{item.product}</span>
                </TableCell>
                <TableCell>
                  <span className="line-clamp-1">{item.price}</span>
                </TableCell>
                <TableCell>
                  <span className="line-clamp-1">{item.sales}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
