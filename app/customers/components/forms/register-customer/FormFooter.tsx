import { Loader2 } from "lucide-react";

interface FormFooterProps {
  onCancel: () => void;
  loading: boolean;
  isCompressing: boolean;
}

export const FormFooter = ({ onCancel, loading, isCompressing }: FormFooterProps) => {
  return (
    <div className="p-6 border-slate-800 border-t">
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-bold text-slate-200 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="customer-form"
          disabled={loading || isCompressing}
          className="flex flex-1 justify-center items-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 shadow-cyan-900/20 shadow-lg py-3 rounded-xl font-bold text-white transition-all disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Register Customer"
          )}
        </button>
      </div>
    </div>
  );
};
