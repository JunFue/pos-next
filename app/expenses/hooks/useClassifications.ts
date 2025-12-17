import useSWR, { useSWRConfig } from "swr";
import { useState } from "react";
import {
  Classification,
  fetchClassifications,
  createClassification,
  updateClassification,
  deleteClassification,
} from "../lib/expenses.api";

export function useClassifications() {
  const { mutate } = useSWRConfig();
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    data: classifications = [],
    isLoading,
    error,
  } = useSWR("classifications", fetchClassifications);

  const addClassification = async (name: string) => {
    setIsProcessing(true);
    try {
      await createClassification(name);
      mutate("classifications");
    } finally {
      setIsProcessing(false);
    }
  };

  const editClassification = async (id: string, name: string) => {
    setIsProcessing(true);
    try {
      await updateClassification(id, name);
      mutate("classifications");
    } finally {
      setIsProcessing(false);
    }
  };

  const removeClassification = async (id: string) => {
    setIsProcessing(true);
    try {
      await deleteClassification(id);
      mutate("classifications");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    classifications,
    isLoading,
    error: error ? (error as Error).message : null,
    addClassification,
    editClassification,
    removeClassification,
    isProcessing,
  };
}
