import React from "react";
import { useCustomerData } from "../hooks/useCustomerData";
import { 
  Mail, Phone, MapPin, Calendar, FileText, 
  DollarSign, Clock, Hash, Download 
} from "lucide-react";

export const CustomerDetailView = () => {
  const { selectedCustomer, selectedCustomerGroupName } = useCustomerData();

  if (!selectedCustomer) return <div className="p-6 text-gray-400">Loading customer data...</div>;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    // [UPDATED] Added h-full, overflow-y-auto and padding here
    <div className="h-full overflow-y-auto custom-scrollbar p-6">
      <div className="grid grid-cols-12 gap-6 mx-auto max-w-7xl pb-10">
        
        {/* LEFT COLUMN - Key Stats & Contact */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Profile Card */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-inner">
                {selectedCustomer.full_name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-white">{selectedCustomer.full_name}</h2>
              <span className="mt-2 px-3 py-1 bg-gray-700/50 text-blue-300 text-xs font-medium rounded-full border border-blue-500/20">
                {selectedCustomerGroupName}
              </span>
            </div>

            <div className="mt-8 space-y-4">
              <InfoRow icon={Phone} label="Phone" value={selectedCustomer.phone_number} />
              <InfoRow icon={Mail} label="Email" value={selectedCustomer.email} />
              <InfoRow icon={MapPin} label="Address" value={selectedCustomer.address} />
              <InfoRow icon={Calendar} label="Birthday" value={formatDate(selectedCustomer.birthdate)} />
            </div>
          </div>

          {/* Financial Snapshot */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-lg">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Financials</h3>
            <div className="space-y-4">
              <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <DollarSign size={20} />
                  </div>
                  <span className="text-gray-300 text-sm">Total Spent</span>
                </div>
                <span className="text-white font-bold text-lg">
                  {formatCurrency(selectedCustomer.total_spent || 0)}
                </span>
              </div>
              
              <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 text-orange-400 rounded-lg">
                    <Hash size={20} />
                  </div>
                  <span className="text-gray-300 text-sm">Visits</span>
                </div>
                <span className="text-white font-bold text-lg">
                  { (selectedCustomer as any).visit_count || 0 }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Details & History */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* Remarks Section */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="text-gray-400" size={18} />
              <h3 className="text-white font-bold text-lg">Remarks & Notes</h3>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-4 text-gray-300 text-sm leading-relaxed border border-gray-700/50 min-h-[100px]">
              {selectedCustomer.remarks || "No remarks added for this customer."}
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
               <div className="flex items-center gap-2">
                <Download className="text-gray-400" size={18} />
                <h3 className="text-white font-bold text-lg">Attached Documents</h3>
              </div>
              <span className="text-xs text-gray-500">{(selectedCustomer as any).documents?.length || 0} Files</span>
            </div>

            {(selectedCustomer as any).documents && (selectedCustomer as any).documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(selectedCustomer as any).documents.map((docUrl: string, idx: number) => (
                  <a 
                    key={idx} 
                    href={docUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-900/50 border border-gray-700/50 hover:bg-gray-700/50 hover:border-blue-500/30 transition-all group"
                  >
                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      <FileText size={16} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm text-gray-300 truncate w-full">Document {idx + 1}</p>
                      <p className="text-xs text-gray-500">View File</p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm border-2 border-dashed border-gray-700 rounded-xl">
                No documents uploaded.
              </div>
            )}
          </div>

           {/* Transactions Placeholder */}
           <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-lg opacity-75">
             <div className="flex justify-between items-center mb-4">
               <div className="flex items-center gap-2">
                <Clock className="text-gray-400" size={18} />
                <h3 className="text-white font-bold text-lg">Recent Transactions</h3>
              </div>
            </div>
             <div className="text-center py-10 bg-gray-900/30 rounded-xl border border-gray-700/30">
               <p className="text-gray-500">Transaction history module coming soon.</p>
             </div>
           </div>

        </div>
      </div>
    </div>
  );
};

// Helper component
const InfoRow = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | null | undefined }) => (
  <div className="flex items-start gap-4">
    <div className="mt-1 text-gray-500">
      <Icon size={16} />
    </div>
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-gray-200 text-sm font-medium">{value || "-"}</p>
    </div>
  </div>
);