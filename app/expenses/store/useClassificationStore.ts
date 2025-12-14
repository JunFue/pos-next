import { create } from "zustand";
import {
  Classification,
  fetchClassifications,
  createClassification,
  updateClassification,
  deleteClassification,
} from "../lib/expenses.api";

interface ClassificationState {
  classifications: Classification[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchClassifications: () => Promise<void>;
  addClassification: (name: string) => Promise<void>;
  editClassification: (id: string, name: string) => Promise<void>;
  removeClassification: (id: string) => Promise<void>;
}

export const useClassificationStore = create<ClassificationState>((set, get) => ({
  classifications: [],
  loading: false,
  error: null,

  fetchClassifications: async () => {
    // Avoid re-fetching if already loaded? 
    // For now, let's allow re-fetch but maybe we can add a check if needed later.
    // The user specifically mentioned "zombie state", which usually implies 
    // data not being in sync or components holding onto stale local state.
    // A global store ensures everyone sees the same data.
    
    set({ loading: true, error: null });
    try {
      const data = await fetchClassifications();
      set({ classifications: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addClassification: async (name: string) => {
    set({ loading: true, error: null });
    try {
      await createClassification(name);
      // Re-fetch to ensure we have the latest ID and data from DB
      await get().fetchClassifications();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err; // Re-throw so component can handle UI feedback if needed
    }
  },

  editClassification: async (id: string, name: string) => {
    set({ loading: true, error: null });
    try {
      await updateClassification(id, name);
      await get().fetchClassifications();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  removeClassification: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await deleteClassification(id);
      await get().fetchClassifications();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
