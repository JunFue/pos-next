import { useState, useEffect, useMemo } from "react";
import {
  useForm,
  SubmitHandler,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useItems } from "@/app/inventory/components/item-registration/context/ItemsContext";
import {
  getDefaultFormValues,
  PosFormValues,
  posSchema,
} from "../../utils/posSchema";
import { CartItem } from "../TerminalCart";
import { handleAddToCart, handleClear, handleDone } from "../buttons/handlers";

interface UsePosFormReturn {
  methods: UseFormReturn<PosFormValues>;
  cartItems: CartItem[];
  onAddToCart: () => void;
  onRemoveItem: (sku: string) => void;
  onClear: () => void;
  onDoneSubmit: SubmitHandler<PosFormValues>;
  triggerDoneSubmit: () => void;
  liveTime: string;
  isSubmitting: boolean; // <--- NEW: Expose loading state
}

export const usePosForm = (): UsePosFormReturn => {
  const queryClient = useQueryClient();
  const { items: allItems } = useItems();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // <--- NEW: Local state for submission loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveTime, setLiveTime] = useState("");

  const methods = useForm<PosFormValues>({
    resolver: zodResolver(posSchema),
    defaultValues: getDefaultFormValues(),
    mode: "onChange",
  });

  const {
    getValues,
    setValue,
    reset,
    resetField,
    setFocus,
    handleSubmit,
    control,
  } = methods;

  // --- LIVE CLOCK (Unchanged) ---
  useEffect(() => {
    const getNow = () =>
      new Date()
        .toLocaleString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
        .replace(/,/, "");

    const initialTimeout = setTimeout(() => setLiveTime(getNow()), 0);
    const timer = setInterval(() => setLiveTime(getNow()), 1000);
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(timer);
    };
  }, []);

  // --- CALCULATION LOGIC (Unchanged) ---
  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.total, 0),
    [cartItems]
  );
  const [payment, voucher] = useWatch({
    control,
    name: ["payment", "voucher"],
  });

  useEffect(() => {
    setValue("grandTotal", cartTotal, { shouldValidate: false });
    const changeAmount = (payment || 0) + (voucher || 0) - cartTotal;
    setValue("change", changeAmount, { shouldValidate: false });
  }, [cartTotal, payment, voucher, setValue]);

  const onAddToCart = () => {
    handleAddToCart({
      getValues,
      setValue,
      resetField,
      allItems,
      cartItems,
      setCartItems,
    });
  };

  const onClear = () => {
    handleClear({ setCartItems, reset });
    setTimeout(() => setFocus("customerName"), 50);
  };

  const onRemoveItem = (sku: string) => {
    setCartItems((prevCart) => prevCart.filter((item) => item.sku !== sku));
  };

  const onDoneSubmit: SubmitHandler<PosFormValues> = async (data) => {
    if (!data.payment || data.payment <= 0) {
      alert("Payment must be greater than zero.");
      return;
    }
    if (data.change < 0) {
      alert("Insufficient payment amount.");
      return;
    }

    // <--- NEW: Start Loading
    setIsSubmitting(true);

    try {
      const success = await handleDone(data, cartItems);

      if (success) {
        // Invalidate queries to refresh tables
        await queryClient.invalidateQueries({ queryKey: ["payments"] });
        await queryClient.invalidateQueries({
          queryKey: ["transaction-items"],
        });

        handleClear({ setCartItems, reset });
        setTimeout(() => setFocus("customerName"), 100);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("An unexpected error occurred.");
    } finally {
      // <--- NEW: Stop Loading regardless of success/failure
      setIsSubmitting(false);
    }
  };

  const triggerDoneSubmit = () => {
    handleSubmit(onDoneSubmit)();
  };

  return {
    methods,
    cartItems,
    onAddToCart,
    onRemoveItem,
    onClear,
    onDoneSubmit,
    triggerDoneSubmit,
    liveTime,
    isSubmitting, // <--- Export this
  };
};
