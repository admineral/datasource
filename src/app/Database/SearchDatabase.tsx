"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import { FaSearch, FaTrashAlt } from "react-icons/fa";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableColumnHeader } from "./components/AdvancedDataTable/DataTableColumnHeader";

// Define the Payment type based on your data structure
export type Payment = {
  id: string;
  client: string;
  warehouse: string;
  product: string;
  sales: Record<string, number>;
  price: Record<string, number>;
};

// Define the column definitions
export const columns: ColumnDef<Payment>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() ? "indeterminate" : false)
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "client",
    header: "Client",
    cell: ({ row }) => <div className="capitalize">{row.getValue("client")}</div>,
  },
  {
    accessorKey: "warehouse",
    header: "Warehouse",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("warehouse")}</div>
    ),
  },
  {
    accessorKey: "product",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
    cell: ({ row }) => <div className="lowercase">{row.getValue("product")}</div>,
  },
  // Dynamic Date Columns will be added dynamically based on data
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy Payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Client Details</DropdownMenuItem>
            <DropdownMenuItem>View Payment Details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// New: Interface for component props
interface SearchDatabaseProps {
  options: {
    clients: string[];
    warehouses: string[];
    products: string[];
  };
  updateOptions: (newOptions: {
    clients: string[];
    warehouses: string[];
    products: string[];
  }) => void;
  clearOptions: () => void;
}

// Updated: Component definition to accept props
const SearchDatabase: React.FC<SearchDatabaseProps> = ({ options, updateOptions, clearOptions }) => {
  // Updated: Use options from props instead of state
  const { clients, warehouses, products } = options;

  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [limit, setLimit] = useState<number>(10);
  const [searchResult, setSearchResult] = useState<Payment[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Table States
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [showModal, setShowModal] = useState<boolean>(false);

  // Updated: fetchOptions now uses updateOptions
  const fetchOptions = async () => {
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/redis/options?t=${timestamp}`);
      if (!response.ok) {
        throw new Error('Failed to fetch options');
      }
      const data = await response.json();
      updateOptions(data);
    } catch (error: any) {
      console.error('Error fetching options:', error);
      toast.error(error.message || 'Failed to fetch options');
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const handleSearch = async () => {
    if (!selectedClient && !selectedWarehouse && !selectedProduct) {
      toast.error("Please select at least one search criteria");
      return;
    }

    setIsSearching(true);
    setSearchResult([]);

    try {
      const searchParams = new URLSearchParams();
      if (selectedClient) searchParams.append("client", selectedClient);
      if (selectedWarehouse) searchParams.append("warehouse", selectedWarehouse);
      if (selectedProduct) searchParams.append("product", selectedProduct);
      searchParams.append("limit", limit.toString());

      const response = await fetch(`/api/redis/search?${searchParams.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Network response was not ok");
      }
      const data = await response.json();
      // Transform the data to match the Payment type
      const transformedData: Payment[] = Object.entries(data.results || {}).map(
        ([key, value]: [string, any]) => {
          const [client, warehouse, product] = key.split(":");
          return {
            id: key,
            client,
            warehouse,
            product,
            sales: value.sales || {},
            price: value.price || {},
          };
        }
      );
      setSearchResult(transformedData);
    } catch (error: any) {
      console.error("Search error:", error);
      toast.error(error.message || "Failed to fetch data from Redis");
    } finally {
      setIsSearching(false);
    }
  };

  // Extract all unique dates from the search results for dynamic columns
  const allDates = Array.from(
    new Set(
      searchResult.flatMap((item) => [
        ...Object.keys(item.sales || {}),
        ...Object.keys(item.price || {}),
      ])
    )
  ).sort();

  // Dynamically add date columns to the table
  const dynamicColumns: ColumnDef<Payment>[] = allDates.map((date) => ({
    accessorKey: date,
    header: date,
    cell: ({ row }) => {
      const sales = row.original.sales[date] || "N/A";
      const price = row.original.price[date] || "N/A";
      return (
        <div className="text-center">
          {sales} / {price}
        </div>
      );
    },
  }));

  // Combine static and dynamic columns
  const tableColumns = useMemo(() => [...columns, ...dynamicColumns], [dynamicColumns]);

  const table = useReactTable({
    data: searchResult,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: false,
  });

  // Updated: handleCleanDatabase now uses clearOptions prop
  const handleCleanDatabase = async () => {
    try {
      const response = await fetch('/api/redis', { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Network response was not ok');
      }
      toast.success('Database cleaned successfully');
      clearOptions();
      await fetchOptions(); // Re-fetch options (which should now be empty)
    } catch (error: any) {
      console.error('Clean database error:', error);
      toast.error(error.message || 'Failed to clean the database');
    } finally {
      setShowModal(false);
    }
  };

  return (
    <div className="rounded-md bg-white p-6 dark:bg-gray-800">
      <h2 className="mb-6 text-2xl font-semibold">Search in Database</h2>
      {/* Search Filters */}
      <div className="mb-6 flex flex-wrap space-x-2">
        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="rounded-md bg-white p-2 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
        >
          <option value="">Select Client</option>
          {clients.map((client) => (
            <option key={client} value={client}>
              {client}
            </option>
          ))}
        </select>
        <select
          value={selectedWarehouse}
          onChange={(e) => setSelectedWarehouse(e.target.value)}
          className="rounded-md bg-white p-2 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
        >
          <option value="">Select Warehouse</option>
          {warehouses.map((warehouse) => (
            <option key={warehouse} value={warehouse}>
              {warehouse}
            </option>
          ))}
        </select>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="rounded-md bg-white p-2 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
        >
          <option value="">Select Product</option>
          {products.map((product) => (
            <option key={product} value={product}>
              {product}
            </option>
          ))}
        </select>
        <select
          value={limit}
          onChange={(e) => setLimit(parseInt(e.target.value, 10))}
          className="rounded-md bg-white p-2 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
        >
          <option value={10}>10</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={200}>200</option>
        </select>
        <Button
          onClick={handleSearch}
          variant="default"
          className="flex items-center space-x-1"
          disabled={isSearching}
        >
          <FaSearch />
          <span>{isSearching ? "Searching..." : "Search"}</span>
        </Button>
        {/* New Clean Database button */}
        <Button
          onClick={() => setShowModal(true)}
          variant="default"
          className="flex items-center space-x-2 text-red-600"
        >
          <FaTrashAlt />
          <span>Clean Database</span>
        </Button>
      </div>

      {/* Advanced Table Controls */}
      <div className="mb-4 flex items-center justify-between">
        {/* Column Filter Input */}
        <Input
          placeholder="Filter by Product..."
          value={(table.getColumn("product")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("product")?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
        />
        {/* Column Visibility Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + allDates.length + 2}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {/* New Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-md bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold">Confirm Database Cleaning</h3>
            <p>Are you sure you want to clean the database? This action cannot be undone.</p>
            <div className="mt-6 flex justify-end space-x-4">
              <Button onClick={handleCleanDatabase} variant="default" className="bg-red-500 text-white">
                Yes, Clean
              </Button>
              <Button onClick={() => setShowModal(false)} variant="default">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchDatabase;