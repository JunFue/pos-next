// Mobile Form Fields - Barcode and Quantity on same row with +/- buttons
import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { PosFormValues } from "../utils/posSchema";
import ItemAutocomplete from "../../../utils/ItemAutoComplete";
import { Plus, Minus } from "lucide-react";

type MobileFormFieldsProps = {
  onAddToCartClick: () => void;
  setActiveField?: (field: "barcode" | "quantity" | null) => void;
};

export const MobileFormFields = React.memo<MobileFormFieldsProps>(
  ({ onAddToCartClick, setActiveField }) => {
    const { register, control, setValue, setFocus, getValues, watch } =
      useFormContext<PosFormValues>();

    const quantity = watch("quantity") || 0;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter") return;
      e.preventDefault();

      const target = e.target as HTMLInputElement;
      const fieldId = target.id;

      if (fieldId === "barcode") {
        setFocus("quantity");
      } else if (fieldId === "quantity") {
        onAddToCartClick();
        setFocus("barcode");
      }
    };

    const handleIncreaseQty = () => {
      const currentQty = getValues("quantity") || 0;
      setValue("quantity", currentQty + 1, { shouldValidate: true });
    };

    const handleDecreaseQty = () => {
      const currentQty = getValues("quantity") || 0;
      if (currentQty > 1) {
        setValue("quantity", currentQty - 1, { shouldValidate: true });
      }
    };

    const noSpinnerClass =
      "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

    return (
      <div className="flex items-end gap-2 w-full text-white p-2">
        {/* Barcode Field - Takes most space */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <label
            htmlFor="barcode"
            className="font-medium text-xs text-slate-400"
          >
            Barcode / Item:
          </label>
          <Controller
            control={control}
            name="barcode"
            render={({
              field: { onChange, value, onBlur, ref },
              fieldState: { error },
            }) => (
              <ItemAutocomplete
                id="barcode"
                onKeyDown={handleKeyDown}
                ref={ref}
                value={value ? String(value) : ""}
                onChange={onChange}
                onBlur={onBlur}
                onFocus={() => setActiveField?.("barcode")}
                error={error?.message}
                onItemSelect={(item) => {
                  setValue("barcode", item.sku, { shouldValidate: true });
                  setFocus("quantity");
                }}
                className="px-3 w-full h-10 text-sm input-dark rounded-lg border-slate-700 focus:border-cyan-500 transition-colors"
              />
            )}
          />
        </div>

        {/* Quantity Section - Compact with +/- */}
        <div className="flex flex-col gap-1 shrink-0">
          <label
            htmlFor="quantity"
            className="font-medium text-xs text-slate-400"
          >
            Qty:
          </label>
          <div className="flex items-center gap-1">
            {/* Minus Button */}
            <button
              type="button"
              onClick={handleDecreaseQty}
              className="w-10 h-10 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition-colors active:scale-95"
            >
              <Minus className="w-4 h-4" />
            </button>

            {/* Quantity Input */}
            <input
              type="number"
              id="quantity"
              {...register("quantity", { valueAsNumber: true })}
              onFocus={() => setActiveField?.("quantity")}
              onKeyDown={handleKeyDown}
              className={`w-14 h-10 text-center text-sm input-dark rounded-lg border-slate-700 focus:border-cyan-500 transition-colors ${noSpinnerClass}`}
            />

            {/* Plus Button */}
            <button
              type="button"
              onClick={handleIncreaseQty}
              className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg transition-colors active:scale-95"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }
);

MobileFormFields.displayName = "MobileFormFields";

export default MobileFormFields;
