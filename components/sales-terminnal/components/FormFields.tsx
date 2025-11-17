// FormFields.tsx
import React from "react";
import { useFormContext } from "react-hook-form";
import { PosFormValues } from "../utils/posSchema"; // Adjust path if needed

export const FormFields = React.memo(() => {
  // Get form methods from the FormProvider context
  const {
    register,
    formState: { errors },
  } = useFormContext<PosFormValues>();

  // Helper array for fields
  const fields = [
    {
      title: "Cashier Name",
      id: "cashierName",
      label: "Cashier Name:",
      type: "text",
      readOnly: true, // TODO
    },
    {
      title: "Transaction Time",
      id: "transactionTime",
      label: "Transaction Time:",
      type: "text",
      readOnly: true,
    },
    { title: "Payment", id: "payment", label: "Payment:", type: "number" },
    {
      title: "Costumer Name",
      id: "customerName",
      label: "Customer Name:",
      type: "text",
    },
    {
      title: "Transaction No.",
      id: "transactionNo",
      label: "Transaction No:",
      type: "text",
      readOnly: true,
    },
    { title: "Voucher", id: "voucher", label: "Voucher:", type: "number" },
    {
      title: "Barcode",
      id: "barcode",
      label: "Barcode:",
      type: "text",
      readOnly: true, // TODO
    },
    {
      title: "Available Stocks",
      id: "availableStocks",
      label: "Available Stocks:",
      type: "number",
      readOnly: true, // TODO
    },
    {
      title: "Grand Total",
      id: "grandTotal",
      label: "Grand Total:",
      type: "number",
      readOnly: true, // TODO
    },
    { title: "Quantity", id: "quantity", label: "Quantity:", type: "number" },
    { title: "Discount", id: "discount", label: "Discount:", type: "number" },
    {
      title: "Change",
      id: "change",
      label: "Change:",
      type: "number",
      readOnly: true, // TODO
    },
  ] as const; // Use 'as const' for stronger type inference on 'id'

  return (
    // The <form> tag is now in the parent SalesTerminal.tsx
    <div className="w-full h-full grow">
      <div className="gap-2 grid grid-cols-6 grid-rows-4 p-4 w-full h-full text-white">
        {fields.map((field) => (
          <React.Fragment key={field.id}>
            <label
              htmlFor={field.id}
              title={field.title}
              className="right-trim flex justify-end items-center text-[50%] sm:text-[65%]"
            >
              {field.label}
            </label>

            <div className="flex items-center">
              <input
                type={field.type}
                id={field.id}
                // Register the input with react-hook-form
                {...register(field.id, {
                  // Coerce number inputs to be stored as numbers
                  ...(field.type === "number" && { valueAsNumber: true }),
                })}
                readOnly={field.readOnly}
                className="w-full h-3 text-xs sm:text-sm truncate input-dark"
                // Add step for 0.00 format on relevant number inputs
                {...(field.type === "number" &&
                  (field.id === "payment" ||
                    field.id === "voucher" ||
                    field.id === "discount") && { step: "0.01" })}
              />
              {/* Optional: Display field-specific errors
              {errors[field.id] && (
                <span className="-bottom-4 absolute text-red-500 text-xs">
                  {errors[field.id]?.message}
                </span>
              )} */}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
});

FormFields.displayName = "FormFields";

export default FormFields;
