'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Task } from '@/types/task';
import { RolloverDialog } from '@/components/RolloverDialog';
import { PredictionService } from '@/services/PredictionService';
import { generateId } from '@/utils/generateId';

// Helper to get YYYY-MM-DD
const toDateKey = (d: Date) => d.toISOString().split('T')[0];

interface TaskContextType {
    tasks: Task[];
    addTask: (title: string, scheduledDate?: string, dueTime?: string) => void;
    toggleTaskCompletion: (id: string) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    requestNotificationPermission: () => void;
    syncReminders: () => Promise<void>;
    isSyncing: boolean;
    syncError: string | null;
    clearTasksByDate: (date: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<Task[]>(() => {
        if (typeof window === 'undefined') return [];
        const saved = localStorage.getItem('omni-tasks');
        return saved ? JSON.parse(saved) : [];
    });

    const [missedTasks, setMissedTasks] = useState<Task[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncError, setSyncError] = useState<string | null>(null);

    useEffect(() => {
        localStorage.setItem('omni-tasks', JSON.stringify(tasks));
    }, [tasks]);

    // Check for missed tasks on mount
    useEffect(() => {
        const today = new Date().setHours(0, 0, 0, 0);
        const missed = tasks.filter(t => {
            const taskDate = new Date(t.scheduledDate || t.createdAt).setHours(0, 0, 0, 0);
            return t.status === 'pending' && taskDate < today;
        });

        if (missed.length > 0) {
            setMissedTasks(missed);
        }
    }, []); // Run once on mount

    const handleRollover = (ids: string[]) => {
        setTasks(prev => prev.map(t =>
            ids.includes(t.id) ? { ...t, createdAt: new Date().toISOString() } : t
        ));
        setMissedTasks([]);
    };

    const handleClear = (ids: string[]) => {
        setTasks(prev => prev.filter(t => !ids.includes(t.id)));
        setMissedTasks([]);
    };

    const requestNotificationPermission = () => {
        if ('Notification' in window) {
            Notification.requestPermission();
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            tasks.forEach(task => {
                if (task.status === 'pending' && task.dueTime) {
                    const due = new Date(task.dueTime);
                    if (due <= now && due.getTime() > now.getTime() - 60000) {
                        if (Notification.permission === 'granted') {
                            new Notification('Task Due!', {
                                body: `It's time for: ${task.title}`,
                                icon: '/icon-192x192.png'
                            });
                        }
                    }
                }
            });
        }, 60000);

        return () => clearInterval(interval);
    }, [tasks]);

    const addTask = (title: string, scheduledDate?: string, dueTime?: string) => {
        const newTask: Task = {
            id: generateId(),
            title,
            status: 'pending',
            dueTime,
            scheduledDate: scheduledDate || toDateKey(new Date()),
            createdAt: new Date().toISOString(),
        };
        setTasks(prev => [...prev, newTask]);

        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
            requestNotificationPermission();
        }
    };

    const toggleTaskCompletion = (id: string) => {
        setTasks(prev => prev.map(task => {
            if (task.id === id) {
                const newStatus = task.status === 'completed' ? 'pending' : 'completed';

                if (newStatus === 'completed') {
                    PredictionService.recordCompletion(task.title);
                }

                return { ...task, status: newStatus };
            }
            return task;
        }));
    };

    const updateTask = (id: string, updates: Partial<Task>) => {
        setTasks(prev => prev.map(task =>
            task.id === id ? { ...task, ...updates } : task
        ));
    };

    const deleteTask = (id: string) => {
        setTasks(prev => prev.filter(task => task.id !== id));
    };

    const syncReminders = async () => {
        setIsSyncing(true);
        setSyncError(null);
        try {
            const res = await fetch('/api/tasks/sync');
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to sync reminders');
            }
            const remoteTasks: Task[] = await res.json();

            setTasks(prev => {
                const existingTitles = new Set(prev.map(t => t.title.toLowerCase()));
                const newTasks = remoteTasks.filter(t => !existingTitles.has(t.title.toLowerCase()));
                return [...prev, ...newTasks];
            });
        } catch (err: any) {
            setSyncError(err.message || 'Sync failed');
        } finally {
            setIsSyncing(false);
        }
    };

    const clearTasksByDate = (date: string) => {
        setTasks(prev => prev.filter(t => {
            const taskDate = t.scheduledDate || toDateKey(new Date(t.createdAt));
            return taskDate !== date;
        }));
    };

    return (
        <TaskContext.Provider value={{
            tasks, addTask, toggleTaskCompletion, deleteTask, updateTask,
            requestNotificationPermission, syncReminders, isSyncing, syncError, clearTasksByDate
        }}>
            {missedTasks.length > 0 && (
                <RolloverDialog
                    missedTasks={missedTasks}
                    onRollover={handleRollover}
                    onClear={handleClear}
                />
            )}
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (!context) throw new Error('useTasks must be used within a TaskProvider');
    return context;
};
