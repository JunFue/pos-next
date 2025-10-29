import React from "react"; // Added for React.Fragment

export const FormFields = () => {
  // Helper array for fields to avoid repetition
  // Added IDs for 'htmlFor' and 'key' props
  // Corrected spelling of "Customer", "Time", etc.
  const fields = [
    { id: "cashierName", label: "Cashier Name:" },
    { id: "transactionTime", label: "Transaction Time:" },
    { id: "payment", label: "Payment:" },
    { id: "customerName", label: "Customer Name:" },
    { id: "transactionNo", label: "Transaction No:" },
    { id: "discount", label: "Discount:" },
    { id: "barcode", label: "Barcode:" },
    { id: "availableStocks", label: "Available Stocks:" },
    { id: "grandTotal", label: "Grand Total:" },
    { id: "quantity", label: "Quantity:" },
    { id: "customerPrice", label: "Customer Price:" },
    { id: "change", label: "Change:" },
  ];

  return (
    <form action="" className="w-full h-full">
      {/* Grid container: 
        - grid-cols-6: Defines 6 columns (3 labels + 3 inputs)
        - grid-rows-4: Defines 4 rows
        - gap-x-4: Horizontal gap between columns (e.g., between input and next label)
        - gap-y-2: Vertical gap between rows
        - p-4: Padding inside the bordered container
        - w-full h-full: Take up full space given by parent
        - text-white: Default text color
      */}
      <div className="gap-x-4 gap-y-2 grid grid-cols-6 grid-rows-4 p-4 border border-amber-100 w-full h-full text-white">
        {fields.map((field) => (
          <React.Fragment key={field.id}>
            {/* Label:
              - Col 1, 3, 5
              - flex items-center: Vertically center text
              - justify-end: Right-align text (standard for form labels)
              - text-xs sm:text-sm: Responsive text size (base: 12px, sm+: 14px)
              - truncate: Add '...' if text overflows (e.g., on very small screens)
            */}
            <label
              htmlFor={field.id}
              className="flex justify-end items-center text-xs sm:text-sm truncate"
            >
              {field.label}
            </label>

            {/* Input Wrapper:
              - Col 2, 4, 6
              - flex items-center: Vertically centers the input. 
                This is the key to preventing the input from 'stretching'
                to fill the full height of the grid cell.
            */}
            <div className="flex items-center">
              {/* Input:
                - w-full: Make input fill its parent wrapper (the <div> above)
                - rounded-md: Standard rounded corners
                - bg-gray-700 border-gray-600: Dark theme styling (replaces 'input-dark')
                - px-3 py-1: Standard padding inside input (py-1 is a bit smaller, good for dense UI)
                - text-xs sm:text-sm: Responsive text size
                - truncate: Add '...' if text overflows
                - focus:ring-1 focus:ring-blue-500 focus:border-blue-500: Standard focus outline
              */}
              <input
                type="text"
                id={field.id}
                className="bg-gray-700 px-3 py-1 border border-gray-600 focus:border-blue-500 rounded-md focus:ring-1 focus:ring-blue-500 w-full text-white text-xs sm:text-sm truncate"
              />
            </div>
          </React.Fragment>
        ))}
      </div>
    </form>
  );
};

export default FormFields;
