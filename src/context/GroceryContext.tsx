'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { GroceryItem, StockLevel } from '@/types/grocery';
import { generateId } from '@/utils/generateId';

interface GroceryContextType {
    items: GroceryItem[];
    shoppingList: GroceryItem[];
    addItem: (name: string, category?: string) => void;
    updateStock: (id: string, level: StockLevel) => void;
    editItem: (id: string, updates: Partial<GroceryItem>) => void;
    deleteItem: (id: string) => void;
    addAiItems: (items: Omit<GroceryItem, 'id' | 'stockLevel'>[]) => void;
    clearShoppingList: () => void;
    clearPantry: () => void;
}

const GroceryContext = createContext<GroceryContextType | undefined>(undefined);

export const GroceryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<GroceryItem[]>(() => {
        if (typeof window === 'undefined') return [];
        const saved = localStorage.getItem('life-os-grocery');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('life-os-grocery', JSON.stringify(items));
    }, [items]);

    const addItem = (name: string, category?: string) => {
        const newItem: GroceryItem = {
            id: generateId(),
            name,
            stockLevel: 'High',
            category: category || 'Other',
            isEssential: false,
        };
        setItems(prev => [...prev, newItem]);
    };

    const updateStock = (id: string, level: StockLevel) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, stockLevel: level } : item
        ));
    };

    const editItem = (id: string, updates: Partial<GroceryItem>) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ));
    };

    const deleteItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    // Add items from AI planner
    const addAiItems = (newItems: Omit<GroceryItem, 'id' | 'stockLevel'>[]) => {
        const toAdd: GroceryItem[] = newItems
            .filter(ni => !items.some(ei => ei.name.toLowerCase() === ni.name.toLowerCase()))
            .map(ni => ({
                ...ni,
                id: generateId(),
                stockLevel: 'Out' as StockLevel,
            }));
        setItems(prev => [...prev, ...toAdd]);
    };

    const shoppingList = items.filter(item => item.stockLevel === 'Low' || item.stockLevel === 'Out');

    const clearShoppingList = () => {
        setItems(prev => prev.filter(item => item.stockLevel !== 'Low' && item.stockLevel !== 'Out'));
    };

    const clearPantry = () => {
        setItems([]);
    };

    return (
        <GroceryContext.Provider value={{ items, shoppingList, addItem, updateStock, editItem, deleteItem, addAiItems, clearShoppingList, clearPantry }}>
            {children}
        </GroceryContext.Provider>
    );
};

export const useGrocery = () => {
    const context = useContext(GroceryContext);
    if (!context) throw new Error('useGrocery must be used within a GroceryProvider');
    return context;
};
