import { SubscriptionRequired } from "@/components/subscription/SubscriptionRequired";
import { fetchSubscriptionData } from "@/app/actions/subscription";
import { redirect } from "next/navigation";

export default async function SubscribeRequiredPage() {
  const data = await fetchSubscriptionData();
  
  if (!data.success) {
    if (data.error === "Not authenticated") {
      redirect("/login");
    } else {
      // Could be no store found, let them go to select-store or onboarding
      redirect("/select-store");
    }
  }

  // Check if they had any kind of trial request (pending, approved, etc.)
  const payments = (data as any).payments || [];
  const hasHadTrial = payments.some((p: any) => p.plan_type === 'trial');
  const hasPendingTrial = data.pendingRequest?.plan_type === 'trial';
  const hasPendingSubscription = data.pendingRequest !== null && !hasPendingTrial;

  // Check if session is actually active (fast-path for when they refresh this page)
  if (data.subscription) {
    const status = (data.subscription as any).status?.toUpperCase();
    const isPaid = status === "PAID" || status === "TRIAL" || status === "ACTIVE";
    const endDate = data.subscription.end_date ? new Date(data.subscription.end_date) : null;
    const now = new Date();
    
    if (isPaid && endDate && endDate > now) {
      redirect("/");
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <SubscriptionRequired 
        storeId={data.storeId!} 
        hasPendingTrial={hasPendingTrial || hasHadTrial} 
        hasPendingSubscription={hasPendingSubscription} 
      />
    </div>
  );
}
