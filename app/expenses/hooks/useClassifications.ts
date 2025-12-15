import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Classification,
  fetchClassifications,
  createClassification,
  updateClassification,
  deleteClassification,
} from "../lib/expenses.api";

export function useClassifications() {
  const queryClient = useQueryClient();

  const {
    data: classifications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["classifications"],
    queryFn: fetchClassifications,
  });

  const createMutation = useMutation({
    mutationFn: createClassification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classifications"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateClassification(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classifications"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClassification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classifications"] });
    },
  });

  return {
    classifications,
    isLoading,
    error: error ? (error as Error).message : null,
    addClassification: async (name: string) => createMutation.mutateAsync(name),
    editClassification: async (id: string, name: string) => updateMutation.mutateAsync({ id, name }),
    removeClassification: async (id: string) => deleteMutation.mutateAsync(id),
    isProcessing: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}
