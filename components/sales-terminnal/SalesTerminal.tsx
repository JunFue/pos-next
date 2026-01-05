"use client";

import { useEffect } from "react";

import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import { useViewStore } from "../window-layouts/store/useViewStore";
import FormFields from "./components/FormFields";

import TerminalHeader from "./components/TerminalHeader";

import { FormProvider } from "react-hook-form";
import "react-data-grid/lib/styles.css";
import TerminalCart from "./components/TerminalCart";
import { usePosForm } from "./components/form/usePosForm";
import SuccessReceiptModal from "./utils/SuccessReceiptModal";
import ErrorMessage from "./components/ErrorMessage";

const SalesTerminal = () => {
  const { isSplit } = useViewStore();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const {
    methods,
    cartItems,
    onAddToCart,
    onRemoveItem,
    onUpdateItem,
    onDoneSubmit,
    triggerDoneSubmit,
    onClear,
    liveTime,
    successData,
    closeSuccessModal,
    errorMessage,
    clearErrorMessage,
  } = usePosForm();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClear]);


  function ScreenLogic() {
    if (isSplit && !isMobile) {
      return "grid-rows-2";
    } else if (!isSplit && !isMobile) {
      return "grid-cols-2";
    }
    return "";
  }

  return (
    <div className="relative flex flex-col p-1 h-full">
      <FormProvider {...methods}>
        <TerminalHeader liveTime={liveTime} />

        <form
          id="sales-form"
          onSubmit={methods.handleSubmit(onDoneSubmit)}
          className={`gap-4 grid w-full h-full overflow-hidden`}
        >
          <div className="relative flex flex-col w-full h-full">
            <FormFields
              onAddToCartClick={onAddToCart}
              onDoneSubmitTrigger={triggerDoneSubmit}
            />
          </div>
          <div className="border border-primary-light rounded-2xl w-full h-full overflow-hidden">
            <TerminalCart 
              rows={cartItems} 
              onRemoveItem={onRemoveItem} 
              onUpdateItem={onUpdateItem}
            />
          </div>
        </form>
      </FormProvider>

      {successData && (
        <SuccessReceiptModal data={successData} onClose={closeSuccessModal} />
      )}

      <ErrorMessage message={errorMessage} onClose={clearErrorMessage} />
    </div>
  );
};

export default SalesTerminal;