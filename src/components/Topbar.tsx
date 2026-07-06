import React, { useEffect, useState } from 'react';
import { Menu, Bell } from 'lucide-react';

export default function Topbar() {
  const [user, setUser] = useState<{ username: string, roleId: number } | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) { }
    }
  }, []);

  const getRoleName = (roleId: number) => {
    switch (roleId) {
      case 1: return 'Superadmin';
      case 2: return 'Admin User';
      case 3: return 'Coordinator User';
      case 4: return 'Teacher User';
      case 5: return 'Student User';
      default: return 'User';
    }
  };

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <header className="topbar">
      <button className="menu-btn" style={{ color: 'var(--text-muted)' }}>
        <Menu size={24} />
      </button>
      
      <div className="flex items-center gap-6">
        <button style={{ position: 'relative', color: 'var(--text-muted)' }}>
          <Bell size={20} />
          <span style={{
            position: 'absolute',
            top: -2,
            right: 0,
            background: '#EF4444',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            border: '2px solid white'
          }}></span>
        </button>
        
        <div className="flex items-center gap-3 cursor-pointer">
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(76, 53, 230, 0.1)',
            color: 'var(--primary-purple)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            fontSize: '0.8rem'
          }}>
            {user ? getInitials(user.username) : 'CB'}
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)' }}>
              {user ? getRoleName(user.roleId) : 'Coordinator User'}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>▼</span>
          </div>
        </div>
      </div>
    </header>
  );
}
