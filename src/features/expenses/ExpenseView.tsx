'use client';

import React, { useState } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { ExpenseCategory, Expense } from '@/types/expense';
import { TrendingUp, Trash2, Edit2, Save, X, Plus, RefreshCw, Loader2 } from 'lucide-react';

export const ExpenseView: React.FC = () => {
    const { expenses, addExpense, updateExpense, deleteExpense, getDailyTotal, getMonthlyTotal, syncSplitwise, isSyncing, syncError, clearAllExpenses } = useExpenses();
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [category, setCategory] = useState<ExpenseCategory>('Food');

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editAmount, setEditAmount] = useState('');
    const [editNote, setEditNote] = useState('');
    const [page, setPage] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount) return;
        addExpense({
            amount: parseFloat(amount),
            category,
            note: note || category,
            date: new Date().toISOString(),
        });
        setAmount('');
        setNote('');
    };

    const categories: ExpenseCategory[] = ['Food', 'Transport', 'Shopping', 'Bills', 'Other'];

    const startEditing = (expense: Expense) => {
        setEditingId(expense.id);
        setEditAmount(expense.amount.toString());
        setEditNote(expense.note);
    };

    const saveEdit = () => {
        if (editingId && editAmount) {
            updateExpense(editingId, {
                amount: parseFloat(editAmount),
                note: editNote
            });
            setEditingId(null);
            setEditAmount('');
            setEditNote('');
        }
    };

    return (
        <div style={{ padding: '24px 24px', paddingBottom: '120px', height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px' }}>Wallet</h1>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {expenses.length > 0 && (
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to delete ALL expenses? This cannot be undone.')) {
                                    clearAllExpenses();
                                }
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                borderRadius: '100px',
                                border: '1px solid #FF3B30',
                                background: 'rgba(255, 59, 48, 0.1)',
                                color: '#FF3B30',
                                fontWeight: 600,
                                fontSize: '14px',
                                cursor: 'pointer',
                            }}
                        >
                            <Trash2 size={16} /> Clear All
                        </button>
                    )}
                    <button
                        onClick={syncSplitwise}
                        disabled={isSyncing}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            borderRadius: '100px',
                            border: '1px solid var(--primary-color)',
                            background: 'rgba(0, 229, 153, 0.1)',
                            color: 'var(--primary-color)',
                            fontWeight: 600,
                            fontSize: '14px',
                            cursor: isSyncing ? 'not-allowed' : 'pointer',
                            opacity: isSyncing ? 0.7 : 1,
                            transition: 'all 0.2s',
                        }}
                    >
                        {isSyncing ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={16} />}
                        {isSyncing ? 'Syncing...' : 'Sync Splitwise'}
                    </button>
                </div>
            </div>

            {syncError && (
                <div style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255, 69, 58, 0.1)',
                    border: '1px solid var(--danger-color)',
                    color: 'var(--danger-color)',
                    fontSize: '14px',
                    marginBottom: '16px',
                }}>
                    {syncError}
                </div>
            )}

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '32px'
            }}>
                {/* Daily Total Card */}
                <div className="card card-highlight" style={{
                    position: 'relative',
                    overflow: 'hidden',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Spent Today</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-color)' }}>₹{getDailyTotal().toFixed(0)}</div>
                    </div>
                </div>

                {/* Monthly Total Card */}
                <div className="card" style={{
                    position: 'relative',
                    overflow: 'hidden', // Ensure content stays inside rounded corners
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.03)'
                }}>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>This Month</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-color)' }}>₹{getMonthlyTotal().toFixed(0)}</div>
                    </div>
                    <TrendingUp
                        size={80}
                        color="var(--primary-color)"
                        strokeWidth={1}
                        style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.1, zIndex: 1 }}
                    />
                </div>
            </div>

            {/* Quick Add Form */}
            <form onSubmit={handleSubmit} style={{ marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '12px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>
                    Log Expense
                </h3>
                <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Amount Input */}
                    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                        <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-color)' }}>₹</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="0.00"
                            style={{
                                border: 'none',
                                fontSize: '28px',
                                padding: '0 12px',
                                width: '100%',
                                outline: 'none',
                                fontWeight: 'bold',
                                background: 'transparent',
                                color: 'var(--text-color)'
                            }}
                        />
                    </div>

                    {/* Note Input */}
                    <input
                        type="text"
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        placeholder="Description (optional)"
                        style={{
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            padding: '16px',
                            width: '100%',
                            outline: 'none',
                            fontSize: '16px',
                            background: 'rgba(255,255,255,0.03)',
                            color: 'var(--text-color)'
                        }}
                    />

                    {/* Categories */}
                    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {categories.map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setCategory(c)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '100px',
                                    border: '1px solid',
                                    borderColor: category === c ? 'var(--primary-color)' : 'var(--border-color)',
                                    background: category === c ? 'rgba(0, 229, 153, 0.1)' : 'transparent',
                                    color: category === c ? 'var(--primary-color)' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.2s',
                                    fontWeight: 500
                                }}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                    <button
                        type="submit"
                        style={{
                            background: 'var(--text-color)',
                            color: 'var(--bg-color)',
                            border: 'none',
                            borderRadius: '16px',
                            padding: '16px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            marginTop: '12px',
                            width: '100%',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <Plus size={20} /> Add Expense
                    </button>
                </div>
            </form>

            {/* Recent Transactions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>
                    Recent
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        style={{ background: 'none', border: 'none', color: page === 0 ? 'var(--text-secondary)' : 'var(--primary-color)', cursor: page === 0 ? 'default' : 'pointer' }}
                    >Previous</button>
                    <span style={{ color: 'var(--text-secondary)' }}>{page + 1}</span>
                    <button
                        onClick={() => setPage(p => (p + 1) * 10 < expenses.length ? p + 1 : p)}
                        disabled={(page + 1) * 10 >= expenses.length}
                        style={{ background: 'none', border: 'none', color: (page + 1) * 10 >= expenses.length ? 'var(--text-secondary)' : 'var(--primary-color)', cursor: (page + 1) * 10 >= expenses.length ? 'default' : 'pointer' }}
                    >Next</button>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {expenses.length === 0 ? (
                    <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
                        No transactions yet.
                    </div>
                ) : expenses
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(page * 10, (page + 1) * 10)
                    .map((expense) => (
                        <div key={expense.id} className="card group" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '24px',
                            marginBottom: '0',
                            position: 'relative'
                        }}>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flex: 1 }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '14px',
                                    background: 'rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '20px',
                                    flexShrink: 0
                                }}>
                                    {expense.category === 'Food' ? '🍔' :
                                        expense.category === 'Transport' ? '🚗' :
                                            expense.category === 'Shopping' ? '🛍️' :
                                                expense.category === 'Bills' ? '📄' : '💸'}
                                </div>

                                {editingId === expense.id ? (
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <input
                                            type="text"
                                            value={editNote}
                                            onChange={(e) => setEditNote(e.target.value)}
                                            style={{ border: '1px solid var(--border-color)', padding: '8px', borderRadius: '8px', width: '100%', background: 'transparent', color: 'white' }}
                                        />
                                        <input
                                            type="number"
                                            value={editAmount}
                                            onChange={(e) => setEditAmount(e.target.value)}
                                            style={{ border: '1px solid var(--border-color)', padding: '8px', borderRadius: '8px', width: '100%', background: 'transparent', color: 'white' }}
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '18px' }}>{expense.note}</div>
                                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                            {new Date(expense.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}  • {new Date(expense.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {editingId === expense.id ? (
                                <div style={{ display: 'flex', gap: '12px', marginLeft: '12px' }}>
                                    <button onClick={saveEdit} style={{ background: 'none', border: 'none', color: 'var(--success-color)', cursor: 'pointer' }}>
                                        <Save size={24} />
                                    </button>
                                    <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }}>
                                        <X size={24} />
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                    <div style={{ fontWeight: 700, fontSize: '20px' }}>-₹{expense.amount.toFixed(2)}</div>
                                    <div className="show-on-hover" style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => startEditing(expense)}
                                            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '8px' }}
                                        >
                                            <Edit2 size={24} />
                                        </button>
                                        <button
                                            onClick={() => { if (confirm('Delete expense?')) deleteExpense(expense.id); }}
                                            style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: '8px' }}
                                        >
                                            <Trash2 size={24} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
            </div>
        </div>
    );
};
