import React from 'react';
import { Menu, Bell } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="topbar">
      <button className="menu-btn" style={{ color: 'var(--text-muted)' }}>
        <Menu size={24} />
      </button>
      
      <div className="flex items-center gap-4">
        <button style={{ position: 'relative', color: 'var(--text-muted)' }}>
          <Bell size={20} />
          <span style={{
            position: 'absolute',
            top: -5,
            right: -5,
            background: '#EF4444',
            color: 'white',
            fontSize: '0.65rem',
            padding: '2px 5px',
            borderRadius: '10px',
            fontWeight: 'bold',
            border: '2px solid white'
          }}>12</span>
        </button>
        
        <div className="flex items-center gap-3" style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '1rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--status-blue-bg)',
            color: 'var(--primary-purple)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '0.875rem'
          }}>
            AD
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Admin User</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
