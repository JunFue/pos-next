import { useSubscription } from "@/app/hooks/useSubscription";
import { CreditCard, CheckCircle, AlertCircle, History, Loader2 } from "lucide-react";
import dayjs from "dayjs";

export default function SubscriptionSettings() {
  const { subscription, payments, loading, subscribe } = useSubscription();

  const handleSubscribe = async () => {
    const confirmed = window.confirm("Confirm subscription payment of 450 PHP?");
    if (confirmed) {
      const result = await subscribe();
      if (!result.success) {
        alert(`Subscription failed: ${result.error || 'Unknown error'}\n\nPlease make sure you have run the SQL migration in Supabase first.`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const isActive = subscription?.status === 'active';
  const endDate = subscription?.current_period_end 
    ? dayjs(subscription.current_period_end).format('MMM D, YYYY') 
    : '-';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
        <div className="flex justify-center items-center bg-cyan-500/10 rounded-lg w-10 h-10 text-cyan-400">
          <CreditCard className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-semibold text-lg text-white">Subscription Plan</h2>
          <p className="text-slate-400 text-sm">Manage your store's billing and payments</p>
        </div>
      </div>

      <div className="gap-6 grid md:grid-cols-2">
        {/* Status Card */}
        <div className={`p-6 rounded-xl border ${isActive ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-800/50 border-slate-700'}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-sm">Current Status</p>
              <h3 className={`text-2xl font-bold ${isActive ? 'text-emerald-400' : 'text-slate-200'}`}>
                {isActive ? 'Active' : 'Inactive'}
              </h3>
            </div>
            {isActive ? (
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            ) : (
              <AlertCircle className="w-6 h-6 text-slate-400" />
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Plan Cost</span>
              <span className="font-medium text-white">₱450.00 / month</span>
            </div>
            {isActive && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Next Billing</span>
                <span className="font-medium text-white">{endDate}</span>
              </div>
            )}
          </div>

          {!isActive && (
            <button
              onClick={handleSubscribe}
              className="mt-6 w-full py-2 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
            >
              Subscribe Now
            </button>
          )}
        </div>

        {/* Payment History */}
        <div className="bg-slate-800/30 p-6 border border-slate-700 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-slate-400" />
            <h3 className="font-medium text-white">Payment History</h3>
          </div>
          
          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            {payments.length > 0 ? (
              payments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                  <div>
                    <p className="text-white text-sm font-medium">Subscription Payment</p>
                    <p className="text-slate-500 text-xs">
                      {dayjs(payment.created_at).format('MMM D, YYYY h:mm A')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 text-sm font-medium">
                      ₱{Number(payment.amount).toFixed(2)}
                    </p>
                    <p className="text-slate-500 text-xs uppercase">{payment.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm text-center py-4">No payment history found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
