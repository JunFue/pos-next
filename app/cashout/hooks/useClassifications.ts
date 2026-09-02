import { useQuery } from "@tanstack/react-query";
import { fetchClassifications } from "../lib/cashout.api";

export function useClassifications() {
  const {
    data: classifications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["classifications"],
    queryFn: fetchClassifications,
  });

  return {
    classifications,
    isLoading,
    error: error ? (error as Error).message : null,
  };
}
