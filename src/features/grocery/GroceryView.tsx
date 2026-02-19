import React, { useState } from 'react';
import { useGrocery } from '../../context/GroceryContext';
import { StockLevel } from '../../types/grocery';
import { Plus, AlertCircle, ExternalLink, Edit2, Trash2, Save, X } from 'lucide-react';
import '../../styles/main.css';

export const GroceryView: React.FC = () => {
    const { items, addItem, updateStock, shoppingList, deleteItem, updateItem } = useGrocery();
    const [newItemName, setNewItemName] = useState('');
    const [activeTab, setActiveTab] = useState<'inventory' | 'list'>('inventory');

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim()) return;
        addItem(newItemName, true);
        setNewItemName('');
    };

    const startEditing = (item: any) => {
        setEditingId(item.id);
        setEditName(item.name);
    };

    const saveEdit = () => {
        if (editingId && editName.trim()) {
            updateItem(editingId, { name: editName });
            setEditingId(null);
            setEditName('');
        }
    };

    const getStockColor = (level: StockLevel) => {
        switch (level) {
            case 'High': return 'var(--success-color)';
            case 'Medium': return '#FF9500';
            case 'Low': return '#FF3B30';
            case 'Out': return '#8E8E93';
            default: return 'var(--text-color)';
        }
    };

    // Agent Logic
    const openApp = (app: 'swiggy' | 'blinkit' | 'zepto', query: string) => {
        const encoded = encodeURIComponent(query);
        let url = '';
        if (app === 'swiggy') {
            url = `https://www.swiggy.com/instamart/search?custom_back=true&query=${encoded}`;
        } else if (app === 'blinkit') {
            url = `https://blinkit.com/s/?q=${encoded}`;
        } else if (app === 'zepto') {
            url = `https://zeptonow.com/search?query=${encoded}`;
        }
        window.open(url, '_blank');
    };

    return (
        <div style={{ padding: '24px 24px', paddingBottom: '120px', height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px' }}>Pantry</h1>
                <div style={{
                    background: 'var(--card-bg)',
                    padding: '4px',
                    borderRadius: '12px',
                    display: 'flex',
                    border: '1px solid var(--border-color)'
                }}>
                    <button
                        onClick={() => setActiveTab('inventory')}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            background: activeTab === 'inventory' ? 'var(--text-color)' : 'transparent',
                            color: activeTab === 'inventory' ? 'var(--bg-color)' : 'var(--text-secondary)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Items
                    </button>
                    <button
                        onClick={() => setActiveTab('list')}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            background: activeTab === 'list' ? 'var(--text-color)' : 'transparent',
                            color: activeTab === 'list' ? 'var(--bg-color)' : 'var(--text-secondary)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px'
                        }}
                    >
                        To Buy
                        {shoppingList.length > 0 && (
                            <span style={{
                                background: 'var(--danger-color)',
                                color: 'white',
                                fontSize: '11px',
                                padding: '2px 8px',
                                borderRadius: '10px'
                            }}>
                                {shoppingList.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {activeTab === 'inventory' && (
                <>
                    <form onSubmit={handleAdd} style={{ marginBottom: '32px' }}>
                        <div className="card" style={{
                            padding: '12px',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            borderColor: 'var(--border-color)'
                        }}>
                            <input
                                type="text"
                                value={newItemName}
                                onChange={e => setNewItemName(e.target.value)}
                                placeholder="Add new item..."
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
                        {items.map(item => (
                            <div key={item.id} className="card group" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '24px',
                                position: 'relative',
                                overflow: 'visible'
                            }}>
                                {editingId === item.id ? (
                                    <div style={{ flex: 1, display: 'flex', gap: '16px', alignItems: 'center' }}>
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
                                                fontSize: '18px'
                                            }}
                                        />
                                        <button onClick={saveEdit} style={{ background: 'none', border: 'none', color: 'var(--success-color)', cursor: 'pointer', padding: '8px' }}><Save size={24} /></button>
                                        <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: '8px' }}><X size={24} /></button>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ fontWeight: 600, fontSize: '18px', color: 'var(--text-color)' }}>{item.name}</div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginLeft: 'auto' }}>
                                            {/* Stock Controls (Rightmost) */}
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {(['High', 'Medium', 'Low', 'Out'] as StockLevel[]).map((level) => (
                                                    <button
                                                        key={level}
                                                        onClick={() => updateStock(item.id, level)}
                                                        style={{
                                                            padding: '8px 12px',
                                                            borderRadius: '8px',
                                                            border: '1px solid',
                                                            borderColor: item.stockLevel === level ? getStockColor(level) : '#333',
                                                            background: item.stockLevel === level ? getStockColor(level) : 'transparent',
                                                            color: item.stockLevel === level ? (level === 'High' ? 'black' : 'white') : 'var(--text-secondary)',
                                                            fontSize: '12px',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            minWidth: '50px'
                                                        }}
                                                    >
                                                        {level}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Actions (Hover Only) */}
                                            <div className="show-on-hover" style={{ display: 'flex', gap: '4px' }}>
                                                <button onClick={() => startEditing(item)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '8px' }} title="Edit">
                                                    <Edit2 size={24} />
                                                </button>
                                                <button onClick={() => { if (confirm('Delete item?')) deleteItem(item.id); }} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: '8px' }} title="Delete">
                                                    <Trash2 size={24} />
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'list' && (
                <div className="flex flex-col gap-4">
                    {/* List View logic remains mostly same but uses new styles */}
                    {shoppingList.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px', padding: '40px', border: '1px dashed var(--border-color)', borderRadius: '20px' }}>
                            Everything is stocked up!
                        </div>
                    ) : (
                        shoppingList.map(item => (
                            <div key={item.id} className="card" style={{ padding: '24px', borderLeft: '4px solid var(--danger-color)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '18px' }}>{item.name}</div>
                                        <div style={{ fontSize: '14px', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                            <AlertCircle size={16} /> Stock is {item.stockLevel}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => updateStock(item.id, 'High')}
                                        style={{
                                            background: 'var(--text-color)',
                                            color: 'var(--bg-color)',
                                            border: 'none',
                                            padding: '12px 24px',
                                            borderRadius: '12px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Restocked
                                    </button>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={() => openApp('swiggy', item.name)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #FC8019', background: 'rgba(252, 128, 25, 0.1)', color: '#FC8019', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        Swiggy <ExternalLink size={16} />
                                    </button>
                                    <button onClick={() => openApp('blinkit', item.name)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #F8CB46', background: 'rgba(248, 203, 70, 0.1)', color: '#D4A000', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        Blinkit <ExternalLink size={16} />
                                    </button>
                                    <button onClick={() => openApp('zepto', item.name)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #3700b3', background: 'rgba(55, 0, 179, 0.1)', color: '#3700b3', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        Zepto <ExternalLink size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
