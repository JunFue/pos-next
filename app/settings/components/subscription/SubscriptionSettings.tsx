"use client";

import { useSubscription } from "@/app/hooks/useSubscription";
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  History,
  Loader2,
  Clock,
  Smartphone,
  Building2,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import dayjs from "dayjs";
import { useState, useCallback } from "react";

// ============================================================
// Constants
// ============================================================
const GCASH_NUMBER = "09097215229";
const GCASH_NAME = "Junel F.";
const MONTHLY_PRICE = 500;
const ANNUAL_PRICE = 5500;

// ============================================================
// Sub-components
// ============================================================

function CopiedBadge() {
  return (
    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
      Copied!
    </span>
  );
}

function PlanCard({
  type,
  price,
  selected,
  onSelect,
}: {
  type: "monthly" | "annual";
  price: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const isAnnual = type === "annual";
  const monthlyCost = isAnnual ? Math.round(price / 12) : price;
  const savings = isAnnual ? MONTHLY_PRICE * 12 - price : 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative p-5 rounded-2xl border-2 transition-all duration-300 text-left w-full group ${
        selected
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
          : "border-border/50 bg-muted/20 hover:border-border hover:bg-muted/30"
      }`}
    >
      {isAnnual && (
        <div className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
          Save ₱{savings.toLocaleString()}
        </div>
      )}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              selected ? "border-primary bg-primary" : "border-muted-foreground/40"
            }`}
          >
            {selected && <Check className="w-3 h-3 text-primary-foreground" />}
          </div>
          <span className="font-bold text-foreground text-sm uppercase tracking-wider">
            {isAnnual ? "Annual" : "Monthly"}
          </span>
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black text-foreground tracking-tighter">
          ₱{price.toLocaleString()}
        </span>
        <span className="text-muted-foreground text-xs font-medium">
          /{isAnnual ? "year" : "month"}
        </span>
      </div>
      {isAnnual && (
        <p className="text-[11px] text-muted-foreground mt-2">
          Only ₱{monthlyCost}/mo — best value
        </p>
      )}
    </button>
  );
}

