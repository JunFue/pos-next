// ItemReg.tsx
// (Updated to use useInsertItem hook for data persistence)

"use client";

import React, { useState } from "react";
import { ItemForm } from "./ItemForm";
import { ItemTable } from "./ItemTable";
import { Item } from "../utils/itemTypes";
import { useInsertItem } from "../hooks/useItemApi";

const ItemReg = () => {
  const [data, setData] = useState<Item[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // 2. Initialize the mutation hook
  const insertItemMutation = useInsertItem();

  // MOCK IDs: Replace these with actual values from your auth/app context
  const currentAdminId = "d0e9c39a-7f23-4a8b-9c4d-1e2f3a4b5c6d"; // Example UUID
  const currentStoreId = "a1b2c3d4-e5f6-7890-1234-567890abcdef"; // Example UUID

  const handleFormSubmit = (formData: Item) => {
    // --- DUPLICATE CHECK (Keep existing local check for immediate feedback) ---
    const isDuplicate = data.some((item, index) => {
      if (editingIndex !== null && index === editingIndex) {
        return false;
      }
      return (
        item.itemName.toLowerCase() === formData.itemName.toLowerCase() ||
        item.sku.toLowerCase() === formData.sku.toLowerCase()
      );
    });

    if (isDuplicate) {
      alert("Error: An item with this Name or SKU already exists.");
      return;
    }

    if (editingIndex !== null) {
      // --- UPDATE LOGIC (Local only for now, implement update hook later) ---
      setData((prevData) =>
        prevData.map((item, index) =>
          index === editingIndex ? formData : item
        )
      );
      setEditingIndex(null);
    } else {
      // --- INSERT LOGIC (Using Supabase Hook) ---
      insertItemMutation.mutate(
        {
          ...formData,
          admin_user_id: currentAdminId,
          stores_id: currentStoreId,
        },
        {
          onSuccess: () => {
            // On success, update local state for immediate UI feedback.
            // Later, when you have a fetch query, you can just rely on
            // invalidating that query instead of manually updating local state here.
            setData((prevData) => [...prevData, formData]);
            // Optional: Success message
            // alert("Item saved successfully to database!");
          },
          onError: (error) => {
            // Handle error (e.g., network error, database constraint violation not caught locally)
            alert(`Failed to save item to database: ${error.message}`);
          },
        }
      );
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setData((prevData) => prevData.filter((_, i) => i !== index));
      if (editingIndex === index) {
        setEditingIndex(null);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const itemToEdit = editingIndex !== null ? data[editingIndex] : undefined;

  return (
    <div className="space-y-8 p-6 glass-effect">
      {/* Optionally show a loading indicator if mutation is pending */}
      {insertItemMutation.isPending && (
        <div className="text-blue-400 text-sm animate-pulse">
          Saving item to database...
        </div>
      )}

      <ItemForm
        onFormSubmit={handleFormSubmit}
        itemToEdit={itemToEdit}
        onCancelEdit={handleCancelEdit}
      />
      {data.length > 0 && (
        <ItemTable data={data} onEdit={handleEdit} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default ItemReg;
