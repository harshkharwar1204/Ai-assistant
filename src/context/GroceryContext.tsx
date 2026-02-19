import React, { createContext, useContext, useEffect, useState } from 'react';
import { GroceryItem, StockLevel } from '../types/grocery';
import { generateId } from '../utils/generateId';

interface GroceryContextType {
    items: GroceryItem[];
    addItem: (name: string, isEssential?: boolean) => void;
    updateStock: (id: string, level: StockLevel) => void;
    updateItem: (id: string, updates: Partial<GroceryItem>) => void;
    deleteItem: (id: string) => void;
    shoppingList: GroceryItem[];
}

const GroceryContext = createContext<GroceryContextType | undefined>(undefined);

export const GroceryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<GroceryItem[]>(() => {
        const saved = localStorage.getItem('life-os-grocery');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('life-os-grocery', JSON.stringify(items));
    }, [items]);

    const addItem = (name: string, isEssential: boolean = false) => {
        const newItem: GroceryItem = {
            id: generateId(),
            name,
            stockLevel: 'High',
            category: 'General',
            isEssential
        };
        setItems(prev => [...prev, newItem]);
    };

    const updateStock = (id: string, level: StockLevel) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, stockLevel: level } : item
        ));
    };

    const updateItem = (id: string, updates: Partial<GroceryItem>) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ));
    };

    const deleteItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    // Derived state: items that need buying
    const shoppingList = items.filter(i => i.stockLevel === 'Low' || i.stockLevel === 'Out');

    return (
        <GroceryContext.Provider value={{ items, addItem, updateStock, updateItem, deleteItem, shoppingList }}>
            {children}
        </GroceryContext.Provider>
    );
};

export const useGrocery = () => {
    const context = useContext(GroceryContext);
    if (!context) throw new Error('useGrocery must be used within a GroceryProvider');
    return context;
};
