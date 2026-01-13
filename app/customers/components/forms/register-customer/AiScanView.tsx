import { Sparkles, Loader2, Cpu, Camera, AlertCircle } from "lucide-react";

interface AiScanViewProps {
  isAiProcessing: boolean;
  handleAiScan: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AiScanView = ({ isAiProcessing, handleAiScan }: AiScanViewProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center space-y-2">
        <div className="inline-flex p-4 bg-cyan-500/10 rounded-full mb-2">
          <Sparkles className="w-10 h-10 text-cyan-400" />
        </div>
        <h3 className="text-xl font-bold text-white">AI Document Scanner</h3>
        <p className="text-slate-400 text-sm max-w-sm mx-auto">
          Use Gemini AI to automatically extract information from ID cards or registration documents.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 w-full max-w-md">
        <div className="relative group">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleAiScan}
            disabled={isAiProcessing}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
          />
          <div className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-all ${
            isAiProcessing 
              ? "border-cyan-500 bg-cyan-500/5" 
              : "border-slate-700 group-hover:border-cyan-500/50 group-hover:bg-slate-800/50"
          }`}>
            {isAiProcessing ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                  <Cpu className="w-6 h-6 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-cyan-400">AI is Analyzing...</p>
                  <p className="text-xs text-slate-500">Extracting data using Gemini 1.5 Pro</p>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-cyan-500/20 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8 text-cyan-400" />
                </div>
                <p className="font-bold text-white">Open Camera</p>
                <p className="text-xs text-slate-500 mt-1">Capture document to auto-fill</p>
              </>
            )}
          </div>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Important Note</p>
            <p className="text-xs text-slate-300 leading-relaxed">
              Please review all autofilled information for accuracy before submitting. AI may occasionally misread handwritten or blurry text.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4 flex flex-col items-center">
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <Cpu className="w-3 h-3" />
          <span>Powered by Gemini 1.5 Pro AI Vision</span>
        </div>
      </div>
    </div>
  );
};
