import { create } from 'zustand';

interface CustomerState {
  // Filter State
  selectedGroupId: string | "all" | "ungrouped";
  searchTerm: string;
  setSelectedGroupId: (id: string | "all" | "ungrouped") => void;
  setSearchTerm: (term: string) => void;

  // Modal State
  isGroupModalOpen: boolean;
  isCustomerModalOpen: boolean;
  activeCustomerId: string | null; // For the edit button

  // --- NEW STATE ---
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  
  viewMode: 'list' | 'detail';
  setViewMode: (mode: 'list' | 'detail') => void;
  
  openGroupModal: () => void;
  closeGroupModal: () => void;
  openCustomerModal: () => void;
  closeCustomerModal: () => void;
  openEditCustomer: (id: string) => void; // "Toggle" for edit
}

export const useCustomerStore = create<CustomerState>((set) => ({
  selectedGroupId: "all",
  searchTerm: "",
  isGroupModalOpen: false,
  isCustomerModalOpen: false,
  activeCustomerId: null,
  // --- NEW ACTIONS ---
  selectedCustomerId: null,
  setSelectedCustomerId: (id) => set({ selectedCustomerId: id }),
  
  viewMode: 'list',
  setViewMode: (mode) => set({ viewMode: mode }),

  setSelectedGroupId: (id) => set({ selectedGroupId: id }),
  setSearchTerm: (term) => set({ searchTerm: term }),

  openGroupModal: () => set({ isGroupModalOpen: true }),
  closeGroupModal: () => set({ isGroupModalOpen: false }),
  
  openCustomerModal: () => set({ isCustomerModalOpen: true, activeCustomerId: null }),
  closeCustomerModal: () => set({ isCustomerModalOpen: false, activeCustomerId: null }),
  
  openEditCustomer: (id) => set({ isCustomerModalOpen: true, activeCustomerId: id }),
}));