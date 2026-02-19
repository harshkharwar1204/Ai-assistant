import React from 'react';

export const Header: React.FC = () => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
            paddingTop: '16px'
        }}>
            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000',
                fontWeight: 'bold',
                fontSize: '18px',
                boxShadow: '0 0 20px rgba(0, 229, 153, 0.3)'
            }}>
                ME
            </div>
            <div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>{getGreeting()}</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-color)' }}>Master</div>
            </div>
        </div>
    );
};
