'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Expense } from '@/types/expense';
import { generateId } from '@/utils/generateId';

interface ExpenseContextType {
    expenses: Expense[];
    addExpense: (expense: Omit<Expense, 'id'>) => void;
    updateExpense: (id: string, updates: Partial<Expense>) => void;
    deleteExpense: (id: string) => void;
    getDailyTotal: () => number;
    getMonthlyTotal: () => number;
    syncSplitwise: () => Promise<void>;
    isSyncing: boolean;
    syncError: string | null;
    clearAllExpenses: () => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [expenses, setExpenses] = useState<Expense[]>(() => {
        if (typeof window === 'undefined') return [];
        const saved = localStorage.getItem('omni-expenses');
        return saved ? JSON.parse(saved) : [];
    });

    const [isSyncing, setIsSyncing] = useState(false);
    const [syncError, setSyncError] = useState<string | null>(null);

    useEffect(() => {
        localStorage.setItem('omni-expenses', JSON.stringify(expenses));
    }, [expenses]);

    const addExpense = (expense: Omit<Expense, 'id'>) => {
        const newExpense: Expense = { ...expense, id: generateId() };
        setExpenses(prev => [...prev, newExpense]);
    };

    const updateExpense = (id: string, updates: Partial<Expense>) => {
        setExpenses(prev => prev.map(e =>
            e.id === id ? { ...e, ...updates } : e
        ));
    };

    const deleteExpense = (id: string) => {
        setExpenses(prev => prev.filter(e => e.id !== id));
    };

    const getDailyTotal = (): number => {
        const today = new Date().toDateString();
        return expenses
            .filter(e => new Date(e.date).toDateString() === today)
            .reduce((total, e) => total + e.amount, 0);
    };

    const getMonthlyTotal = (): number => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        return expenses
            .filter(e => {
                const d = new Date(e.date);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .reduce((total, e) => total + e.amount, 0);
    };

    const syncSplitwise = async () => {
        setIsSyncing(true);
        setSyncError(null);
        try {
            // Fetch expenses for "Sepal combined expenses" group (ID: 90988419)
            // Limit to 200 to ensure we get enough for the month
            const res = await fetch('/api/expenses/sync?group_id=90988419&limit=200');
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to sync Splitwise');
            }
            const synced: Omit<Expense, 'id'>[] = await res.json();

            // Filter for CURRENT MONTH only
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const currentMonthExpenses = synced.filter(s => {
                const d = new Date(s.date);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            });

            setExpenses(prev => {
                // Remove all existing Splitwise expenses (to avoid duplicates/stale data)
                // We identify them by the note prefix [Splitwise]
                const localOnly = prev.filter(e => !e.note.startsWith('[Splitwise]'));

                // Add new sync data
                const newExpenses = currentMonthExpenses.map(s => ({ ...s, id: generateId() }));

                return [...localOnly, ...newExpenses];
            });
        } catch (err: any) {
            setSyncError(err.message || 'Sync failed');
        } finally {
            setIsSyncing(false);
        }
    };

    const clearAllExpenses = () => {
        setExpenses([]);
    };

    return (
        <ExpenseContext.Provider value={{
            expenses, addExpense, updateExpense, deleteExpense,
            getDailyTotal, getMonthlyTotal, syncSplitwise, isSyncing, syncError, clearAllExpenses
        }}>
            {children}
        </ExpenseContext.Provider>
    );
};

export const useExpenses = () => {
    const context = useContext(ExpenseContext);
    if (!context) throw new Error('useExpenses must be used within an ExpenseProvider');
    return context;
};
