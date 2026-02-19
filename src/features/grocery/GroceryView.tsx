'use client';

import React, { useState } from 'react';
import { useGrocery } from '@/context/GroceryContext';
import { StockLevel } from '@/types/grocery';
import { Plus, AlertCircle, ExternalLink, Edit2, Trash2, Save, X, Sparkles, Loader2, ShoppingCart } from 'lucide-react';

interface AiGroceryItem {
    name: string;
    category: string;
    isEssential: boolean;
}

interface Recipe {
    name: string;
    description: string;
    source?: string;
    sourceUrl?: string;
    instructions?: string[];
    ingredients: AiGroceryItem[];
}

export const GroceryView: React.FC = () => {
    const { items, addItem, updateStock, shoppingList, deleteItem, editItem, addAiItems, clearShoppingList, clearPantry } = useGrocery();
    const [newItemName, setNewItemName] = useState('');
    const [activeTab, setActiveTab] = useState<'inventory' | 'list' | 'ai'>('inventory');

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    // AI Planning State
    const [aiPrompt, setAiPrompt] = useState('');
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim()) return;
        addItem(newItemName);
        setNewItemName('');
    };

    const startEditing = (item: any) => {
        setEditingId(item.id);
        setEditName(item.name);
    };

    const saveEdit = () => {
        if (editingId && editName.trim()) {
            editItem(editingId, { name: editName });
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

    const handleAiPlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!aiPrompt.trim()) return;
        setAiLoading(true);
        setAiLoading(true);
        setAiError(null);
        setRecipes([]);

        try {
            const res = await fetch('/api/groceries/plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: aiPrompt, currentItems: items }),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to generate plan');
            }
            const data = await res.json();
            setRecipes(data.recipes || []);
        } catch (err: any) {
            setAiError(err.message || 'Something went wrong');
        } finally {
            setAiLoading(false);
        }
    };

    const handleAddRecipe = (recipe: Recipe) => {
        addAiItems(recipe.ingredients);
        // Optional: show toast or feedback
    };

    const handleAddAllRecipes = () => {
        const allItems = recipes.flatMap(r => r.ingredients);
        addAiItems(allItems);
        setRecipes([]);
        setAiPrompt('');
        setActiveTab('inventory');
    };

    const tabStyle = (tab: string) => ({
        padding: '10px 16px',
        borderRadius: '8px',
        border: 'none',
        background: activeTab === tab ? 'var(--text-color)' : 'transparent',
        color: activeTab === tab ? 'var(--bg-color)' : 'var(--text-secondary)',
        fontWeight: 600 as const,
        cursor: 'pointer' as const,
        fontSize: '13px',
        display: 'flex' as const,
        alignItems: 'center' as const,
        gap: '6px',
    });

    return (
        <div style={{ padding: '24px 24px', paddingBottom: '120px', height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px' }}>Pantry</h1>
                <div style={{
                    background: 'var(--card-bg)',
                    padding: '4px',
                    borderRadius: '12px',
                    display: 'flex',
                    border: '1px solid var(--border-color)',
                    gap: '2px',
                }}>
                    <button onClick={() => setActiveTab('inventory')} style={tabStyle('inventory')}>Items</button>
                    <button onClick={() => setActiveTab('list')} style={tabStyle('list')}>
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
                    <button onClick={() => setActiveTab('ai')} style={tabStyle('ai')}>
                        <Sparkles size={14} /> AI Plan
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

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                        {items.length > 0 && (
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to clear your entire pantry inventory? This cannot be undone.')) {
                                        clearPantry();
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
                                <Trash2 size={14} /> Clear Inventory
                            </button>
                        )}
                    </div>

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
                    {shoppingList.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px', padding: '40px', border: '1px dashed var(--border-color)', borderRadius: '20px' }}>
                            Everything is stocked up!
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                                <button
                                    onClick={() => {
                                        if (confirm('Are you sure you want to clear all items from the shopping list? This cannot be undone.')) {
                                            clearShoppingList();
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
                            </div>
                            {shoppingList.map(item => (
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
                            ))}
                        </>
                    )}
                </div>
            )}

            {activeTab === 'ai' && (
                <div>
                    <form onSubmit={handleAiPlan} style={{ marginBottom: '24px' }}>
                        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <Sparkles size={20} color="var(--primary-color)" />
                                <span style={{ fontWeight: 600, fontSize: '16px' }}>AI Grocery Planner</span>
                            </div>
                            <textarea
                                value={aiPrompt}
                                onChange={e => setAiPrompt(e.target.value)}
                                placeholder="e.g., Plan my meals for 3 days, or suggest snacks for a movie night..."
                                rows={3}
                                style={{
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    width: '100%',
                                    outline: 'none',
                                    fontSize: '16px',
                                    background: 'rgba(255,255,255,0.03)',
                                    color: 'var(--text-color)',
                                    resize: 'none',
                                    fontFamily: 'var(--font-family)',
                                }}
                            />
                            <button
                                type="submit"
                                disabled={aiLoading || !aiPrompt.trim()}
                                style={{
                                    background: 'var(--primary-color)',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    fontWeight: 700,
                                    cursor: aiLoading ? 'not-allowed' : 'pointer',
                                    width: '100%',
                                    fontSize: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    opacity: aiLoading || !aiPrompt.trim() ? 0.7 : 1,
                                }}
                            >
                                {aiLoading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={20} />}
                                {aiLoading ? 'Generating...' : 'Generate Plan'}
                            </button>
                        </div>
                    </form>

                    {aiError && (
                        <div style={{
                            padding: '12px 16px',
                            borderRadius: '12px',
                            background: 'rgba(255, 69, 58, 0.1)',
                            border: '1px solid var(--danger-color)',
                            color: 'var(--danger-color)',
                            fontSize: '14px',
                            marginBottom: '16px',
                        }}>
                            {aiError}
                        </div>
                    )}

                    {recipes.length > 0 && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>
                                    Found {recipes.length} Recipes
                                </h3>
                                <button
                                    onClick={handleAddAllRecipes}
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
                                        cursor: 'pointer',
                                    }}
                                >
                                    <ShoppingCart size={16} /> Add All Ingredients
                                </button>
                            </div>
                            <div className="flex flex-col gap-4">
                                {recipes.map((recipe, idx) => (
                                    <div
                                        key={idx}
                                        className="card"
                                        onClick={() => setSelectedRecipe(recipe)}
                                        style={{
                                            padding: '24px',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                                            <div>
                                                <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{recipe.name}</h4>
                                                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{recipe.description}</p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddRecipe(recipe);
                                                }}
                                                style={{
                                                    padding: '8px 16px',
                                                    borderRadius: '8px',
                                                    background: 'var(--text-color)',
                                                    color: 'var(--bg-color)',
                                                    border: 'none',
                                                    fontWeight: 600,
                                                    fontSize: '13px',
                                                    cursor: 'pointer',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                + Add Ingredients
                                            </button>
                                        </div>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {recipe.ingredients.slice(0, 5).map((ing, i) => (
                                                <div key={i} style={{
                                                    background: 'rgba(255,255,255,0.05)',
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    fontSize: '13px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}>
                                                    <span>{ing.name}</span>
                                                    {ing.isEssential && (
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary-color)' }}></div>
                                                    )}
                                                </div>
                                            ))}
                                            {recipe.ingredients.length > 5 && (
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', alignSelf: 'center' }}>
                                                    +{recipe.ingredients.length - 5} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!aiLoading && recipes.length === 0 && !aiError && (
                        <div style={{
                            textAlign: 'center',
                            color: 'var(--text-secondary)',
                            marginTop: '40px',
                            padding: '40px',
                        }}>
                            <Sparkles size={40} style={{ opacity: 0.3, marginBottom: '16px' }} />
                            <div style={{ fontSize: '16px', fontWeight: 500 }}>
                                Tell the AI what you&apos;re planning and it&apos;ll generate a grocery list for you.
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Recipe Details Modal */}
            {selectedRecipe && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    backdropFilter: 'blur(5px)'
                }} onClick={() => setSelectedRecipe(null)}>
                    <div style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '600px',
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }} onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>{selectedRecipe.name}</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{selectedRecipe.description}</p>
                                {selectedRecipe.source && (
                                    <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--primary-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        Source: {selectedRecipe.source}
                                        {selectedRecipe.sourceUrl && (
                                            <a
                                                href={selectedRecipe.sourceUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: 'var(--primary-color)', textDecoration: 'underline', marginLeft: '4px', cursor: 'pointer' }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <ExternalLink size={12} style={{ display: 'inline', marginBottom: '-2px' }} /> View
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                            <button onClick={() => setSelectedRecipe(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '24px', overflowY: 'auto' }}>

                            {/* Ingredients */}
                            <div style={{ marginBottom: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <ShoppingCart size={18} /> Ingredients
                                    </h3>
                                    <button
                                        onClick={() => {
                                            handleAddRecipe(selectedRecipe);
                                            setSelectedRecipe(null);
                                        }}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '100px',
                                            background: 'var(--primary-color)',
                                            color: 'black',
                                            border: 'none',
                                            fontWeight: 700,
                                            fontSize: '12px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        + Add All to Pantry
                                    </button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    {selectedRecipe.ingredients.map((ing, i) => (
                                        <div key={i} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 12px',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '8px',
                                            fontSize: '14px'
                                        }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: ing.isEssential ? 'var(--primary-color)' : 'var(--text-secondary)' }} />
                                            {ing.name}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Instructions */}
                            {selectedRecipe.instructions && selectedRecipe.instructions.length > 0 && (
                                <div>
                                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Sparkles size={18} /> Instructions
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {selectedRecipe.instructions.map((step, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '16px' }}>
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    background: 'rgba(255,255,255,0.1)',
                                                    color: 'var(--text-secondary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px',
                                                    fontWeight: 700,
                                                    flexShrink: 0
                                                }}>
                                                    {i + 1}
                                                </div>
                                                <p style={{ fontSize: '15px', lineHeight: '1.5', color: 'var(--text-color)' }}>
                                                    {step}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
