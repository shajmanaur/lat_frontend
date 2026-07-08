import React, { useEffect, useState, useRef } from 'react';
import { Menu, Bell, LogOut, User, ChevronDown } from 'lucide-react';

export default function Topbar() {
  const [user, setUser] = useState<{ username: string, roleId: number } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) { }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
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
        
        <div className="user-dropdown" ref={dropdownRef}>
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setShowDropdown(!showDropdown)}
          >
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
              <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
          
          {showDropdown && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={handleSignOut}>
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
