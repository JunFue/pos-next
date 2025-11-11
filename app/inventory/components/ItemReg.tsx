"use client";

import React, { useState } from "react";
import { ItemForm } from "./ItemForm";
import { ItemTable } from "./ItemTable";
import { Item } from "../utils/itemTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

// --- Supabase Insertion Function (WITH NEW LOGGING) ---
const insertItem = async (item: Item) => {
  // --- LOG 8.1 ---
  console.log("Inside insertItem function. Received item:", item);

  // Destructure to omit 'id' from the payload for insertion
  const {
    id, // Omitted
    itemName,
    sku,
    category,
    costPrice,
    description,
  } = item;

  // Create the payload for Supabase
  const insertPayload = {
    item_name: itemName,
    sku: sku,
    category: category,
    cost_price: costPrice,
    description: description,
  };

  // --- LOG 8.2 (THE MOST IMPORTANT ONE) ---
  console.log("Payload being sent to INSERT:", insertPayload);

  const { data, error } = await supabase
    .from("items")
    .insert(insertPayload) // Send the payload *without* 'id'
    .select()
    .single();

  if (error) {
    // --- LOG 8.3 ---
    console.error("Supabase call threw an error inside insertItem:", error);
    throw error;
  }

  // --- LOG 8.4 ---
  console.log("Insert call was successful.");
  return data;
};
// --- End of insertItem function ---

// --- Component Start ---
const ItemReg = () => {
  const [data, setData] = useState<Item[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const queryClient = useQueryClient();

  React.useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("CURRENTLY LOGGED IN AS:", user);

      if (user) {
        // You can also run the RLS check manually
        const { data: member, error } = await supabase
          .from("members")
          .select("user_id")
          .eq("user_id", user.id)
          .single();

        if (member) {
          console.log(
            "This user IS in the members table. Inserts should work."
          );
        } else {
          console.error(
            "THIS USER IS NOT IN THE MEMBERS TABLE. RLS will fail."
          );
        }
      }
    };
    checkUser();
  }, []);

  // --- MUTATION HOOK (with logging from previous step) ---
  const itemMutation = useMutation({
    mutationFn: async (itemData: Item) => {
      // --- LOG 1 ---
      console.log("Mutation function has started.");

      const { id, ...itemPayload } = itemData;

      if (editingIndex !== null) {
        // --- LOG 2 ---
        console.log("Entering UPDATE logic...");

        const idToUpdate = data[editingIndex]?.id;

        if (!idToUpdate) {
          // --- LOG 3 ---
          console.error(
            "Update failed: ID was missing *before* Supabase call."
          );
          throw new Error("Item ID not found for update.");
        }

        // --- LOG 4 ---
        console.log(`Preparing to update row with ID: ${idToUpdate}`);

        const updatePayload = {
          item_name: itemPayload.itemName,
          sku: itemPayload.sku,
          category: itemPayload.category,
          cost_price: itemPayload.costPrice,
          description: itemPayload.description,
        };

        // --- LOG 5 ---
        console.log("Payload being sent to UPDATE:", updatePayload);

        const { data: updatedData, error } = await supabase
          .from("items")
          .update(updatePayload)
          .eq("id", idToUpdate)
          .select()
          .single();

        if (error) {
          // --- LOG 6 ---
          console.error("Supabase call threw an error:", error);
          throw error;
        }

        // --- LOG 7 ---
        console.log("Update call was successful.");
        return updatedData;
      } else {
        // --- LOG 8 ---
        console.log("Entering INSERT logic... (calling insertItem)");
        return insertItem(itemData); // Call the separate function
      }
    },
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ["items"] });

      if (editingIndex !== null) {
        setData((prevData) =>
          prevData.map((item, i) =>
            i === editingIndex ? (newItem as Item) : item
          )
        );
        console.log("Item updated successfully!");
      } else {
        setData((prevData) => [...prevData, newItem as Item]);
        console.log("New Item registered successfully!");
      }
      setEditingIndex(null);
    },
    onError: (error) => {
      // --- LOG 9 (This is what you're seeing) ---
      console.error("This log is from the 'onError' handler:", error);
      alert(`Operation failed: ${error.message}`);
    },
  });

  // --- Rest of Component ---
  const handleFormSubmit = (formData: Item) => {
    itemMutation.mutate(formData);
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
      // TODO: Implement the Supabase DELETE mutation here
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const itemToEdit = editingIndex !== null ? data[editingIndex] : undefined;
  const isLoading = itemMutation.isPending;

  return (
    <div className="space-y-8 p-6 glass-effect">
      <ItemForm
        onFormSubmit={handleFormSubmit}
        itemToEdit={itemToEdit}
        onCancelEdit={handleCancelEdit}
      />
      {isLoading && <p className="text-blue-400 text-center">Processing...</p>}
      {data.length > 0 && (
        <ItemTable data={data} onEdit={handleEdit} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default ItemReg;
