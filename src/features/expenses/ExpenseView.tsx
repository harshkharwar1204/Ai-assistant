import React, { useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { ExpenseCategory, Expense } from '../../types/expense';
import { TrendingUp, Trash2, Edit2, Save, X, Plus } from 'lucide-react';
import '../../styles/main.css';

export const ExpenseView: React.FC = () => {
    const { expenses, addExpense, updateExpense, deleteExpense, getDailyTotal } = useExpenses();
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [category, setCategory] = useState<ExpenseCategory>('Food');

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editAmount, setEditAmount] = useState('');
    const [editNote, setEditNote] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount) return;
        addExpense(parseFloat(amount), category, note || category);
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
            <h1 style={{ fontSize: '32px', marginBottom: '32px' }}>Wallet</h1>

            {/* Daily Total Card (Trae Style) */}
            <div className="card card-highlight" style={{
                marginBottom: '32px',
                position: 'relative',
                overflow: 'hidden',
                padding: '24px'
            }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Spent Today</div>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--text-color)' }}>₹{getDailyTotal().toFixed(2)}</div>
                </div>
                <TrendingUp
                    size={120}
                    color="var(--primary-color)"
                    strokeWidth={1}
                    style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.1, zIndex: 1 }}
                />
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
            <h3 style={{ marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>
                Recent
            </h3>
            <div className="flex flex-col gap-4">
                {expenses.length === 0 ? (
                    <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
                        No transactions yet.
                    </div>
                ) : expenses.map((expense) => (
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
                                        {new Date(expense.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
