'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Home, CheckSquare, CreditCard, ShoppingCart, Flame, MessageSquare } from 'lucide-react';

interface BottomNavProps {
    currentView: 'chat' | 'dashboard' | 'tasks' | 'expenses' | 'grocery' | 'habits';
    setView: (view: 'chat' | 'dashboard' | 'tasks' | 'expenses' | 'grocery' | 'habits') => void;
    variant?: 'horizontal' | 'vertical';
}

const tabs = [
    { key: 'chat', icon: <MessageSquare size={20} />, label: 'Chat' },
    { key: 'dashboard', icon: <Home size={20} />, label: 'Home' },
    { key: 'tasks', icon: <CheckSquare size={20} />, label: 'Tasks' },
    { key: 'habits', icon: <Flame size={20} />, label: 'Habits' },
    { key: 'expenses', icon: <CreditCard size={20} />, label: 'Wallet' },
    { key: 'grocery', icon: <ShoppingCart size={20} />, label: 'Shop' },
] as const;

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView, variant = 'horizontal' }) => {
    const navRef = useRef<HTMLDivElement>(null);
    const [sliderStyle, setSliderStyle] = useState<React.CSSProperties>({});

    useEffect(() => {
        if (!navRef.current) return;
        const activeIndex = tabs.findIndex(t => t.key === currentView);
        const buttons = navRef.current.querySelectorAll<HTMLButtonElement>('[data-nav-btn]');
        const activeBtn = buttons[activeIndex];

        if (activeBtn) {
            if (variant === 'horizontal') {
                setSliderStyle({
                    width: activeBtn.offsetWidth,
                    height: 'calc(100% - 12px)',
                    transform: `translateX(${activeBtn.offsetLeft - 6}px)`,
                    top: '6px',
                    left: '6px'
                });
            } else {
                setSliderStyle({
                    width: 'calc(100% - 12px)',
                    height: activeBtn.offsetHeight,
                    transform: `translateY(${activeBtn.offsetTop - 6}px)`,
                    left: '6px',
                    top: '6px'
                });
            }
        }
    }, [currentView, variant]);

    const isVertical = variant === 'vertical';

    return (
        <div
            ref={navRef}
            className="glass-panel"
            style={{
                position: 'fixed',
                ...(isVertical ? {
                    right: '24px',
                    flexDirection: 'column',
                    transform: 'none',
                    left: 'auto',
                    bottom: '90px' // Above the FAB
                } : {
                    bottom: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    flexDirection: 'row'
                }),
                zIndex: 1000,
                borderRadius: '32px',
                padding: '6px',
                display: 'flex',
                gap: '4px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                maxWidth: isVertical ? 'none' : '90%',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(20, 20, 20, 0.8)',
                backdropFilter: 'blur(12px)'
            }}
        >
            {/* Sliding green pill */}
            <div
                style={{
                    position: 'absolute',
                    borderRadius: '100px',
                    background: 'var(--primary-color)',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    zIndex: 0,
                    ...sliderStyle,
                }}
            />

            {tabs.map((tab) => {
                const isActive = currentView === tab.key;
                return (
                    <button
                        key={tab.key}
                        data-nav-btn
                        onClick={() => setView(tab.key as any)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '100px',
                            border: 'none',
                            background: 'transparent',
                            color: isActive ? '#000000' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'color 0.3s ease',
                            fontWeight: isActive ? 700 : 500,
                            justifyContent: isVertical ? 'flex-start' : 'center',
                            width: isVertical ? '100%' : 'auto',
                            minWidth: (!isVertical && isActive) ? '100px' : 'auto',
                            position: 'relative',
                            zIndex: 1,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {tab.icon}
                        {(isActive || isVertical) && <span style={{ fontSize: '14px' }}>{tab.label}</span>}
                    </button>
                );
            })}
        </div>
    );
};
