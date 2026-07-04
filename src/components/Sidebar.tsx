import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, UserCheck, FileCheck, RefreshCw, Globe, MapPin, Building, HeadphonesIcon, Box } from 'lucide-react';

export default function Sidebar() {
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
        <div className="nav-group-title">Overview</div>
        <Link href="/" className="nav-item active">
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </Link>
        
        <div className="nav-group-title">Coordinator Management</div>
        <Link href="/coordinators" className="nav-item">
          <Users size={18} />
          <span>Coordinators</span>
        </Link>

        <div className="nav-group-title">Student Management</div>
        <Link href="/students" className="nav-item">
          <UserCheck size={18} />
          <span>Students</span>
        </Link>
        
        <div className="nav-group-title">OMR Processing</div>
        <Link href="/omr-status" className="nav-item">
          <FileCheck size={18} />
          <span>OMR Entry Status</span>
        </Link>
        <Link href="/omr-processing" className="nav-item">
          <RefreshCw size={18} />
          <span>OMR Processing</span>
        </Link>
        
        <div className="nav-group-title">Reports</div>
        <Link href="/reports/national" className="nav-item">
          <Globe size={18} />
          <span>National Report</span>
        </Link>
        <Link href="/reports/region" className="nav-item">
          <MapPin size={18} />
          <span>Region Report</span>
        </Link>
        <Link href="/reports/school" className="nav-item">
          <Building size={18} />
          <span>School Report</span>
        </Link>
      </nav>
      
      <div className="sidebar-footer">
        <Link href="/support" className="nav-item" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <HeadphonesIcon size={18} />
            <span>Support</span>
          </div>
          <span>›</span>
        </Link>
      </div>
    </aside>
  );
}
