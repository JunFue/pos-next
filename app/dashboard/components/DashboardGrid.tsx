"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripHorizontal } from "lucide-react";

import CashOnHandCard from "./CashOnHandCard";
import DailyExpensesCard from "./DailyExpensesCard";
import DailyGrossIncomeCard from "./DailyGrossIncomeCard";
import MonthlyGrossCard from "./MonthlyGrossCard";
import { DashboardMetrics } from "../hooks/useDashboardMetrics";

// 1. Sortable Wrapper Component
const SortableItem = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group h-full">
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-4 right-4 z-20 p-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity bg-slate-700/50 hover:bg-slate-600 rounded-lg text-slate-300"
      >
        <GripHorizontal className="w-5 h-5" />
      </div>
      <div className="h-full">{children}</div>
    </div>
  );
};

// 2. Main Grid Interface
interface DashboardGridProps {
  metrics: DashboardMetrics;
  items: string[];
  onOrderChange: (newOrder: string[]) => void;
}

export const DashboardGrid = ({ metrics, items, onOrderChange }: DashboardGridProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      onOrderChange(arrayMove(items, oldIndex, newIndex));
    }
  };

  const renderCard = (id: string) => {
    switch (id) {
      case "cash-on-hand":
        return <CashOnHandCard totalNetSales={metrics.totalNetSales} cashFlow={metrics.cashFlow} />;
      case "daily-gross":
        return <DailyGrossIncomeCard cashFlow={metrics.cashFlow} />;
      case "daily-expenses":
        return <DailyExpensesCard totalExpenses={metrics.totalExpenses} cashFlow={metrics.cashFlow} />;
      case "monthly-gross":
        return <MonthlyGrossCard />;
      default:
        return null;
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((id) => (
            <SortableItem key={id} id={id}>
              {renderCard(id)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};