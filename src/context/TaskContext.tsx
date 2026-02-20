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
    addTask: (title: string, scheduledDate?: string, dueTime?: string, priority?: Task['priority'], notes?: string) => void;
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

    const requestNotificationPermission = async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    };

    // Subscribe to push notifications
    useEffect(() => {
        const subscribeToPush = async () => {
            if (typeof window === 'undefined') return;
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

            try {
                await requestNotificationPermission();
                if (Notification.permission !== 'granted') return;

                const registration = await navigator.serviceWorker.ready;
                const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
                if (!vapidPublicKey) return;

                // Check if already subscribed
                let subscription = await registration.pushManager.getSubscription();
                if (!subscription) {
                    // Convert VAPID key to Uint8Array
                    const urlBase64ToUint8Array = (base64String: string) => {
                        const padding = '='.repeat((4 - base64String.length % 4) % 4);
                        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
                        const rawData = window.atob(base64);
                        const outputArray = new Uint8Array(rawData.length);
                        for (let i = 0; i < rawData.length; ++i) {
                            outputArray[i] = rawData.charCodeAt(i);
                        }
                        return outputArray;
                    };

                    subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
                    });
                }

                // Store subscription for use in notification sending
                localStorage.setItem('omni-push-subscription', JSON.stringify(subscription));
            } catch (err) {
                console.error('Push subscription failed:', err);
            }
        };

        subscribeToPush();
    }, []);

    // Check for due tasks and send push notifications
    useEffect(() => {
        const checkAndNotify = async () => {
            const now = new Date();
            const NOTIFICATION_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

            // Get already-notified task IDs
            const notifiedRaw = localStorage.getItem('omni-notified-tasks');
            const notified: Record<string, number> = notifiedRaw ? JSON.parse(notifiedRaw) : {};

            // Clean old entries (older than 24 hours)
            const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
            for (const key of Object.keys(notified)) {
                if (notified[key] < dayAgo) delete notified[key];
            }

            const subscription = localStorage.getItem('omni-push-subscription');
            const parsedSub = subscription ? JSON.parse(subscription) : null;

            for (const task of tasks) {
                if (task.status !== 'pending' || !task.dueTime) continue;
                if (notified[task.id]) continue;

                const due = new Date(task.dueTime);
                const diff = now.getTime() - due.getTime();

                // Notify if due time is within the past NOTIFICATION_WINDOW or within next 30 seconds
                if (diff >= -30000 && diff <= NOTIFICATION_WINDOW_MS) {
                    notified[task.id] = Date.now();

                    const priorityLabel = task.priority && task.priority !== 'none'
                        ? ` [${task.priority.toUpperCase()}]`
                        : '';
                    const listLabel = task.list ? ` • ${task.list}` : '';
                    const body = `It's time for: ${task.title}${priorityLabel}${listLabel}`;

                    // Try push notification via server first
                    if (parsedSub) {
                        try {
                            const res = await fetch('/api/notifications/send', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    subscription: parsedSub,
                                    title: '⏰ Task Due!',
                                    body,
                                    tag: `task-${task.id}`,
                                    taskId: task.id,
                                }),
                            });

                            if (res.ok) continue; // Push sent successfully

                            // If subscription expired, clear it
                            const data = await res.json();
                            if (data.expired) {
                                localStorage.removeItem('omni-push-subscription');
                            }
                        } catch {
                            // Push failed, fall through to SW showNotification
                        }
                    }

                    // Fallback: use service worker showNotification directly
                    try {
                        const registration = await navigator.serviceWorker?.ready;
                        if (registration) {
                            await registration.showNotification('⏰ Task Due!', {
                                body,
                                icon: '/icon-192x192.png',
                                badge: '/icon-192x192.png',
                                vibrate: [200, 100, 200],
                                tag: `task-${task.id}`,
                            } as any);
                            continue;
                        }
                    } catch {
                        // SW not available
                    }

                    // Last resort: basic Notification API
                    if (Notification.permission === 'granted') {
                        new Notification('⏰ Task Due!', {
                            body,
                            icon: '/icon-192x192.png',
                        });
                    }
                }
            }

            localStorage.setItem('omni-notified-tasks', JSON.stringify(notified));
        };

        // Check immediately on mount and tasks change
        checkAndNotify();

        // Then check every 30 seconds
        const interval = setInterval(checkAndNotify, 30000);
        return () => clearInterval(interval);
    }, [tasks]);

    const addTask = (title: string, scheduledDate?: string, dueTime?: string, priority?: Task['priority'], notes?: string) => {
        const newTask: Task = {
            id: generateId(),
            title,
            status: 'pending',
            dueTime,
            scheduledDate: scheduledDate || toDateKey(new Date()),
            createdAt: new Date().toISOString(),
            priority: priority || 'none',
            notes,
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
                const updated = [...prev];
                const existingByUid = new Map<string, number>();
                const existingByTitle = new Map<string, number>();

                // Index existing tasks
                updated.forEach((t, i) => {
                    if (t.icloudUid) existingByUid.set(t.icloudUid, i);
                    existingByTitle.set(t.title.toLowerCase(), i);
                });

                for (const remote of remoteTasks) {
                    // Check by iCloud UID first, then fall back to title
                    const existingIdx = remote.icloudUid
                        ? existingByUid.get(remote.icloudUid)
                        : existingByTitle.get(remote.title.toLowerCase());

                    if (existingIdx !== undefined) {
                        // Update existing task with new properties from Reminders
                        updated[existingIdx] = {
                            ...updated[existingIdx],
                            priority: remote.priority,
                            notes: remote.notes,
                            list: remote.list,
                            flagged: remote.flagged,
                            icloudUid: remote.icloudUid || updated[existingIdx].icloudUid,
                            dueTime: remote.dueTime || updated[existingIdx].dueTime,
                            scheduledDate: remote.scheduledDate || updated[existingIdx].scheduledDate,
                        };
                    } else {
                        // New task
                        updated.push(remote);
                    }
                }

                return updated;
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
