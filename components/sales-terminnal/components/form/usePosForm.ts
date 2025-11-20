import { useState, useEffect, useMemo } from "react";
import {
  useForm,
  SubmitHandler,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
}

// Helper function defined outside to keep the effect clean
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

export const usePosForm = (): UsePosFormReturn => {
  const { items: allItems } = useItems();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Initialize with empty string to avoid server/client hydration mismatch
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

  // --- LIVE CLOCK EFFECT (FIXED) ---
  useEffect(() => {
    // 1. Set initial time asynchronously to avoid "synchronous setState in effect" error
    const initialTimeout = setTimeout(() => {
      setLiveTime(getNow());
    }, 0);

    // 2. Start the interval
    const timer = setInterval(() => {
      setLiveTime(getNow());
    }, 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(timer);
    };
  }, []);

  // --- CALCULATION LOGIC ---
  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.total, 0);
  }, [cartItems]);

  // Use useWatch to avoid React Compiler warnings about stale values
  const [payment, voucher] = useWatch({
    control,
    name: ["payment", "voucher"],
  });

  useEffect(() => {
    setValue("grandTotal", cartTotal, { shouldValidate: false });

    const grandTotal = cartTotal;
    const paymentAmount = payment || 0;
    const voucherAmount = voucher || 0;
    const changeAmount = paymentAmount + voucherAmount - grandTotal;

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

    const success = await handleDone(data, cartItems);

    if (success) {
      handleClear({ setCartItems, reset });
      setTimeout(() => {
        setFocus("customerName");
      }, 100);
    }
  };

  const triggerDoneSubmit = () => {
    methods.trigger().then((isValid) => {
      if (!isValid) {
        console.error("Form Validation Failed:", methods.formState.errors);
      }
    });
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
  };
};
