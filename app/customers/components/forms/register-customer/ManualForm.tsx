import { UseFormRegister, FieldErrors } from "react-hook-form";
import { User, Phone, Mail, Users, MapPin, Calendar, Heart, FileText } from "lucide-react";
import { CustomerFormValues, CustomerGroup } from "../../../lib/types";

interface ManualFormProps {
  register: UseFormRegister<CustomerFormValues>;
  errors: FieldErrors<CustomerFormValues>;
  groups: CustomerGroup[];
}

export const ManualForm = ({ register, errors, groups }: ManualFormProps) => {
  return (
    <div className="space-y-6">
      {/* ROW 1: Name & Phone */}
      <div className="gap-4 grid md:grid-cols-2">
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium text-slate-300 text-sm">
            <User className="w-4 h-4 text-cyan-400" /> Full Name *
          </label>
          <input
            {...register("full_name")}
            className={`bg-slate-950/50 focus:bg-slate-950 px-4 py-3 border ${errors.full_name ? 'border-red-500/50' : 'border-slate-800'} focus:border-cyan-500/50 rounded-xl focus:outline-none w-full text-white placeholder:text-slate-600 transition-all`}
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
            <Users className="w-4 h-4 text-cyan-400" /> Customer Group *
          </label>
          <select
            {...register("group_id")}
            className={`bg-slate-950/50 focus:bg-slate-950 px-4 py-3 border ${errors.group_id ? 'border-red-500/50' : 'border-slate-800'} focus:border-cyan-500/50 rounded-xl focus:outline-none w-full text-white placeholder:text-slate-600 transition-all appearance-none`}
          >
            <option value="">Select Group</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          {errors.group_id && (
            <p className="text-red-400 text-xs">
              {errors.group_id.message}
            </p>
          )}
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
            <Calendar className="w-4 h-4 text-cyan-400" /> Birthdate *
          </label>
          <input
            type="date"
            {...register("birthdate")}
            className={`bg-slate-950/50 focus:bg-slate-950 px-4 py-3 border ${errors.birthdate ? 'border-red-500/50' : 'border-slate-800'} focus:border-cyan-500/50 rounded-xl focus:outline-none w-full text-white placeholder:text-slate-600 transition-all scheme-dark`}
          />
          {errors.birthdate && (
            <p className="text-red-400 text-xs">
              {errors.birthdate.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium text-slate-300 text-sm">
            <Calendar className="w-4 h-4 text-cyan-400" /> Registration Date *
          </label>
          <input
            type="date"
            {...register("date_of_registration")}
            className={`bg-slate-950/50 focus:bg-slate-950 px-4 py-3 border ${errors.date_of_registration ? 'border-red-500/50' : 'border-slate-800'} focus:border-cyan-500/50 rounded-xl focus:outline-none w-full text-white placeholder:text-slate-600 transition-all scheme-dark`}
          />
          {errors.date_of_registration && (
            <p className="text-red-400 text-xs">
              {errors.date_of_registration.message}
            </p>
          )}
        </div>
      </div>

      {/* ROW 5: Civil Status & Gender */}
      <div className="gap-4 grid md:grid-cols-2">
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium text-slate-300 text-sm">
            <Heart className="w-4 h-4 text-cyan-400" /> Civil Status *
          </label>
          <select
            {...register("civil_status")}
            className={`bg-slate-950/50 focus:bg-slate-950 px-4 py-3 border ${errors.civil_status ? 'border-red-500/50' : 'border-slate-800'} focus:border-cyan-500/50 rounded-xl focus:outline-none w-full text-white placeholder:text-slate-600 transition-all appearance-none`}
          >
            <option value="">Select Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Widowed">Widowed</option>
            <option value="Divorced">Divorced</option>
            <option value="Separated">Separated</option>
          </select>
          {errors.civil_status && (
            <p className="text-red-400 text-xs">
              {errors.civil_status.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium text-slate-300 text-sm">
            <User className="w-4 h-4 text-cyan-400" /> Gender *
          </label>
          <select
            {...register("gender")}
            className={`bg-slate-950/50 focus:bg-slate-950 px-4 py-3 border ${errors.gender ? 'border-red-500/50' : 'border-slate-800'} focus:border-cyan-500/50 rounded-xl focus:outline-none w-full text-white placeholder:text-slate-600 transition-all appearance-none`}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Not Specified">Not Specified</option>
          </select>
          {errors.gender && (
            <p className="text-red-400 text-xs">
              {errors.gender.message}
            </p>
          )}
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
    </div>
  );
};
