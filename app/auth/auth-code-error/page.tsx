import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-3">
          Authentication Error
        </h1>
        
        <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
          We couldn't verify your authentication request. This usually happens if the sign-in link has expired, was already used, or if there's an issue with your browser securely completing the flow.
        </p>

        <div className="space-y-3">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all active:scale-[0.98]"
          >
            Try Logging In Again
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold border border-zinc-700 rounded-xl transition-all active:scale-[0.98]"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
