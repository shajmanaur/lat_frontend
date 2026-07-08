'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Home, Users, UserCheck, UserPlus, ClipboardList, HeadphonesIcon, Box, GraduationCap, FileCheck, Settings, Globe, MapPin, Building, Activity, ChevronRight, LayoutGrid, FileText } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { menuApi } from '@/services/api';

// Map icon strings from DB to Lucide components
const IconMap: Record<string, React.ElementType> = {
  Home,
  Users,
  UserCheck,
  UserPlus,
  ClipboardList,
  GraduationCap,
  FileCheck,
  Settings,
  Globe,
  MapPin,
  Building,
  Activity,
  LayoutGrid,
  FileText,
  Headphones: HeadphonesIcon,
};

interface Menu {
  id: number;
  menu_name: string;
  menu_link: string;
  menu_icon: string;
  menu_remarks: string; // Used as category
  priority: number;
}



export default function Sidebar() {
  const pathname = usePathname();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const result = await menuApi.getMyMenus();
        // The backend wraps everything in { status: true, response: { status: 'success', data: [...] } }
        if (result.status === true && result.response && result.response.data) {
          setMenus(result.response.data);
        } else if (result.status === 'success') {
          // Fallback if the global interceptor wasn't applied
          setMenus(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch menus:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenus();
  }, []);

  // Get user role from localStorage

  // Determine which menus to show
  const effectiveMenus = menus.length > 0 ? menus : [];

  // Group menus by category (menu_remarks)
  const groupedMenus = effectiveMenus.reduce((acc, menu) => {
    const category = menu.menu_remarks || 'MAIN';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(menu);
    return acc;
  }, {} as Record<string, Menu[]>);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Box size={28} color="#5338F5" fill="#5338F5" />
        <div>
          <div style={{ lineHeight: 1 }}>LAT</div>
          <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 'normal' }}>Learning Assessment Test</div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {loading ? (
          <div style={{ padding: '1rem', color: '#94A3B8', fontSize: '0.85rem' }}>Loading menus...</div>
        ) : (
          Object.entries(groupedMenus).map(([category, catMenus]) => (
            <React.Fragment key={category}>
              <div className="nav-group-title">{category}</div>
              {catMenus.map((menu) => {
                const IconComponent = IconMap[menu.menu_icon] || Activity;
                const isActive = pathname === menu.menu_link;
                
                return (
                  <Link href={menu.menu_link} key={menu.id} className={`nav-item ${isActive ? 'active' : ''}`}>
                    <IconComponent size={18} />
                    <span>{menu.menu_name}</span>
                  </Link>
                );
              })}
            </React.Fragment>
          ))
        )}
      </nav>
      
      <div className="sidebar-footer">
        <Link href="/support" className="nav-item support-link">
          <HeadphonesIcon size={18} />
          <span>Support</span>
          <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
        </Link>
      </div>
    </aside>
  );
}
