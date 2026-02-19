'use client';

import React, { useState } from 'react';
import { useTasks } from '@/context/TaskContext';
import { Check, Trash2, Edit2, X, Save, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { DateStrip } from '@/components/DateStrip';
import { Header } from '@/components/Header';

const toDateKey = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

interface DailyTaskViewProps {
    selectedDate: string;
    onSelectDate: (date: string) => void;
    weekOffset: number;
    onWeekChange: (offset: number) => void;
}

export const DailyTaskView: React.FC<DailyTaskViewProps> = ({
    selectedDate, onSelectDate, weekOffset, onWeekChange
}) => {
    const { tasks, toggleTaskCompletion, deleteTask, updateTask, syncReminders, isSyncing, syncError, clearTasksByDate } = useTasks();
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');

    // Filter tasks for the selected date
    const dateTasks = tasks.filter(t => {
        const taskDate = t.scheduledDate || toDateKey(new Date(t.createdAt));
        return taskDate === selectedDate;
    });

    const sortedTasks = [...dateTasks].sort((a, b) => {
        if (a.status === b.status) return 0;
        return a.status === 'completed' ? 1 : -1;
    });

    const isToday = selectedDate === toDateKey(new Date());
    const isFuture = selectedDate > toDateKey(new Date());

    const selectedDateLabel = (() => {
        const d = new Date(selectedDate + 'T00:00:00');
        if (isToday) return "Today's Schedule";
        return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    })();

    const startEditing = (task: any) => {
        setEditingTaskId(task.id);
        setEditTitle(task.title);
    };

    const saveEdit = () => {
        if (editingTaskId && editTitle.trim()) {
            updateTask(editingTaskId, { title: editTitle });
            setEditingTaskId(null);
            setEditTitle('');
        }
    };

    const cancelEdit = () => {
        setEditingTaskId(null);
        setEditTitle('');
    };

    return (
        <div style={{
            padding: '24px 24px',
            paddingBottom: '120px',
            height: '100%',
            overflowY: 'auto'
        }}>
            <Header />
            <DateStrip
                selectedDate={selectedDate}
                onSelectDate={onSelectDate}
                weekOffset={weekOffset}
                onWeekChange={onWeekChange}
            />

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2 style={{ fontSize: '20px', margin: 0 }}>{selectedDateLabel}</h2>
                    {isToday && (
                        <button
                            onClick={() => syncReminders()}
                            disabled={isSyncing}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                padding: '6px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '12px',
                                color: 'var(--text-secondary)',
                                cursor: isSyncing ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {isSyncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                            {isSyncing ? 'Syncing...' : 'Sync Reminders'}
                        </button>
                    )}
                </div>
                <span style={{
                    fontSize: '14px',
                    color: 'var(--primary-color)',
                    fontWeight: 600,
                    background: 'rgba(0, 229, 153, 0.1)',
                    padding: '6px 12px',
                    borderRadius: '20px'
                }}>
                    {dateTasks.filter(t => t.status === 'pending').length} Left
                </span>
            </div>

            {
                dateTasks.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                        <button
                            onClick={() => {
                                if (confirm(`Are you sure you want to clear all tasks for ${selectedDateLabel}? This cannot be undone.`)) {
                                    clearTasksByDate(selectedDate);
                                }
                            }}
                            style={{
                                background: 'rgba(255, 59, 48, 0.1)',
                                color: '#FF3B30',
                                border: '1px solid #FF3B30',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Trash2 size={12} /> Clear {selectedDateLabel}
                        </button>
                    </div>
                )
            }

            {syncError && (
                <div style={{
                    marginBottom: '16px',
                    padding: '8px 12px',
                    background: 'rgba(255, 69, 58, 0.1)',
                    border: '1px solid var(--danger-color)',
                    borderRadius: '8px',
                    color: 'var(--danger-color)',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <AlertCircle size={14} />
                    {syncError}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sortedTasks.map((task, index) => (
                    <div
                        key={task.id}
                        className="card animate-enter"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            animationDelay: `${index * 0.05}s`,
                            transition: 'all 0.2s ease',
                            opacity: task.status === 'completed' ? 0.6 : 1,
                            transform: task.status === 'completed' ? 'scale(0.98)' : 'scale(1)',
                            position: 'relative'
                        }}
                    >
                        {/* Checkbox */}
                        <div
                            onClick={() => toggleTaskCompletion(task.id)}
                            style={{
                                minWidth: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                border: task.status === 'completed' ? 'none' : '2px solid #333',
                                background: task.status === 'completed' ? 'var(--success-color)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {task.status === 'completed' && <Check size={14} color="black" strokeWidth={3} />}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1 }}>
                            {editingTaskId === task.id ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        autoFocus
                                        style={{
                                            border: '1px solid var(--primary-color)',
                                            borderRadius: '8px',
                                            padding: '4px 8px',
                                            fontSize: '16px',
                                            width: '100%',
                                            background: 'transparent',
                                            color: 'var(--text-color)'
                                        }}
                                    />
                                </div>
                            ) : (
                                <div
                                    onClick={() => startEditing(task)}
                                    style={{
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                        color: task.status === 'completed' ? 'var(--text-secondary)' : 'var(--text-color)',
                                        cursor: 'text'
                                    }}
                                >
                                    {task.title}
                                </div>
                            )}

                            {task.dueTime && !editingTaskId && (
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                    {new Date(task.dueTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        {editingTaskId === task.id ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={saveEdit} style={{ background: 'none', border: 'none', color: 'var(--success-color)', cursor: 'pointer', padding: '8px' }}>
                                    <Save size={24} />
                                </button>
                                <button onClick={cancelEdit} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: '8px' }}>
                                    <X size={24} />
                                </button>
                            </div>
                        ) : (
                            <div className="show-on-hover" style={{ display: 'flex', gap: '4px' }}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); startEditing(task); }}
                                    style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '8px' }}
                                >
                                    <Edit2 size={24} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); if (confirm('Delete task?')) deleteTask(task.id); }}
                                    style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: '8px' }}
                                >
                                    <Trash2 size={24} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {dateTasks.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        marginTop: '60px',
                        color: 'var(--text-secondary)'
                    }}>
                        <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.5 }}>
                            {isFuture ? '📅' : '✨'}
                        </div>
                        <div style={{ fontWeight: 500, fontSize: '18px' }}>
                            {isFuture
                                ? 'No tasks scheduled yet.\nTap + to plan ahead.'
                                : isToday
                                    ? 'All clear for today.\nEnjoy your freedom.'
                                    : 'Nothing was planned for this day.'
                            }
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};
