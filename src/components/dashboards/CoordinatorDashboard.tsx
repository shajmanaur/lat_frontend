import React from 'react';
import { Calendar, Users, GraduationCap, ClipboardCheck, LayoutGrid, ArrowRight, UserPlus, UserCheck, FilePlus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';

const lineData = [
  { name: '20 May', results: 200, pending: 800 },
  { name: '21 May', results: 300, pending: 700 },
  { name: '22 May', results: 500, pending: 500 },
  { name: '23 May', results: 450, pending: 550 },
  { name: '24 May', results: 600, pending: 400 },
  { name: '25 May', results: 800, pending: 200 },
  { name: '26 May', results: 1200, pending: 100 },
];

const pieData = [
  { name: 'Grade 3', value: 1256, color: '#4C35E6' },
  { name: 'Grade 5', value: 1489, color: '#10B981' },
  { name: 'Grade 8', value: 1482, color: '#F59E0B' },
  { name: 'Grade 10', value: 665, color: '#3B82F6' },
];

const recentResults = [
  { id: 1, name: 'Aman Sharma', grade: 'Grade 3', section: 'A', addedOn: '28 May 2025, 10:25 AM', addedBy: 'You' },
  { id: 2, name: 'Diya Singh', grade: 'Grade 5', section: 'B', addedOn: '28 May 2025, 09:45 AM', addedBy: 'You' },
  { id: 3, name: 'Kabir Verma', grade: 'Grade 3', section: 'C', addedOn: '28 May 2025, 09:20 AM', addedBy: 'You' },
  { id: 4, name: 'Riya Patel', grade: 'Grade 5', section: 'A', addedOn: '27 May 2025, 03:15 PM', addedBy: 'You' },
  { id: 5, name: 'Vihaan Kumar', grade: 'Grade 8', section: 'A', addedOn: '26 May 2025, 11:30 AM', addedBy: 'You' },
];

export default function CoordinatorDashboard({ roleName }: { roleName: string }) {
  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            Welcome back, {roleName}! <span>👋</span>
          </h1>
          <p className="text-muted text-sm mt-1">Here's an overview of teachers, students and assessments.</p>
        </div>
        <button className="btn btn-outline bg-white border-slate-200">
          <Calendar size={16} className="text-muted" />
          <span style={{ fontSize: '0.85rem' }}>20 May 2025 - 28 May 2025</span>
          <span style={{ fontSize: '0.7rem' }}>▼</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="card flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted flex items-center gap-2">
              <div style={{ color: '#4C35E6', background: 'rgba(76,53,230,0.1)', padding: '6px', borderRadius: '50%' }}>
                <Users size={16} />
              </div>
              Total Teachers
            </span>
            <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>128</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--status-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ↑ 8 this week
            </span>
          </div>
        </div>

        <div className="card flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted flex items-center gap-2">
              <div style={{ color: '#3B82F6', background: 'rgba(59,130,246,0.1)', padding: '6px', borderRadius: '50%' }}>
                <GraduationCap size={16} />
              </div>
              Total Students
            </span>
            <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>4,892</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--status-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ↑ 106 this week
            </span>
          </div>
        </div>

        <div className="card flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted flex items-center gap-2">
              <div style={{ color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '6px', borderRadius: '50%' }}>
                <ClipboardCheck size={16} />
              </div>
              OMR Results Added
            </span>
            <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>2,763</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--status-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ↑ 240 this week
            </span>
          </div>
        </div>

        <div className="card flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted flex items-center gap-2">
              <div style={{ color: '#F59E0B', background: 'rgba(245,158,11,0.1)', padding: '6px', borderRadius: '50%' }}>
                <LayoutGrid size={16} />
              </div>
              Classes Managed
            </span>
            <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>36</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              No change
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
        
        {/* Line Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 style={{ fontSize: '1rem' }}>OMR Results Overview</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2"><span style={{ color: '#4C35E6' }}>●</span> OMR Results Added</div>
              <div className="flex items-center gap-2"><span style={{ color: '#F59E0B' }}>●</span> Pending Entry</div>
              <button className="btn btn-outline border-slate-200" style={{ padding: '4px 10px', height: 'auto', fontSize: '0.75rem' }}>This Week ▼</button>
            </div>
          </div>
          <div style={{ width: '100%', height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="results" stroke="#4C35E6" strokeWidth={3} dot={{ r: 4, fill: '#4C35E6' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, fill: '#F59E0B' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="card flex flex-col">
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Students by Grade</h3>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>4,892</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>Total</div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} students`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-2 text-sm pl-4">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span style={{ color: d.color }}>●</span>
                <span className="text-muted flex-1">{d.name}</span>
                <span className="font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
        
        {/* Table */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 style={{ fontSize: '1rem' }}>Recent OMR Results Added</h3>
            <Link href="/omr" style={{ color: '#4C35E6', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: 500 }}>S.No.</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: 500 }}>Student Name</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: 500 }}>Grade</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: 500 }}>Section</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: 500 }}>Added On</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: 500 }}>Added By</th>
                </tr>
              </thead>
              <tbody>
                {recentResults.map((res) => (
                  <tr key={res.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px' }}>{res.id}</td>
                    <td style={{ padding: '12px', fontWeight: 500 }}>{res.name}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{res.grade}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{res.section}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{res.addedOn}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{res.addedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-muted mt-4" style={{ fontSize: '0.75rem' }}>
            Showing 1 to 5 of 5 entries
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card flex flex-col">
          <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4 flex-1">
            
            <Link href="/teachers" className="flex flex-col justify-center gap-2 hover:border-indigo-300" style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', transition: 'all 0.2s', background: '#F8FAFC' }}>
              <div style={{ color: '#4C35E6', background: 'rgba(76,53,230,0.1)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                <UserPlus size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Add Teacher</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Create a new teacher profile</div>
              </div>
            </Link>

            <Link href="/allocations" className="flex flex-col justify-center gap-2 hover:border-blue-300" style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', transition: 'all 0.2s', background: '#F8FAFC' }}>
              <div style={{ color: '#3B82F6', background: 'rgba(59,130,246,0.1)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                <UserCheck size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Teacher Allocation</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Assign teachers to grade</div>
              </div>
            </Link>

            <Link href="/students" className="flex flex-col justify-center gap-2 hover:border-emerald-300" style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', transition: 'all 0.2s', background: '#F8FAFC' }}>
              <div style={{ color: '#10B981', background: 'rgba(16,185,129,0.1)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                <UserPlus size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Add Student</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Register a new student</div>
              </div>
            </Link>

            <Link href="/omr" className="flex flex-col justify-center gap-2 hover:border-amber-300" style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', transition: 'all 0.2s', background: '#F8FAFC' }}>
              <div style={{ color: '#F59E0B', background: 'rgba(245,158,11,0.1)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                <FilePlus size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Add OMR Result</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Enter OMR assessment results</div>
              </div>
            </Link>

          </div>
        </div>

      </div>

    </div>
  );
}
