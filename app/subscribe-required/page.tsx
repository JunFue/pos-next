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

  const hasPendingTrial = data.pendingRequest?.plan_type === 'trial';
  const hasPendingSubscription = data.pendingRequest !== null && !hasPendingTrial;

  return (
    <div className="min-h-screen bg-black">
      <SubscriptionRequired 
        storeId={data.storeId!} 
        hasPendingTrial={hasPendingTrial} 
        hasPendingSubscription={hasPendingSubscription} 
      />
    </div>
  );
}
