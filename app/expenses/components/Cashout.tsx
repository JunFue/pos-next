export function Cashout() {
  return (
    <div className="flex flex-col gap-8">
      {/* --- Form Section --- */}
      <div className="p-6 glass-effect">
        <h2 className="mb-4 font-semibold text-white text-xl">
          Register New Expense
        </h2>
        <form
          className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* Form Fields */}
          <div>
            <label className="block mb-2 font-medium text-slate-300 text-sm">
              Date
            </label>
            <input
              type="date"
              // Using input-dark class from your globals.css
              className="w-full input-dark"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-slate-300 text-sm">
              Source
            </label>
            <input
              type="text"
              placeholder="e.g., Operations Budget"
              className="w-full input-dark"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-slate-300 text-sm">
              Classification
            </label>
            <input
              type="text"
              placeholder="e.g., Office Supplies"
              className="w-full input-dark"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-slate-300 text-sm">
              Amount
            </label>
            <input
              type="number"
              placeholder="0.00"
              className="w-full input-dark"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-slate-300 text-sm">
              Receipt No.
            </label>
            <input
              type="text"
              placeholder="e.g., OR-12345"
              className="w-full input-dark"
            />
          </div>
          <div className="lg:col-span-3">
            <label className="block mb-2 font-medium text-slate-300 text-sm">
              Notes
            </label>
            <textarea
              placeholder="Additional details..."
              className="w-full min-h-20 input-dark"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end lg:col-span-3">
            <button type="submit" className="px-8 btn-3d-glass">
              Submit Expense
            </button>
          </div>
        </form>
      </div>

      {/* --- Table Section --- */}
      <div className="p-6 glass-effect">
        <h3 className="mb-4 font-semibold text-white text-lg">
          Recent Cashouts
        </h3>
        <table className="w-full text-slate-300 text-sm text-left">
          <thead>
            <tr className="border-slate-700 border-b">
              <th className="py-2">Date</th>
              <th className="py-2">Source</th>
              <th className="py-2">Classification</th>
              <th className="py-2">Receipt No.</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {/* Mock Data */}
            <tr>
              <td className="py-3">2025-11-01</td>
              <td className="py-3">Operations</td>
              <td className="py-3">Office Supplies</td>
              <td className="py-3">OR-12345</td>
              <td className="py-3 text-red-400 text-right">-$150.00</td>
            </tr>
            <tr>
              <td className="py-3">2025-11-01</td>
              <td className="py-3">Marketing</td>
              <td className="py-3">Social Media Ads</td>
              <td className="py-3">OR-12346</td>
              <td className="py-3 text-red-400 text-right">-$500.00</td>
            </tr>
            <tr>
              <td className="py-3">2025-10-30</td>
              <td className="py-3">Utilities</td>
              <td className="py-3">Internet Bill</td>
              <td className="py-3">OR-12330</td>
              <td className="py-3 text-red-400 text-right">-$80.00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
