'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateStripProps {
    selectedDate: string; // YYYY-MM-DD
    onSelectDate: (date: string) => void;
    weekOffset: number;
    onWeekChange: (offset: number) => void;
}

const toDateKey = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const DateStrip: React.FC<DateStripProps> = ({ selectedDate, onSelectDate, weekOffset, onWeekChange }) => {
    const today = new Date();
    const todayKey = toDateKey(today);

    // Calculate start of current week view (Monday-based)
    const startOfWeek = new Date(today);
    const dayOfWeek = startOfWeek.getDay(); // 0=Sun, 1=Mon...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(startOfWeek.getDate() + mondayOffset + (weekOffset * 7));

    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() + i);
        const key = toDateKey(d);
        return {
            dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 3),
            date: d.getDate(),
            key,
            isToday: key === todayKey,
            isSelected: key === selectedDate,
        };
    });

    // Week label
    const weekStart = new Date(startOfWeek);
    const weekEnd = new Date(startOfWeek);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const monthLabel = weekStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    return (
        <div style={{ marginBottom: '24px' }}>
            {/* Week header with arrows */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
            }}>
                <button
                    onClick={() => onWeekChange(weekOffset - 1)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <ChevronLeft size={20} />
                </button>

                <span style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: weekOffset === 0 ? 'var(--primary-color)' : 'var(--text-secondary)',
                    cursor: weekOffset !== 0 ? 'pointer' : 'default',
                }}
                    onClick={() => {
                        if (weekOffset !== 0) {
                            onWeekChange(0);
                            onSelectDate(todayKey);
                        }
                    }}
                >
                    {weekOffset === 0 ? 'This Week' : monthLabel}
                </span>

                <button
                    onClick={() => onWeekChange(weekOffset + 1)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Day buttons */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '6px',
            }}>
                {days.map((d) => (
                    <div
                        key={d.key}
                        onClick={() => onSelectDate(d.key)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '10px 4px',
                            borderRadius: '14px',
                            backgroundColor: d.isSelected
                                ? 'var(--primary-color)'
                                : d.isToday
                                    ? 'rgba(0, 229, 153, 0.1)'
                                    : 'transparent',
                            color: d.isSelected
                                ? '#000'
                                : d.isToday
                                    ? 'var(--primary-color)'
                                    : 'var(--text-secondary)',
                            border: d.isToday && !d.isSelected
                                ? '1px solid var(--primary-color)'
                                : '1px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <span style={{ fontSize: '11px', fontWeight: 500, opacity: 0.8 }}>{d.dayLabel}</span>
                        <span style={{ fontSize: '16px', fontWeight: 700 }}>{d.date}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
