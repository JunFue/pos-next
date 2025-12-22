"use client";

import React from "react";
import { CashoutForm } from "./CashoutForm";
import { CashoutTable } from "./CashoutTable";
import { useCashout } from "../../hooks/useCashout";

export function Cashout() {
  const { form, refs, data, handlers } = useCashout();

  return (
    <div className="flex flex-col gap-8">
      <CashoutForm
        form={form}
        refs={refs}
        categories={data.categories}
        isSubmitting={data.isSubmitting}
        isCategoriesLoading={data.isCategoriesLoading}
        handlers={handlers}
      />

      <CashoutTable expenses={data.expenses} isLoading={data.isLoading} />
    </div>
  );
}
