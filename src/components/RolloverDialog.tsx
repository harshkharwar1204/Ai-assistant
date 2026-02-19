'use client';

import React from 'react';
import { Task } from '@/types/task';
import { ArrowRight, Trash2, CalendarClock } from 'lucide-react';

interface RolloverDialogProps {
    missedTasks: Task[];
    onRollover: (ids: string[]) => void;
    onClear: (ids: string[]) => void;
}

export const RolloverDialog: React.FC<RolloverDialogProps> = ({ missedTasks, onRollover, onClear }) => {
    if (missedTasks.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(5px)',
            padding: '20px',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', maxHeight: '80vh', overflowY: 'auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'var(--text-color)',
                        color: 'var(--bg-color)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                    }}>
                        <CalendarClock size={30} />
                    </div>
                    <h2 style={{ marginBottom: '8px' }}>Clean Slate</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        You have {missedTasks.length} pending tasks from yesterday. What should we do?
                    </p>
                </div>

                <div className="flex flex-col gap-3" style={{ marginBottom: '24px' }}>
                    {missedTasks.map(task => (
                        <div key={task.id} style={{
                            padding: '12px',
                            background: '#f8f9fe',
                            borderRadius: '12px',
                            border: '1px solid #eee',
                            fontSize: '14px',
                            fontWeight: 500
                        }}>
                            {task.title}
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => onRollover(missedTasks.map(t => t.id))}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: 'var(--text-color)',
                            color: 'var(--bg-color)',
                            border: 'none',
                            borderRadius: '16px',
                            fontWeight: 600,
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Move to Today <ArrowRight size={18} />
                    </button>

                    <button
                        onClick={() => onClear(missedTasks.map(t => t.id))}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: 'transparent',
                            color: 'var(--danger-color)',
                            border: '1px solid var(--danger-color)',
                            borderRadius: '16px',
                            fontWeight: 600,
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Clear All <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
