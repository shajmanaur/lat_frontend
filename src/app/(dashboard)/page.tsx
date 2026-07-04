import React from 'react';
import { Calendar, Users, UserCheck, FileCheck, ClipboardList, ArrowRight, ArrowUpCircle } from 'lucide-react';

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Welcome back, Admin! <span>👋</span>
          </h1>
          <p className="text-muted text-sm">Here's what's happening with LAT Assessment today.</p>
        </div>
        <button className="btn btn-outline" style={{ gap: '0.5rem' }}>
          <Calendar size={16} />
          LAT 2025
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-4">
        {/* Coordinators */}
        <div className="card flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div style={{ padding: '12px', background: 'var(--primary-purple)', color: 'white', borderRadius: 'var(--radius-md)' }}>
              <Users size={24} />
            </div>
            <div>
              <div className="text-muted text-sm font-medium">Coordinators</div>
              <div className="font-bold" style={{ fontSize: '1.5rem' }}>12,742</div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm text-muted">Active Coordinators</div>
            <a href="/coordinators" style={{ color: 'var(--primary-purple)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View details <ArrowRight size={12} />
            </a>
          </div>
        </div>

        {/* Teachers */}
        <div className="card flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div style={{ padding: '12px', background: 'var(--status-green)', color: 'white', borderRadius: 'var(--radius-md)' }}>
              <UserCheck size={24} />
            </div>
            <div>
              <div className="text-muted text-sm font-medium">Teachers</div>
              <div className="font-bold" style={{ fontSize: '1.5rem' }}>85,321</div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm text-muted">Across All Schools</div>
            <a href="#" style={{ color: 'var(--status-green)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View details <ArrowRight size={12} />
            </a>
          </div>
        </div>

        {/* Students */}
        <div className="card flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div style={{ padding: '12px', background: 'var(--status-orange)', color: 'white', borderRadius: 'var(--radius-md)' }}>
              <Users size={24} />
            </div>
            <div>
              <div className="text-muted text-sm font-medium">Students Registered</div>
              <div className="font-bold" style={{ fontSize: '1.5rem' }}>18,92,456</div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm text-muted">Total Students</div>
            <a href="/students" style={{ color: 'var(--status-orange)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View details <ArrowRight size={12} />
            </a>
          </div>
        </div>

        {/* OMR Entered */}
        <div className="card flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div style={{ padding: '12px', background: 'var(--status-blue)', color: 'white', borderRadius: 'var(--radius-md)' }}>
              <ClipboardList size={24} />
            </div>
            <div>
              <div className="text-muted text-sm font-medium">OMR Entered</div>
              <div className="font-bold" style={{ fontSize: '1.5rem' }}>14,78,912</div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm text-muted">Students Responses</div>
            <a href="/omr-status" style={{ color: 'var(--status-blue)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View details <ArrowRight size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* Assessment Overview Section */}
      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Left: Stats */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Assessment Overview</h3>
          <div className="flex justify-between items-center" style={{ padding: '1rem 0' }}>
            
            <div className="flex items-center gap-3">
              <div style={{ background: 'var(--primary-purple)', color: 'white', padding: '10px', borderRadius: '50%' }}>
                <ClipboardList size={20} />
              </div>
              <div>
                <div className="text-sm font-medium text-muted">Students Present</div>
                <div className="font-bold" style={{ fontSize: '1.25rem' }}>16,45,231</div>
                <div style={{ color: 'var(--status-green)', fontSize: '0.75rem', fontWeight: 600 }}>86.93%</div>
              </div>
            </div>

            <div style={{ width: '1px', height: '50px', background: 'var(--border-light)' }}></div>

            <div className="flex items-center gap-3">
              <div style={{ background: 'var(--status-red)', color: 'white', padding: '10px', borderRadius: '50%' }}>
                <Users size={20} />
              </div>
              <div>
                <div className="text-sm font-medium text-muted">Students Absent</div>
                <div className="font-bold" style={{ fontSize: '1.25rem' }}>2,47,225</div>
                <div style={{ color: 'var(--status-red)', fontSize: '0.75rem', fontWeight: 600 }}>13.07%</div>
              </div>
            </div>

            <div style={{ width: '1px', height: '50px', background: 'var(--border-light)' }}></div>

            <div className="flex items-center gap-3">
              <div style={{ background: 'var(--status-blue)', color: 'white', padding: '10px', borderRadius: '50%' }}>
                <FileCheck size={20} />
              </div>
              <div>
                <div className="text-sm font-medium text-muted">OMR Entered</div>
                <div className="font-bold" style={{ fontSize: '1.25rem' }}>14,78,912</div>
                <div style={{ color: 'var(--status-green)', fontSize: '0.75rem', fontWeight: 600 }}>78.27%</div>
              </div>
            </div>

            <div style={{ width: '1px', height: '50px', background: 'var(--border-light)' }}></div>

            <div className="flex items-center gap-3">
              <div style={{ background: 'var(--status-green)', color: 'white', padding: '10px', borderRadius: '50%' }}>
                <FileCheck size={20} />
              </div>
              <div>
                <div className="text-sm font-medium text-muted">Evaluated</div>
                <div className="font-bold" style={{ fontSize: '1.25rem' }}>14,78,912</div>
                <div style={{ color: 'var(--status-green)', fontSize: '0.75rem', fontWeight: 600 }}>78.27%</div>
              </div>
            </div>

          </div>
        </div>

        {/* Right: Donut Chart Placeholder */}
        <div className="card flex flex-col justify-between">
           <h3 style={{ fontSize: '1.1rem' }}>Processing Status</h3>
           <div className="flex items-center justify-between flex-1 mt-4">
              {/* Fake Donut Chart */}
              <div style={{ 
                width: '120px', height: '120px', borderRadius: '50%', 
                border: '15px solid var(--status-green)',
                borderTopColor: 'var(--status-orange)',
                borderRightColor: 'var(--status-blue)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column'
              }}>
                 <span className="text-sm text-muted">Total</span>
                 <span className="font-bold">18,92,456</span>
              </div>
              
              <div className="flex flex-col gap-3 text-sm">
                 <div className="flex justify-between gap-4"><span style={{ color: '#CBD5E1' }}>●</span> Not Started <span className="font-bold">2,13,544</span></div>
                 <div className="flex justify-between gap-4"><span style={{ color: 'var(--status-orange)' }}>●</span> Entry In Progress <span className="font-bold">2,56,781</span></div>
                 <div className="flex justify-between gap-4"><span style={{ color: 'var(--status-blue)' }}>●</span> OMR Completed <span className="font-bold">1,43,219</span></div>
                 <div className="flex justify-between gap-4"><span style={{ color: 'var(--status-green)' }}>●</span> Evaluated <span className="font-bold">14,78,912</span></div>
              </div>
           </div>
        </div>
      </div>

    </div>
  );
}
