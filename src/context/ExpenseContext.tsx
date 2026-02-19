import React, { createContext, useContext, useEffect, useState } from 'react';
import { Expense, ExpenseCategory } from '../types/expense';
import { generateId } from '../utils/generateId';

interface ExpenseContextType {
    expenses: Expense[];
    addExpense: (amount: number, category: ExpenseCategory, note: string) => void;
    updateExpense: (id: string, updates: Partial<Expense>) => void;
    deleteExpense: (id: string) => void;
    getDailyTotal: () => number;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [expenses, setExpenses] = useState<Expense[]>(() => {
        const saved = localStorage.getItem('life-os-expenses');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('life-os-expenses', JSON.stringify(expenses));
    }, [expenses]);

    const addExpense = (amount: number, category: ExpenseCategory, note: string) => {
        const newExpense: Expense = {
            id: generateId(),
            amount,
            category,
            note,
            date: new Date().toISOString(),
        };
        setExpenses(prev => [newExpense, ...prev]);
    };

    const updateExpense = (id: string, updates: Partial<Expense>) => {
        setExpenses(prev => prev.map(e =>
            e.id === id ? { ...e, ...updates } : e
        ));
    };

    const deleteExpense = (id: string) => {
        setExpenses(prev => prev.filter(e => e.id !== id));
    };

    const getDailyTotal = () => {
        const today = new Date().toDateString();
        return expenses
            .filter(e => new Date(e.date).toDateString() === today)
            .reduce((sum, e) => sum + e.amount, 0);
    };

    return (
        <ExpenseContext.Provider value={{ expenses, addExpense, updateExpense, deleteExpense, getDailyTotal }}>
            {children}
        </ExpenseContext.Provider>
    );
};

export const useExpenses = () => {
    const context = useContext(ExpenseContext);
    if (!context) throw new Error('useExpenses must be used within a ExpenseProvider');
    return context;
};
