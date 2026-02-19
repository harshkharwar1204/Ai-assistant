import React, { useRef, useEffect, useState } from 'react';
import { Home, CheckSquare, CreditCard, ShoppingCart, Flame } from 'lucide-react';
import '../styles/main.css';

interface BottomNavProps {
    currentView: 'dashboard' | 'tasks' | 'expenses' | 'grocery' | 'habits';
    setView: (view: 'dashboard' | 'tasks' | 'expenses' | 'grocery' | 'habits') => void;
}

const tabs = [
    { key: 'dashboard', icon: <Home size={20} />, label: 'Home' },
    { key: 'tasks', icon: <CheckSquare size={20} />, label: 'Tasks' },
    { key: 'habits', icon: <Flame size={20} />, label: 'Habits' },
    { key: 'expenses', icon: <CreditCard size={20} />, label: 'Wallet' },
    { key: 'grocery', icon: <ShoppingCart size={20} />, label: 'Shop' },
] as const;

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
    const navRef = useRef<HTMLDivElement>(null);
    const [sliderStyle, setSliderStyle] = useState<React.CSSProperties>({});

    useEffect(() => {
        if (!navRef.current) return;
        const activeIndex = tabs.findIndex(t => t.key === currentView);
        const buttons = navRef.current.querySelectorAll<HTMLButtonElement>('[data-nav-btn]');
        const activeBtn = buttons[activeIndex];

        if (activeBtn) {
            setSliderStyle({
                width: activeBtn.offsetWidth,
                transform: `translateX(${activeBtn.offsetLeft - 6}px)`, // -6 for parent padding
            });
        }
    }, [currentView]);

    return (
        <div
            ref={navRef}
            className="glass-panel"
            style={{
                position: 'fixed',
                bottom: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                borderRadius: '100px',
                padding: '6px',
                display: 'flex',
                gap: '4px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                maxWidth: '90%',
                border: '1px solid rgba(255,255,255,0.1)',
            }}
        >
            {/* Sliding green pill */}
            <div
                style={{
                    position: 'absolute',
                    top: '6px',
                    left: '6px',
                    height: 'calc(100% - 12px)',
                    borderRadius: '100px',
                    background: 'var(--primary-color)',
                    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
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
                            gap: '8px',
                            padding: '12px 16px',
                            borderRadius: '100px',
                            border: 'none',
                            background: 'transparent',
                            color: isActive ? '#000000' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'color 0.4s ease, min-width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                            fontWeight: isActive ? 700 : 500,
                            minWidth: isActive ? '100px' : 'auto',
                            justifyContent: 'center',
                            position: 'relative',
                            zIndex: 1,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {tab.icon}
                        {isActive && <span style={{ fontSize: '14px' }}>{tab.label}</span>}
                    </button>
                );
            })}
        </div>
    );
};