function PaymentMethodCard({
  method,
  selected,
  onSelect,
}: {
  method: "gcash_to_gcash" | "otc_to_gcash";
  selected: boolean;
  onSelect: () => void;
}) {
  const isGcash = method === "gcash_to_gcash";
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left w-full flex items-center gap-4 ${
        selected
          ? "border-primary bg-primary/5"
          : "border-border/50 bg-muted/20 hover:border-border"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
          selected
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {isGcash ? (
          <Smartphone className="w-5 h-5" />
        ) : (
          <Building2 className="w-5 h-5" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-foreground">
          {isGcash ? "GCash to GCash" : "Over-the-Counter (OTC)"}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {isGcash
            ? "Send money directly from your GCash app"
            : "Pay via 7-Eleven, SM, Bayad Center, etc."}
        </p>
      </div>
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
          selected ? "border-primary bg-primary" : "border-muted-foreground/40"
        }`}
      >
        {selected && <Check className="w-3 h-3 text-primary-foreground" />}
      </div>
    </button>
  );
}

// ============================================================
// Main Component
// ============================================================

export function SubscriptionSettings() {
  const {
    subscription,
    pendingRequest,
    payments,
    loading,
    submitRequest,
  } = useSubscription();

  const [step, setStep] = useState<"select" | "instructions" | "confirm">(
    "select"
  );
  const [planType, setPlanType] = useState<"monthly" | "annual">("monthly");
  const [paymentMethod, setPaymentMethod] = useState<
    "gcash_to_gcash" | "otc_to_gcash"
  >("gcash_to_gcash");
  const [gcashRef, setGcashRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = planType === "monthly" ? MONTHLY_PRICE : ANNUAL_PRICE;

  const copyNumber = useCallback(async () => {
    await navigator.clipboard.writeText(GCASH_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await submitRequest(planType, paymentMethod, gcashRef || undefined);
      // Reset form on success — the UI will show pending state from the hook
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Check subscription status
  const now = new Date();
  const endDateObj = subscription?.end_date
    ? new Date(subscription.end_date)
    : null;
  const status = subscription?.status?.toUpperCase();
  const isPaid = status === "PAID" || status === "TRIAL" || status === "ACTIVE";
  const isActive = isPaid && endDateObj && endDateObj > now;

  const formattedEndDate = subscription?.end_date
    ? dayjs(subscription.end_date).format("MMM D, YYYY")
    : "-";

  const hasPending = !!pendingRequest;

  // ============================================================
  // RENDER: Active Subscription
  // ============================================================
  if (isActive) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-2">
          <div className="flex items-center gap-4">
            <div className="flex justify-center items-center bg-emerald-500/10 rounded-xl w-12 h-12 text-emerald-500 border border-emerald-500/20 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground tracking-tight">
                Subscription Active
              </h2>
              <p className="text-muted-foreground text-sm mt-0.5">
                Your store is on the{" "}
                <span className="font-bold text-foreground capitalize">
                  {subscription?.plan_type || "monthly"}
                </span>{" "}
                plan.
              </p>
            </div>
          </div>
        </div>

        <div className="gap-8 grid md:grid-cols-2">
          {/* Status Card */}
          <div className="p-6 rounded-2xl border bg-emerald-500/5 border-emerald-500/30 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1 mb-1">
                  Current Status
                </p>
                <h3 className="text-3xl font-bold tracking-tighter text-emerald-500">
                  ACTIVE
                </h3>
              </div>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                <CheckCircle className="w-7 h-7 text-emerald-500" />
              </div>
            </div>
            <div className="space-y-4 pt-4 border-t border-border/30">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Plan</span>
                <span className="font-bold text-foreground capitalize">
                  {subscription?.plan_type || "Monthly"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">
                  Amount Paid
                </span>
                <span className="font-bold text-foreground">
                  ₱{Number(subscription?.amount_paid || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">
                  Valid Until
                </span>
                <span className="font-bold text-foreground">
                  {formattedEndDate}
                </span>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <PaymentHistory payments={payments} />
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: Pending Request
  // ============================================================
  if (hasPending) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col items-center text-center py-6">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-lg">
              <Clock className="w-10 h-10 text-amber-500 animate-pulse" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-foreground tracking-tight mb-2">
            Payment Under Review
          </h2>
          <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
            Your subscription request has been submitted. We&apos;ll review and
            approve it within <strong className="text-foreground">30 minutes to 1 hour</strong>.
          </p>
        </div>

        {/* Pending Request Details */}
        <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500">
              Pending Approval
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-bold text-foreground capitalize">
                {pendingRequest.plan_type}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-bold text-foreground">
                ₱{Number(pendingRequest.amount).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-bold text-foreground">
                {pendingRequest.payment_method === "gcash_to_gcash"
                  ? "GCash to GCash"
                  : "Over-the-Counter"}
              </span>
            </div>
            {pendingRequest.gcash_reference && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-bold text-foreground font-mono text-xs">
                  {pendingRequest.gcash_reference}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Submitted</span>
              <span className="font-bold text-foreground">
                {dayjs(pendingRequest.created_at).format("MMM D, YYYY · h:mm A")}
              </span>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <PaymentHistory payments={payments} />
      </div>
    );
  }

  // ============================================================
  // RENDER: Subscription Form (Inactive)
  // ============================================================
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-2">
        <div className="flex justify-center items-center bg-primary/10 rounded-xl w-12 h-12 text-primary border border-primary/20 shadow-inner">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            Subscribe to PUNCH POS
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Choose a plan and pay via GCash to activate your store.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Step 1: Plan Selection */}
      {step === "select" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80 mb-4 ml-1">
              Choose Your Plan
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <PlanCard
                type="monthly"
                price={MONTHLY_PRICE}
                selected={planType === "monthly"}
                onSelect={() => setPlanType("monthly")}
              />
              <PlanCard
                type="annual"
                price={ANNUAL_PRICE}
                selected={planType === "annual"}
                onSelect={() => setPlanType("annual")}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80 mb-4 ml-1">
              Payment Method
            </h3>
            <div className="space-y-3">
              <PaymentMethodCard
                method="gcash_to_gcash"
                selected={paymentMethod === "gcash_to_gcash"}
                onSelect={() => setPaymentMethod("gcash_to_gcash")}
              />
              <PaymentMethodCard
                method="otc_to_gcash"
                selected={paymentMethod === "otc_to_gcash"}
                onSelect={() => setPaymentMethod("otc_to_gcash")}
              />
            </div>
          </div>

          <button
            onClick={() => setStep("instructions")}
            className="w-full bg-primary hover:bg-primary/90 px-8 py-4 rounded-xl font-bold text-primary-foreground transition-all active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 text-sm"
          >
            Continue — ₱{amount.toLocaleString()}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2: Payment Instructions */}
      {step === "instructions" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="p-6 rounded-2xl border border-primary/30 bg-primary/5">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              {paymentMethod === "gcash_to_gcash"
                ? "Send via GCash App"
                : "Pay Over-the-Counter"}
            </h3>

            {paymentMethod === "gcash_to_gcash" ? (
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </span>
                  <span>
                    Open your <strong className="text-foreground">GCash app</strong> and tap{" "}
                    <strong className="text-foreground">&quot;Send Money&quot;</strong>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </span>
                  <span>
                    Enter the GCash number below and send{" "}
                    <strong className="text-foreground">
                      ₱{amount.toLocaleString()}
                    </strong>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </span>
                  <span>
                    After sending, come back here and confirm your payment
                  </span>
                </li>
              </ol>
            ) : (
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </span>
                  <span>
                    Go to any <strong className="text-foreground">7-Eleven, SM Business Center, Bayad Center</strong>, or GCash partner outlet
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </span>
                  <span>
                    Tell the cashier you want to <strong className="text-foreground">&quot;Cash In to GCash&quot;</strong> or <strong className="text-foreground">&quot;Send to GCash&quot;</strong>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </span>
                  <span>
                    Provide the GCash number below and pay{" "}
                    <strong className="text-foreground">
                      ₱{amount.toLocaleString()}
                    </strong>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                    4
                  </span>
                  <span>
                    After payment, come back here and confirm
                  </span>
                </li>
              </ol>
            )}

            {/* GCash Number Display */}
            <div className="mt-6 p-4 bg-background/60 rounded-xl border border-border/50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                GCash Number
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black text-foreground tracking-wider font-mono">
                    {GCASH_NUMBER}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Account name: <strong className="text-foreground">{GCASH_NAME}</strong>
                  </p>
                </div>
                <button
                  onClick={copyNumber}
                  className="relative p-3 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all active:scale-95"
                  title="Copy number"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                  {copied && <CopiedBadge />}
                </button>
              </div>
            </div>

            {/* Amount to send */}
            <div className="mt-4 p-4 bg-background/60 rounded-xl border border-border/50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                Amount to Send
              </p>
              <p className="text-3xl font-black text-foreground tracking-tighter">
                ₱{amount.toLocaleString()}.00
              </p>
              <p className="text-xs text-muted-foreground mt-1 capitalize">
                {planType} Plan
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("select")}
              className="flex-1 py-3 rounded-xl font-semibold text-sm text-muted-foreground bg-muted hover:bg-muted/80 transition-all active:scale-[0.98]"
            >
              Back
            </button>
            <button
              onClick={() => setStep("confirm")}
              className="flex-[2] bg-primary hover:bg-primary/90 py-3 rounded-xl font-bold text-primary-foreground transition-all active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 text-sm"
            >
              I&apos;ve Sent My Payment
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === "confirm" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="p-6 rounded-2xl border border-border bg-muted/20">
            <h3 className="font-bold text-foreground mb-4">
              Confirm Your Payment
            </h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-bold text-foreground capitalize">
                  {planType}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-foreground">
                  ₱{amount.toLocaleString()}.00
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-bold text-foreground">
                  {paymentMethod === "gcash_to_gcash"
                    ? "GCash to GCash"
                    : "Over-the-Counter"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Sent to</span>
                <span className="font-bold text-foreground font-mono">
                  {GCASH_NUMBER}
                </span>
              </div>
            </div>

            {/* GCash Reference Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                GCash Reference Number{" "}
                <span className="text-muted-foreground/60 normal-case tracking-normal font-medium">
                  (optional but helps speed up approval)
                </span>
              </label>
              <input
                id="gcash-reference-input"
                type="text"
                placeholder="e.g. 1234 5678 9012"
                value={gcashRef}
                onChange={(e) => setGcashRef(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("instructions")}
              className="flex-1 py-3 rounded-xl font-semibold text-sm text-muted-foreground bg-muted hover:bg-muted/80 transition-all active:scale-[0.98]"
            >
              Back
            </button>
            <button
              id="submit-subscription-btn"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-[2] bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl font-bold text-white transition-all active:scale-[0.98] shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Confirm &amp; Submit for Approval
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Payment History (always visible at bottom) */}
      {payments.length > 0 && (
        <div className="pt-6 border-t border-border/30">
          <PaymentHistory payments={payments} />
        </div>
      )}
    </div>
  );
}

// ============================================================
// Payment History Component
// ============================================================
function PaymentHistory({
  payments,
}: {
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    plan_type?: string;
    payment_method?: string;
    gcash_reference?: string;
    created_at: string;
  }>;
}) {
  const statusColors: Record<string, string> = {
    approved: "text-emerald-500/70",
    pending: "text-amber-500/70",
    rejected: "text-destructive/70",
    PAID: "text-emerald-500/70",
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-4 ml-1">
        <History className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
          Payment History
        </h3>
      </div>

      <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
        {payments.length > 0 ? (
          payments.map((payment) => (
            <div
              key={payment.id}
              className="flex justify-between items-center bg-muted/30 p-4 border border-border/50 rounded-xl transition-all hover:border-primary/30 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-muted flex items-center justify-center rounded-lg border border-border/30 group-hover:border-primary/20 transition-colors">
                  <CreditCard className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm tracking-tight leading-none mb-1 capitalize">
                    {payment.plan_type || "Subscription"} Plan
                  </p>
                  <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-tighter">
                    {dayjs(payment.created_at).format("MMM D, YYYY · h:mm A")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-500 text-sm">
                  ₱{Number(payment.amount).toLocaleString()}
                </p>
                <p
                  className={`text-[10px] font-black tracking-widest uppercase ${
                    statusColors[payment.status] || "text-muted-foreground/70"
                  }`}
                >
                  {payment.status}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 bg-muted/10 border border-dashed border-border/50 rounded-xl">
            <p className="text-muted-foreground text-xs font-medium italic">
              No transactions recorded yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
