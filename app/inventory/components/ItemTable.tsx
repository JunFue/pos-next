// ItemTable.tsx
// (Corrected to handle null costPrice)

"use client";

import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { Item } from "../utils/itemTypes";

interface ItemTableProps {
  data: Item[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

const columnHelper = createColumnHelper<Item>();

export const ItemTable: React.FC<ItemTableProps> = React.memo(
  ({ data, onEdit, onDelete }) => {
    const columns = React.useMemo(
      () => [
        columnHelper.accessor("itemName", {
          header: "Item Name",
          cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("sku", {
          header: "SKU / Barcode",
          cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("category", {
          header: "Category",
          cell: (info) => info.getValue() || "N/A", // This one is already safe
        }),

        // --- START OF FIX ---
        // We need to safely handle cases where costPrice might be null or undefined
        columnHelper.accessor("costPrice", {
          header: "Cost Price",
          cell: (info) => {
            const price = info.getValue();
            // Check if price is a valid number before calling .toFixed()
            if (typeof price === "number") {
              return `$${price.toFixed(2)}`;
            }
            // Otherwise, display a fallback
            return "N/A";
          },
        }),
        // --- END OF FIX ---

        columnHelper.accessor("description", {
          header: "Description",
          cell: (info) => info.getValue() || "N/A", // This one is also safe
        }),
        columnHelper.display({
          id: "actions",
          header: "Actions",
          cell: (props) => (
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(props.row.index)}
                className="p-1 text-blue-300 hover:text-blue-100"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(props.row.index)}
                className="p-1 text-red-400 hover:text-red-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ),
        }),
      ],
      [onEdit, onDelete]
    );

    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
    });

    return (
      <div className="overflow-x-auto">
        <h3 className="mb-4 font-semibold text-lg">Registered Items</h3>
        <table className="w-full text-slate-200 text-sm text-left">
          <thead className="bg-white/10 text-slate-300 text-xs uppercase">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-6 py-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-white/5 border-gray-700/50 border-b"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);

ItemTable.displayName = "ItemTable";
