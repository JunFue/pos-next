import useSWR, { useSWRConfig } from 'swr';
import { fetchCustomerFeatureData } from '../api/services';
import { useCustomerStore } from '../store/useCustomerStore';

const SWR_KEY = 'customer-feature-data';

export const useCustomerData = () => {
  // SWR automatically uses the fallbackData provided in the parent layout
  const { data, error, isLoading } = useSWR(SWR_KEY, fetchCustomerFeatureData);

  const { searchTerm, selectedGroupId } = useCustomerStore();

  const groups = data?.groups || [];
  const rawCustomers = data?.customers || [];

  // Derive filtered state here so components don't have to calculate it
  const filteredCustomers = rawCustomers.filter((c) => {
    const matchesSearch = 
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.phone_number.includes(searchTerm);
    
    if (!matchesSearch) return false;
    if (selectedGroupId === "all") return true;
    if (selectedGroupId === "ungrouped") return c.group_id === null;
    return c.group_id === selectedGroupId;
  });

  const currentGroupName = 
    selectedGroupId === "all" ? "All Customers" :
    selectedGroupId === "ungrouped" ? "Ungrouped Customers" :
    groups.find(g => g.id === selectedGroupId)?.name || "Unknown";

  return {
    groups,
    customers: filteredCustomers,
    rawCustomers, // useful for counts if needed
    currentGroupName,
    isLoading,
    isError: error,
  };
};

// Hook to handle mutations easily
export const useCustomerMutations = () => {
  const { mutate } = useSWRConfig();
  
  const refreshData = () => mutate(SWR_KEY);

  return { refreshData };
};