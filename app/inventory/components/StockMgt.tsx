import React from "react";

// Dummy data for the table
const dummyStock = [
  {
    id: 1,
    sku: "12345-ABC",
    name: "Product A",
    category: "Electronics",
    inStock: 150,
    alert: 20,
  },
  {
    id: 2,
    sku: "67890-DEF",
    name: "Product B",
    category: "Apparel",
    inStock: 75,
    alert: 10,
  },
  {
    id: 3,
    sku: "11223-GHI",
    name: "Product C",
    category: "Groceries",
    inStock: 8,
    alert: 15,
  },
  {
    id: 4,
    sku: "44556-JKL",
    name: "Product D",
    category: "Electronics",
    inStock: 200,
    alert: 25,
  },
];

const StockMgt = () => {
  return (
    <div className="p-6 glass-effect">
      <h2 className="mb-6 font-semibold text-xl">Manage Item Stocks</h2>

      {/* Search/Filter Bar */}
      <div className="mb-4">
        <input
          type="text"
          className="w-full md:w-1/2 input-dark"
          placeholder="Search by item name or SKU..."
        />
      </div>

      {/* Stocks Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-slate-700 border-b text-slate-400">
              <th className="py-3 pr-3">SKU</th>
              <th className="py-3 pr-3">Name</th>
              <th className="py-3 pr-3">Category</th>
              <th className="py-3 pr-3 text-right">In Stock</th>
              <th className="py-3 pr-3 text-right">Alert Level</th>
              <th className="py-3 pl-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {dummyStock.map((item) => (
              <tr key={item.id}>
                <td className="py-3 pr-3 font-mono">{item.sku}</td>
                <td className="py-3 pr-3">{item.name}</td>
                <td className="py-3 pr-3">{item.category}</td>
                <td
                  className={`py-3 pr-3 text-right font-medium ${
                    item.inStock < item.alert
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  {item.inStock}
                </td>
                <td className="py-3 pr-3 text-right">{item.alert}</td>
                <td className="py-3 pl-3 text-right">
                  <button className="font-medium text-blue-400 hover:text-blue-300 text-xs">
                    Adjust
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockMgt;
