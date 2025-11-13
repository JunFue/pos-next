// app/inventory/components/ItemTable.tsx

"use client";

// 1. 'useEffect' is no longer needed for this logic, so we can remove it.
import React, { useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { DataGrid, Column, RenderHeaderCellProps } from "react-data-grid";
import "react-data-grid/lib/styles.css";
import { Item } from "./utils/itemTypes";
import { Edit, Trash2, Filter, XCircle } from "lucide-react";
import { FilterDropdown } from "@/components/reusables/FilterDropdown";

interface ItemTableProps {
  data: Item[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

// --- Helper: Safely stringify values for filtering ---
const safeString = (val: unknown) =>
  val === null || val === undefined ? "(Blanks)" : String(val);

// --- Component: Header with Portal Filter (Unchanged) ---
interface HeaderWithFilterProps extends RenderHeaderCellProps<Item> {
  allData: Item[];
  filters: Record<string, string[]>;
  onApplyFilter: (
    key: string,
    vals: string[] | null,
    sort?: "ASC" | "DESC"
  ) => void;
}

const HeaderWithFilter = ({
  column,
  allData,
  filters,
  onApplyFilter,
}: HeaderWithFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const columnKey = column.key as keyof Item;
  const isActive = !!filters[columnKey];

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX,
      });
      setIsOpen(true);
    }
  };

  return (
    <>
      <div className="group flex justify-between items-center w-full h-full">
        <span className="truncate">{column.name}</span>
        <button
          ref={buttonRef}
          onClick={toggleOpen}
          className={`p-1 rounded hover:bg-gray-700 transition-opacity ml-1 ${
            isActive || isOpen
              ? "opacity-100 text-green-400 bg-gray-800"
              : "opacity-0 group-hover:opacity-100 text-gray-400"
          }`}
        >
          <Filter className="w-3 h-3" />
        </button>
      </div>
      {isOpen &&
        createPortal(
          <div
            className="z-2 isolate fixed inset-0"
            onClick={() => setIsOpen(false)}
          >
            <div
              style={{
                position: "absolute",
                top: coords.top,
                left: coords.left,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <FilterDropdown
                columnKey={columnKey}
                allData={allData}
                currentSelection={filters[columnKey as string]}
                onClose={() => setIsOpen(false)}
                onApply={(vals, sortDir) => {
                  onApplyFilter(columnKey as string, vals, sortDir);
                  setIsOpen(false);
                }}
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

// --- MAIN ITEM TABLE COMPONENT ---
export const ItemTable: React.FC<ItemTableProps> = ({
  data,
  onEdit,
  onDelete,
}) => {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {}
  );
  const [sortState, setSortState] = useState<{
    col: keyof Item | null;
    dir: "ASC" | "DESC" | null;
  }>({ col: null, dir: null });

  // --- PAGINATION STATE (Unchanged) ---
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const paginationOptions = [20, 50, 100, 200, 500];

  // --- Filter & Sort Logic (Unchanged) ---
  const processedRows = useMemo(() => {
    let rows = [...data];
    // A. Filter
    Object.keys(activeFilters).forEach((key) => {
      const allowedValues = new Set(activeFilters[key]);
      if (allowedValues.size > 0) {
        rows = rows.filter((row) => {
          const val = safeString(row[key as keyof Item]);
          return allowedValues.has(val);
        });
      }
    });
    // B. Sort
    if (sortState.col && sortState.dir) {
      rows.sort((a, b) => {
        // ... (sort logic unchanged) ...
        const colKey = sortState.col!;
        const valA = a[colKey];
        const valB = b[colKey];
        if (typeof valA === "number" && typeof valB === "number") {
          return sortState.dir === "ASC" ? valA - valB : valB - valA;
        }
        const strA = valA !== null && valA !== undefined ? String(valA) : "";
        const strB = valB !== null && valB !== undefined ? String(valB) : "";
        return sortState.dir === "ASC"
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      });
    }
    return rows;
  }, [data, activeFilters, sortState]);

  // --- CALCULATE TOTALS ---
  const totalRows = processedRows.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1; // Ensure at least 1 page

  // --- 2. NEW LOGIC: Create a "safe" page number ---
  // This is the derived value we will use instead of 'currentPage' directly
  // It's guaranteed to be a valid page number.
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  // --- 3. (REMOVED) The problematic useEffect is gone. ---

  // --- CALCULATE PAGE-SPECIFIC VALUES ---
  // 4. Use 'safeCurrentPage' for calculations
  const startRow = totalRows > 0 ? (safeCurrentPage - 1) * rowsPerPage + 1 : 0;
  const endRow = Math.min(safeCurrentPage * rowsPerPage, totalRows);

  // --- CREATE THE FINAL 'PAGINATED' ROWS ---
  const paginatedRows = useMemo(() => {
    // 5. Use 'safeCurrentPage' for slicing
    const startIndex = (safeCurrentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return processedRows.slice(startIndex, endIndex);
    // 6. Depend on 'safeCurrentPage'
  }, [processedRows, safeCurrentPage, rowsPerPage]);

  // --- Handler for Filter/Sort ---
  const handleApplyFilter = (
    key: string,
    values: string[] | null,
    sortDir?: "ASC" | "DESC"
  ) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      if (values === null) {
        delete next[key];
      } else {
        next[key] = values;
      }
      return next;
    });

    if (sortDir) {
      setSortState({ col: key as keyof Item, dir: sortDir });
    }

    // 7. NEW: Reset to page 1 when a filter is applied
    setCurrentPage(1);
  };

  // --- Clear All Filters ---
  const handleClearAllFilters = () => {
    setActiveFilters({});
    setSortState({ col: null, dir: null });
    // 8. NEW: Reset to page 1 when clearing filters
    setCurrentPage(1);
  };

  // --- Columns Definition (Unchanged) ---
  const columns: Column<Item>[] = useMemo(() => {
    // ... (column definitions are unchanged) ...
    const tailwindHeaderClass =
      "bg-transparent text-gray-400 border-b border-gray-700 font-semibold uppercase text-xs flex items-center backdrop-blur-2xl ";
    const createColumn = (
      key: keyof Item,
      name: string,
      width?: number
    ): Column<Item> => ({
      key,
      name,
      width,
      headerCellClass: tailwindHeaderClass,
      renderHeaderCell: (props) => (
        <HeaderWithFilter
          {...props}
          allData={data}
          filters={activeFilters}
          onApplyFilter={handleApplyFilter}
        />
      ),
    });

    return [
      createColumn("itemName", "Item Name"),
      createColumn("sku", "SKU / Barcode"),
      createColumn("category", "Category"),
      {
        ...createColumn("costPrice", "Cost Price", 120),
        renderCell: ({ row }) =>
          typeof row.costPrice === "number"
            ? `₱${row.costPrice.toFixed(2)}`
            : "N/A",
      },
      createColumn("description", "Description"),
      {
        key: "actions",
        name: "Actions",
        width: 100,
        headerCellClass: tailwindHeaderClass,
        renderCell: ({ row }) => (
          <div className="flex gap-2">
            <button
              onClick={() => {
                const originalIndex = data.findIndex((i) => i.id === row.id);
                if (originalIndex !== -1) onEdit(originalIndex);
              }}
              className="hover:bg-blue-400/20 p-1 rounded text-blue-300 hover:text-blue-100"
              title="Edit Item"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const originalIndex = data.findIndex((i) => i.id === row.id);
                if (originalIndex !== -1) onDelete(originalIndex);
              }}
              className="hover:bg-red-400/20 p-1 rounded text-red-400 hover:text-red-200"
              title="Delete Item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ];
  }, [data, activeFilters, onEdit, onDelete]); // handleApplyFilter is memoized

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-4">
        {/* ... (Header/Clear button unchanged) ... */}
        <h3 className="font-semibold text-gray-200 text-lg">
          Registered Items
        </h3>
        {Object.keys(activeFilters).length > 0 && (
          <button
            onClick={handleClearAllFilters}
            className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 border border-red-500/30 rounded text-red-400 text-xs transition-all"
          >
            <XCircle className="w-3 h-3" /> Clear All Filters
          </button>
        )}
      </div>

      <DataGrid<Item>
        columns={columns}
        rows={paginatedRows}
        rowKeyGetter={(row: Item) => row.id!}
        className="border-none"
        style={{ height: "auto", flexGrow: 1, minHeight: 0 }}
        rowClass={(_, index) =>
          `rdg-row bg-transparent text-[80%] text-gray-200 hover:bg-gray-700/40 border-b border-gray-800`
        }
      />

      {/* --- PAGINATION FOOTER --- */}
      <div className="flex justify-between items-center gap-4 bg-gray-900/50 p-3 border-gray-800 border-t text-sm">
        <div className="text-gray-400">
          {/* 9. Use 'safeCurrentPage' in the display string */}
          Showing {startRow} - {endRow} of {totalRows} items
        </div>

        <div className="flex items-center gap-4">
          {/* Rows per page selector (Unchanged) */}
          <div className="flex items-center gap-2">
            <label htmlFor="rowsPerPage" className="text-gray-400">
              Rows:
            </label>
            <select
              id="rowsPerPage"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page
              }}
              className="bg-gray-800 p-1 border border-gray-700 focus:border-blue-500 rounded focus:ring-1 focus:ring-blue-500 text-sm"
            >
              {paginationOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              // 10. Use 'safeCurrentPage' for disabling
              disabled={safeCurrentPage === 1}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 px-2 py-1 rounded disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-2 font-medium text-gray-300">
              {/* 11. Use 'safeCurrentPage' for display */}
              Page {safeCurrentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              // 12. Use 'safeCurrentPage' for disabling
              disabled={safeCurrentPage === totalPages || totalRows === 0}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 px-2 py-1 rounded disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
