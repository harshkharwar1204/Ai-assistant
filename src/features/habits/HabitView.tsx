'use client';

import React, { useState } from 'react';
import { useHabits } from '@/context/HabitContext';
import { Plus, Flame, Check, Edit2, Trash2, Save, X } from 'lucide-react';

export const HabitView: React.FC = () => {
    const { habits, addHabit, toggleHabit, updateHabit, deleteHabit, deleteAllHabits } = useHabits();
    const [newHabitName, setNewHabitName] = useState('');

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHabitName.trim()) return;
        addHabit(newHabitName);
        setNewHabitName('');
    };

    const startEditing = (habit: any) => {
        setEditingId(habit.id);
        setEditName(habit.name);
    };

    const saveEdit = () => {
        if (editingId && editName.trim()) {
            updateHabit(editingId, { name: editName });
            setEditingId(null);
            setEditName('');
        }
    };

    const isCompletedToday = (dates: string[]) => {
        const today = new Date().toDateString();
        return dates.some(d => new Date(d).toDateString() === today);
    };

    return (
        <div style={{ padding: '24px 24px', paddingBottom: '120px', height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Habits</h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Build your discipline.</p>
                </div>
                {habits.length > 0 && (
                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to delete ALL habits? This will remove all streaks and history. This cannot be undone.')) {
                                deleteAllHabits();
                            }
                        }}
                        style={{
                            background: 'rgba(255, 59, 48, 0.1)',
                            color: '#FF3B30',
                            border: '1px solid #FF3B30',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <Trash2 size={14} /> Clear All
                    </button>
                )}
            </div>

            {/* Quick Add */}
            <form onSubmit={handleSubmit} style={{ marginBottom: '40px' }}>
                <div className="card" style={{
                    padding: '8px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid var(--border-color)'
                }}>
                    <input
                        type="text"
                        value={newHabitName}
                        onChange={e => setNewHabitName(e.target.value)}
                        placeholder="New habit..."
                        style={{
                            flex: 1,
                            border: 'none',
                            background: 'transparent',
                            padding: '12px 16px',
                            fontSize: '18px',
                            outline: 'none',
                            color: 'var(--text-color)'
                        }}
                    />
                    <button type="submit" style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'var(--text-color)',
                        color: 'var(--bg-color)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '8px',
                        cursor: 'pointer'
                    }}>
                        <Plus size={24} />
                    </button>
                </div>
            </form>

            <div className="flex flex-col gap-4">
                {habits.map(habit => {
                    const completed = isCompletedToday(habit.completedDates);
                    return (
                        <div
                            key={habit.id}
                            className="card group"
                            onClick={() => !editingId && toggleHabit(habit.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '24px',
                                cursor: 'pointer',
                                border: completed ? '1px solid var(--success-color)' : '1px solid var(--border-color)',
                                background: completed ? 'rgba(0, 229, 153, 0.05)' : 'var(--card-bg)',
                                transition: 'all 0.2s',
                                position: 'relative'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    border: completed ? 'none' : '2px solid #333',
                                    background: completed ? 'var(--success-color)' : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s',
                                    flexShrink: 0
                                }}>
                                    {completed && <Check size={18} color="black" strokeWidth={3} />}
                                </div>

                                <div style={{ flex: 1 }}>
                                    {editingId === habit.id ? (
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                                            <input
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                                autoFocus
                                                style={{
                                                    background: 'transparent',
                                                    border: '1px solid var(--primary-color)',
                                                    padding: '8px 12px',
                                                    borderRadius: '8px',
                                                    color: 'white',
                                                    width: '100%',
                                                    fontSize: '20px'
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ fontWeight: 600, fontSize: '20px', marginBottom: '4px' }}>{habit.name}</div>
                                            <div style={{
                                                fontSize: '14px',
                                                color: 'var(--text-secondary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}>
                                                <Flame size={16} color={habit.streak > 0 ? '#FF9500' : '#444'} />
                                                <span style={{ color: habit.streak > 0 ? '#FF9500' : 'var(--text-secondary)' }}>{habit.streak} day streak</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Actions (Hover Only) */}
                            <div className="show-on-hover" style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }} onClick={e => e.stopPropagation()}>
                                {editingId === habit.id ? (
                                    <>
                                        <button onClick={saveEdit} style={{ background: 'none', border: 'none', color: 'var(--success-color)', cursor: 'pointer', padding: '8px' }}><Save size={24} /></button>
                                        <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: '8px' }}><X size={24} /></button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => startEditing(habit)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '8px' }} title="Edit"><Edit2 size={24} /></button>
                                        <button onClick={() => { if (confirm('Delete habit?')) deleteHabit(habit.id); }} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '8px' }} title="Delete"><Trash2 size={24} /></button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}

                {habits.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
                        No habits yet. Start small.
                    </div>
                )}
            </div>
        </div>
    );
};
