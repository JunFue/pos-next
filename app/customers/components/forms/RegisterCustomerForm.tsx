import { useState } from "react";
import {
  User,
  Upload,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Loader2,
  CheckCircle2,
  Users,
  Heart,
  Scan,
  Cpu,
  AlertCircle,
  Camera,
  Sparkles,
} from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import imageCompression from "browser-image-compression";

import {
  useCustomerData,
  useCustomerMutations,
} from "../../hooks/useCustomerData";
import { createCustomer } from "../../api/services";
import { CustomerFormValues, customerSchema } from "../../lib/types";

interface RegisterCustomerFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const RegisterCustomerForm = ({
  onSuccess,
  onCancel,
}: RegisterCustomerFormProps) => {
  const { groups } = useCustomerData();
  const { refreshData } = useCustomerMutations();

  const [loading, setLoading] = useState(false);
  const [compressedFiles, setCompressedFiles] = useState<File[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [view, setView] = useState<"manual" | "ai-scan">("manual");
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      full_name: "",
      phone_number: "",
      email: "",
      address: "",
      remarks: "",
      group_id: "",
      birthdate: "",
      date_of_registration: new Date().toISOString().split("T")[0],
      civil_status: "",
      gender: "",
    },
  });

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    const newCompressedFiles: File[] = [];

    const options = {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
      initialQuality: 0.6,
    };

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!file.type.startsWith("image/")) {
          newCompressedFiles.push(file);
          continue;
        }

        try {
          const compressedBlob = await imageCompression(file, options);
          const finalFile = new File([compressedBlob], file.name, {
            type: file.type,
            lastModified: new Date().getTime(),
          });
          newCompressedFiles.push(finalFile);
        } catch (err) {
          console.error(
            `Skipping compression for ${file.name} due to error:`,
            err
          );
          newCompressedFiles.push(file);
        }
      }

      setCompressedFiles((prev) => [...prev, ...newCompressedFiles]);
    } catch (error) {
      console.error("Batch upload failed:", error);
    } finally {
      setIsCompressing(false);
      event.target.value = "";
    }
  };

  const removeFile = (indexToRemove: number) => {
    setCompressedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };
  
  const handleAiScan = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAiProcessing(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/ai/extract-customer", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("AI extraction failed");
      }

      const data = await response.json();

      // Auto-fill form fields
      if (data.full_name) setValue("full_name", data.full_name);
      if (data.phone_number) setValue("phone_number", data.phone_number);
      if (data.email) setValue("email", data.email);
      if (data.address) setValue("address", data.address);
      if (data.birthdate) setValue("birthdate", data.birthdate);
      if (data.civil_status) setValue("civil_status", data.civil_status);
      if (data.gender) setValue("gender", data.gender);
      if (data.remarks) setValue("remarks", data.remarks);

      // Add the scanned document to the compressed files list
      setCompressedFiles((prev) => [...prev, file]);

      // Switch back to manual view for review
      setView("manual");
    } catch (error) {
      console.error("AI Scan Error:", error);
      alert("Failed to extract information from the document. Please try again or enter manually.");
    } finally {
      setIsAiProcessing(false);
      event.target.value = "";
    }
  };

  const onSubmit: SubmitHandler<CustomerFormValues> = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          formData.append(key, value as string);
        }
      });

      compressedFiles.forEach((file) => {
        formData.append("documents", file);
      });

      await createCustomer(formData);
      await refreshData();
      reset();
      setCompressedFiles([]);
      onSuccess();
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {/* View Switcher */}
        <div className="flex bg-slate-950/50 mb-6 p-1 border border-slate-800 rounded-xl">
          <button
            onClick={() => setView("manual")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              view === "manual"
                ? "bg-slate-800 text-white shadow-lg"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="w-4 h-4" />
            Manual Input
          </button>
          <button
            onClick={() => setView("ai-scan")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              view === "ai-scan"
                ? "bg-cyan-600 text-white shadow-lg"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Scan className="w-4 h-4" />
            AI Scan Auto Fill
          </button>
        </div>

        {view === "manual" ? (
          <form
            id="customer-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
          {/* ROW 1: Name & Phone */}
          <div className="gap-4 grid md:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-medium text-slate-300 text-sm">
                <User className="w-4 h-4 text-cyan-400" /> Full Name
              </label>
              <input
                {...register("full_name")}
                className="bg-slate-950/50 focus:bg-slate-950 px-4 py-3 border border-slate-800 focus:border-cyan-500/50 rounded-xl focus:outline-none w-full text-white placeholder:text-slate-600 transition-all"
                placeholder="e.g. Juan Dela Cruz"
              />
              {errors.full_name && (
                <p className="text-red-400 text-xs">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 font-medium text-slate-300 text-sm">
                <Phone className="w-4 h-4 text-cyan-400" /> Phone Number
              </label>
              <input
                {...register("phone_number")}
                className="bg-slate-950/50 focus:bg-slate-950 px-4 py-3 border border-slate-800 focus:border-cyan-500/50 rounded-xl focus:outline-none w-full text-white placeholder:text-slate-600 transition-all"
                placeholder="0912 345 6789"
              />
            </div>
          </div>

          {/* ROW 2: Email & Group */}
          <div className="gap-4 grid md:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-medium text-slate-300 text-sm">
                <Mail className="w-4 h-4 text-cyan-400" /> Email Address
              </label>
              <input
                type="email"
                {...register("email")}
                className="bg-slate-950/50 focus:bg-slate-950 px-4 py-3 border border-slate-800 focus:border-cyan-500/50 rounded-xl focus:outline-none w-full text-white placeholder:text-slate-600 transition-all"
                placeholder="juan@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 font-medium text-slate-300 text-sm">
                <Users className="w-4 h-4 text-cyan-400" /> Customer Group
              </label>
              <select
                {...register("group_id")}
                className="bg-slate-950/50 focus:bg-slate-950 px-4 py-3 border border-slate-800 focus:border-cyan-500/50 rounded-xl focus:outline-none w-full text-white placeholder:text-slate-600 transition-all appearance-none"
              >
                <option value="">Select Group (Optional)</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ROW 3: Address */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-medium text-slate-300 text-sm">
              <MapPin className="w-4 h-4 text-cyan-400" /> Complete Address
            </label>
            <input
              {...register("address")}
              className="bg-slate-950/50 focus:bg-slate-950 px-4 py-3 border border-slate-800 focus:border-cyan-500/50 rounded-xl focus:outline-none w-full text-white placeholder:text-slate-600 transition-all"
              placeholder="House No, Street, Barangay, City"
            />
          </div>

          {/* ROW 4: Dates */}
          <div className="gap-4 grid md:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-medium text-slate-300 text-sm">
                <Calendar className="w-4 h-4 text-cyan-400" /> Birthdate
              </label>
              <input
                type="date"
                {...register("birthdate")}
                className="bg-slate-950/50 focus:bg-slate-950 px-4 py-3 border border-slate-800 focus:border-cyan-500/50 rounded-xl focus:outline-none w-full text-white placeholder:text-slate-600 transition-all scheme-dark"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-medium text-slate-300 text-sm">
                <Calendar className="w-4 h-4 text-cyan-400" /> Registration
                Date
              </label>
              <input
                type="date"
                {...register("date_of_registration")}
                className="bg-slate-950/50 focus:bg-slate-950 px-4 py-3 border border-slate-800 focus:border-cyan-500/50 rounded-xl focus:outline-none w-full text-white placeholder:text-slate-600 transition-all scheme-dark"
              />
            </div>
          </div>

          {/* ROW 5: Civil Status & Gender */}
          <div className="gap-4 grid md:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-medium text-slate-300 text-sm">
                <Heart className="w-4 h-4 text-cyan-400" /> Civil Status
              </label>
              <select
                {...register("civil_status")}
                className="bg-slate-950/50 focus:bg-slate-950 px-4 py-3 border border-slate-800 focus:border-cyan-500/50 rounded-xl focus:outline-none w-full text-white placeholder:text-slate-600 transition-all appearance-none"
              >
                <option value="">Select Status (Optional)</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Divorced">Divorced</option>
                <option value="Separated">Separated</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 font-medium text-slate-300 text-sm">
                <User className="w-4 h-4 text-cyan-400" /> Gender
              </label>
              <select
                {...register("gender")}
                className="bg-slate-950/50 focus:bg-slate-950 px-4 py-3 border border-slate-800 focus:border-cyan-500/50 rounded-xl focus:outline-none w-full text-white placeholder:text-slate-600 transition-all appearance-none"
              >
                <option value="">Select Gender (Optional)</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Not Specified">Not Specified</option>
              </select>
            </div>
          </div>

          {/* ROW 5: Remarks */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-medium text-slate-300 text-sm">
              <FileText className="w-4 h-4 text-cyan-400" /> Remarks / Notes
            </label>
            <textarea
              {...register("remarks")}
              rows={2}
              className="bg-slate-950/50 focus:bg-slate-950 px-4 py-3 border border-slate-800 focus:border-cyan-500/50 rounded-xl focus:outline-none w-full text-white placeholder:text-slate-600 transition-all resize-none"
              placeholder="Any additional info..."
            />
          </div>

          {/* ROW 6: DOCUMENT UPLOAD (Auto-Compress) */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-medium text-slate-300 text-sm">
              <Upload className="w-4 h-4 text-cyan-400" /> Documents / ID
            </label>

            <div className="group relative">
              <div
                className={`flex flex-col justify-center items-center border-2 border-dashed ${
                  isCompressing
                    ? "border-cyan-500/50 bg-cyan-500/5 cursor-wait"
                    : "border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/50 cursor-pointer"
                } rounded-xl h-32 transition-all`}
              >
                {isCompressing ? (
                  <div className="flex flex-col items-center animate-pulse">
                    <Loader2 className="mb-2 w-8 h-8 text-cyan-400 animate-spin" />
                    <p className="font-medium text-cyan-400 text-sm">
                      Compressing & Optimizing...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="bg-slate-800 mb-2 p-3 rounded-full text-cyan-400 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="font-medium text-slate-300 text-sm">
                      Click to upload documents
                    </p>
                    <p className="text-slate-500 text-xs">
                      Images are auto-compressed (Max 200kb)
                    </p>
                  </>
                )}
              </div>
              <input
                type="file"
                multiple
                disabled={isCompressing}
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0"
                accept="image/*,application/pdf"
              />
            </div>

            {/* Uploaded Files Preview List */}
            {compressedFiles.length > 0 && (
              <div className="gap-2 grid grid-cols-1 sm:grid-cols-2 mt-2">
                {compressedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="slide-in-from-bottom-2 flex justify-between items-center bg-slate-800/50 px-3 py-2 border border-slate-700 rounded-lg animate-in fade-in"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-medium text-slate-300 text-xs truncate">
                          {file.name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {(file.size / 1024).toFixed(0)} KB
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="hover:bg-red-500/20 p-1 rounded text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            </div>
          </form>
        ) : (
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
        )}
      </div>

      {/* Footer Actions */}
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
    </>
  );
};
