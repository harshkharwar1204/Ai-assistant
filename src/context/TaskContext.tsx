import React, { createContext, useContext, useEffect, useState } from 'react';
import { Task } from '../types/task';
import { RolloverDialog } from '../components/RolloverDialog';
import { PredictionService } from '../services/PredictionService';
import { generateId } from '../utils/generateId';

// Helper to get YYYY-MM-DD
const toDateKey = (d: Date) => d.toISOString().split('T')[0];

interface TaskContextType {
    tasks: Task[];
    addTask: (title: string, scheduledDate?: string, dueTime?: string) => void;
    toggleTaskCompletion: (id: string) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    requestNotificationPermission: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<Task[]>(() => {
        const saved = localStorage.getItem('life-os-tasks');
        return saved ? JSON.parse(saved) : [];
    });

    const [missedTasks, setMissedTasks] = useState<Task[]>([]);

    useEffect(() => {
        localStorage.setItem('life-os-tasks', JSON.stringify(tasks));
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
                                icon: '/pwa-192x192.png'
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

        // Auto-record purely for frequency if needed, but better on completion
        if (Notification.permission === 'default') {
            requestNotificationPermission();
        }
    };

    const toggleTaskCompletion = (id: string) => {
        setTasks(prev => prev.map(task => {
            if (task.id === id) {
                const newStatus = task.status === 'completed' ? 'pending' : 'completed';

                // AI Training Hook
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

    return (
        <TaskContext.Provider value={{ tasks, addTask, toggleTaskCompletion, deleteTask, updateTask, requestNotificationPermission }}>
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
