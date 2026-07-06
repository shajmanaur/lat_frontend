'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Users, GraduationCap, ClipboardCheck, LayoutGrid, ArrowRight, UserPlus, UserCheck, FilePlus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';
import axios from 'axios';

// Mock line data for now since backend doesn't aggregate by date yet
const mockLineData = [
  { name: '20 May', results: 200, pending: 800 },
  { name: '21 May', results: 300, pending: 700 },
  { name: '22 May', results: 500, pending: 500 },
  { name: '23 May', results: 450, pending: 550 },
  { name: '24 May', results: 600, pending: 400 },
  { name: '25 May', results: 800, pending: 200 },
  { name: '26 May', results: 1200, pending: 100 },
];

export default function CoordinatorDashboard({ roleName }: { roleName: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
        const res = await axios.get(`${apiUrl}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.status) {
          setData(res.data.response);
        }
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading dashboard data...</div>;
  }

  if (!data) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Failed to load dashboard.</div>;
  }

  // Map Backend Data
  const pieData = data.gradeData || [];
  const recentResults = data.activities || [];

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
          <span style={{ fontSize: '0.85rem' }}>Overview</span>
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
            <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>{data.teachers}</span>
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
            <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>{data.students}</span>
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
            <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>{data.omrEntered}</span>
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
            <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>{pieData.filter((p:any) => p.students > 0).length || 3}</span>
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
            </div>
          </div>
          <div style={{ width: '100%', height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockLineData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
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
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.students}</div>
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
                  dataKey="students"
                  stroke="none"
                >
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} students`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-2 text-sm pl-4">
            {pieData.map((d: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <span style={{ color: d.fill }}>●</span>
                <span className="text-muted flex-1">{d.name}</span>
                <span className="font-semibold">{d.students}</span>
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
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: 500 }}>Student/Teacher</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: 500 }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: 500 }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentResults.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No recent activities found.</td>
                  </tr>
                ) : (
                  recentResults.map((res: any, idx: number) => (
                    <tr key={res.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px' }}>{idx + 1}</td>
                      <td style={{ padding: '12px', fontWeight: 500 }}>{res.subtext}</td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{res.text}</td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{new Date(res.time).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
