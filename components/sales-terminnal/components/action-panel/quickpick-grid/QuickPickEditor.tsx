import React, { useState, useEffect } from 'react';
import { useItems } from '@/app/inventory/hooks/useItems';
import { QuickPickItem } from './hooks/useQuickPickItems';
import { Item } from '@/app/inventory/components/item-registration/utils/itemTypes';

type QuickPickItemInput = Omit<QuickPickItem, 'id'>;

interface QuickPickEditorProps {
  isOpen: boolean;
  onClose: () => void;
  currentItems: QuickPickItem[];
  onSave: (items: QuickPickItemInput[]) => Promise<void>;
}

export const QuickPickEditor = ({ isOpen, onClose, currentItems, onSave }: QuickPickEditorProps) => {
  const { items: inventoryItems, isLoading: isLoadingInventory } = useItems();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<QuickPickItemInput[]>([]);
  const [activeTab, setActiveTab] = useState<'select' | 'customize'>('select');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Initialize selected items from current items
      // We need to map them back to the structure we use for editing
      const initialSelection = currentItems.map(item => ({
        item_id: item.item_id,
        label: item.label,
        color: item.color,
        image_url: item.image_url,
        position: item.position,
        item: item.item // Keep the joined item data for display
      }));
      setSelectedItems(initialSelection);
      setActiveTab('select');
    }
  }, [isOpen, currentItems]);

  const filteredInventory = inventoryItems.filter(item => 
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleItem = (item: Item) => {
    if (!item.id) return;

    const isSelected = selectedItems.some(si => si.item_id === item.id);
    
    if (isSelected) {
      setSelectedItems(prev => prev.filter(si => si.item_id !== item.id));
    } else {
      if (selectedItems.length >= 20) {
        alert("You can only select up to 20 items.");
        return;
      }
      // Add new item with default settings
      setSelectedItems(prev => [...prev, {
        item_id: item.id!,
        label: item.itemName,
        color: 'bg-blue-500',
        position: prev.length,
        item: item
      }]);
    }
  };

  const handleUpdateItem = (index: number, updates: Partial<QuickPickItemInput>) => {
    setSelectedItems(prev => prev.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    ));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(selectedItems);
      onClose();
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 w-[90vw] h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">Edit Quick Pick Items ({selectedItems.length}/20)</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('select')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'select' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              1. Select Items
            </button>
            <button 
              onClick={() => setActiveTab('customize')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'customize' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              2. Customize
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {activeTab === 'select' ? (
            <div className="w-full flex flex-col">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                <input
                  type="text"
                  placeholder="Search by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {isLoadingInventory ? (
                  <div className="text-center py-8">Loading inventory...</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 text-sm">
                        <th className="p-2 w-10"></th>
                        <th className="p-2">Item Name</th>
                        <th className="p-2">SKU</th>
                        <th className="p-2">Category</th>
                        <th className="p-2 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventory.map(item => {
                        const isSelected = selectedItems.some(si => si.item_id === item.id);
                        return (
                          <tr 
                            key={item.id} 
                            className={`
                              border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer
                              ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                            `}
                            onClick={() => handleToggleItem(item)}
                          >
                            <td className="p-2">
                              <input 
                                type="checkbox" 
                                checked={isSelected}
                                onChange={() => {}} // Handled by row click
                                className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="p-2 font-medium">{item.itemName}</td>
                            <td className="p-2 text-zinc-500 text-sm">{item.sku}</td>
                            <td className="p-2 text-zinc-500 text-sm">{item.categoryName || '-'}</td>
                            <td className="p-2 text-right font-mono">
                              {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(item.costPrice)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full p-6 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedItems.map((item, idx) => (
                  <div key={item.item_id} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 flex flex-col gap-3 bg-zinc-50 dark:bg-zinc-800/50">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-mono text-zinc-500">#{idx + 1}</span>
                      <button 
                        onClick={() => item.item && handleToggleItem(item.item)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-zinc-500">Label</label>
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => handleUpdateItem(idx, { label: e.target.value })}
                        className="w-full px-2 py-1 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-zinc-500">Color</label>
                      <div className="flex flex-wrap gap-2">
                        {['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500', 'bg-gray-500', 'bg-indigo-500'].map(color => (
                          <button
                            key={color}
                            onClick={() => handleUpdateItem(idx, { color })}
                            className={`w-6 h-6 rounded-full ${color} ${item.color === color ? 'ring-2 ring-offset-2 ring-black dark:ring-white' : ''}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="mt-2 p-2 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center min-h-[60px]">
                      <button 
                        className={`
                          ${item.color} text-white font-bold text-xs p-2 rounded shadow-sm w-full h-full min-h-[40px] break-words
                        `}
                      >
                        {item.label}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50 dark:bg-zinc-900">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
