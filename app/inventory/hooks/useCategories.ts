import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Category,
  fetchCategories,
  createCategory,
  updateCategory as apiUpdate,
  deleteCategory as apiDelete,
} from "../components/item-registration/lib/categories.api";

export function useCategories() {
  const queryClient = useQueryClient();

  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => apiUpdate(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: apiDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  return {
    categories,
    isLoading,
    error: error ? (error as Error).message : null,
    addCategory: async (name: string) => createMutation.mutateAsync(name),
    updateCategory: async (id: string, name: string) => updateMutation.mutateAsync({ id, name }),
    deleteCategory: async (id: string) => deleteMutation.mutateAsync(id),
    isProcessing: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}
