"use client";

import React, { useState, useMemo, useEffect } from "react";
import { X, Search, Package } from "lucide-react";
import { Item } from "@/app/inventory/components/item-registration/utils/itemTypes";
import { useItems } from "@/app/inventory/hooks/useItems";
import { ErrorMessage } from "../components/ErrorMessage";

interface FreeItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: Item, quantity: number) => void;
  isTabletMode?: boolean;
}

export const FreeItemModal = ({ isOpen, onClose, onSelect, isTabletMode }: FreeItemModalProps) => {
  const { items, isLoading } = useItems();
  const [searchTerm, setSearchTerm] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);

  const qtyInputRef = React.useRef<HTMLInputElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const filteredItems = useMemo(() => {
    if (!searchTerm) {
        return [];
    }
    const lowerSearch = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        item.itemName.toLowerCase().includes(lowerSearch) ||
        item.sku.toLowerCase().includes(lowerSearch)
    );
  }, [items, searchTerm]);

  // Handle Virtual Keyboard Events
  useEffect(() => {
    if (!isOpen) return;

    const handleVirtualKey = (e: CustomEvent<{ key: string }>) => {
      e.preventDefault(); // Stop main form from handling it!
      const { key } = e.detail;

      if (key === "Enter") {
        if (document.activeElement === qtyInputRef.current) {
          handleSubmit();
        } else {
          // If searching, simulate Enter behavior
          const item = filteredItems[highlightedIndex];
          if (item) {
            setSelectedItem(item);
            setTimeout(() => qtyInputRef.current?.focus(), 10);
          }
        }
        return;
      }

      if (document.activeElement === qtyInputRef.current) {
        if (key === "Backspace") {
          setQuantity(prev => {
            const str = String(prev).slice(0, -1);
            return str ? parseInt(str) : "";
          });
        } else if (!isNaN(Number(key))) {
          setQuantity(prev => parseInt(String(prev || "") + key));
        }
      } else {
        // Assume search input is focused (or default to it)
        if (key === "Backspace") {
          setSearchTerm(prev => prev.slice(0, -1));
        } else {
          setSearchTerm(prev => prev + key);
        }
      }
    };

    const handleVirtualClear = (e: CustomEvent) => {
      e.preventDefault();
      if (document.activeElement === qtyInputRef.current) {
         setQuantity("");
      } else {
         setSearchTerm("");
      }
    };

    window.addEventListener("virtual-keypress", handleVirtualKey as EventListener);
    window.addEventListener("virtual-keyclear", handleVirtualClear as EventListener);
    return () => {
      window.removeEventListener("virtual-keypress", handleVirtualKey as EventListener);
      window.removeEventListener("virtual-keyclear", handleVirtualClear as EventListener);
    };
  }, [isOpen, filteredItems, highlightedIndex, quantity, searchTerm, selectedItem]);

  // Reset highlighted index when search results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm, items]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (filteredItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filteredItems[highlightedIndex];
      if (item) {
        setSelectedItem(item);
        // Small timeout to ensure focus works
        setTimeout(() => qtyInputRef.current?.focus(), 10);
      }
    }
  };

  const handleQtyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!selectedItem) {
        setError("Please select an item first");
        return;
    }

    if (!quantity || quantity <= 0) {
      setError("Quantity should not be zero or empty");
      return;
    }

    onSelect(selectedItem, Number(quantity));
    // Reset states
    setSearchTerm("");
    setQuantity("");
    setSelectedItem(null);
    setHighlightedIndex(0);
    setError(null);
  };

  if (!isOpen) return null;

  const content = (
    <div className={`bg-card w-full flex flex-col transition-all ${isTabletMode ? 'h-full shadow-sm rounded-2xl border border-border' : 'max-w-lg rounded-2xl shadow-xl max-h-[80vh] border border-border'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between border-b border-border bg-muted/20 shrink-0 ${isTabletMode ? 'p-6' : 'p-4'}`}>
        <h2 className={`${isTabletMode ? 'text-2xl' : 'text-xl'} font-bold text-foreground flex items-center gap-2`}>
          <span className="text-primary">🎁</span> Select Free Item
        </h2>
        <button
          onClick={onClose}
          className={isTabletMode ? 'p-2 bg-muted rounded-full hover:bg-muted/80 text-muted-foreground transition-all' : 'text-muted-foreground hover:text-foreground transition-colors'}
        >
          <X size={24} />
        </button>
      </div>
      {/* Content */}
      <div className="p-4 flex flex-col gap-4 overflow-hidden bg-card flex-1">
        {/* Controls: Search + Quantity */}
        <div className="flex gap-2 shrink-0">
          <div className={`relative flex-1 ${selectedItem ? "opacity-50 pointer-events-none" : ""}`}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
              ref={searchInputRef}
              type="text"
              placeholder="Search item..."
              className="w-full bg-muted/30 border border-input text-foreground pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-primary transition-colors focus:ring-1 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              autoFocus
              disabled={!!selectedItem}
              inputMode={isTabletMode ? "none" : undefined}
              />
          </div>
          <div className="w-24">
              <input
                  ref={qtyInputRef}
                  type="number"
                  min="1"
                  placeholder="Qty"
                  className="w-full h-full bg-muted/30 border border-input text-foreground text-center font-bold text-lg rounded-xl focus:outline-none focus:border-primary transition-colors focus:ring-1 focus:ring-primary"
                  value={quantity}
                  onChange={(e) => {
                      const val = e.target.value === "" ? "" : parseInt(e.target.value);
                      setQuantity(val);
                  }}
                  onKeyDown={handleQtyKeyDown}
                  disabled={!selectedItem}
                  inputMode={isTabletMode ? "none" : undefined}
              />
          </div>
        </div>

        {/* Selected Item Notification */}
        {selectedItem && (
            <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                        Selected: <span className="font-bold">{selectedItem.itemName}</span>
                    </span>
                </div>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                    Change
                </button>
            </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto min-h-[300px] flex flex-col gap-2">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">Loading items...</div>
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => {
                    setSelectedItem(item);
                    setTimeout(() => qtyInputRef.current?.focus(), 10);
                }}
                className={`flex items-center justify-between p-3 border rounded-xl transition-all group text-left
                  ${highlightedIndex === index 
                      ? "bg-primary/20 border-primary shadow-sm" 
                      : "bg-muted/50 border-border hover:bg-primary/10 hover:border-primary/50"}
                `}
              >
                <div>
                  <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                    {item.itemName}
                  </div>
                  <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>
                </div>
                <div className="text-primary font-bold">FREE</div>
              </button>
            ))
          ) : (
              searchTerm ? (
                   <div className="text-center text-muted-foreground py-8">No items found.</div>
              ) : (
                  <div className="text-center text-muted-foreground py-8">Type to search for items</div>
              )
           
          )}
        </div>
      </div>

      <div className="shrink-0 p-4 pt-0">
          <ErrorMessage message={error} onClose={() => setError(null)} />
      </div>
    </div>
  );

  return isTabletMode ? content : (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {content}
    </div>
  );
};
