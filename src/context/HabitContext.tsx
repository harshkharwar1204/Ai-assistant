import React, { createContext, useContext, useEffect, useState } from 'react';
import { Habit } from '../types/habit';
import { generateId } from '../utils/generateId';

interface HabitContextType {
    habits: Habit[];
    addHabit: (name: string) => void;
    toggleHabit: (id: string) => void;
    updateHabit: (id: string, updates: Partial<Habit>) => void;
    deleteHabit: (id: string) => void;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [habits, setHabits] = useState<Habit[]>(() => {
        const saved = localStorage.getItem('life-os-habits');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('life-os-habits', JSON.stringify(habits));
    }, [habits]);

    const addHabit = (name: string) => {
        const newHabit: Habit = {
            id: generateId(),
            name,
            streak: 0,
            completedDates: [],
            archived: false,
        };
        setHabits(prev => [...prev, newHabit]);
    };

    const toggleHabit = (id: string) => {
        const today = new Date().toDateString();

        setHabits(prev => prev.map(habit => {
            if (habit.id !== id) return habit;

            const isCompletedToday = habit.completedDates.some(d => new Date(d).toDateString() === today);

            let newDates = [...habit.completedDates];
            let newStreak = habit.streak;

            if (isCompletedToday) {
                // Toggle OFF
                newDates = newDates.filter(d => new Date(d).toDateString() !== today);
                newStreak = Math.max(0, newStreak - 1); // Simple logic, ideally recalculate streak
            } else {
                // Toggle ON
                newDates.push(new Date().toISOString());
                newStreak += 1;
            }

            return {
                ...habit,
                completedDates: newDates,
                streak: newStreak
            };
        }));
    };

    const updateHabit = (id: string, updates: Partial<Habit>) => {
        setHabits(prev => prev.map(h =>
            h.id === id ? { ...h, ...updates } : h
        ));
    };

    const deleteHabit = (id: string) => {
        setHabits(prev => prev.filter(h => h.id !== id));
    };

    return (
        <HabitContext.Provider value={{ habits, addHabit, toggleHabit, updateHabit, deleteHabit }}>
            {children}
        </HabitContext.Provider>
    );
};

export const useHabits = () => {
    const context = useContext(HabitContext);
    if (!context) throw new Error('useHabits must be used within a HabitProvider');
    return context;
};
