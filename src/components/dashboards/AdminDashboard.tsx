'use client';
import React, { useEffect, useState } from 'react';
import { Users, User, ClipboardList, ArrowRight, UserCheck, UserX, FileCheck, CheckCircle, Info, UploadCloud, FileText, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';
import axios from 'axios';

export default function AdminDashboard({ roleName }: { roleName: string }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    coordinators: 0,
    teachers: 0,
    students: 0,
    omrEntered: 0,
    studentsPresent: 0,
    studentsAbsent: 0,
    evaluated: 0,
  });
  
  const [gradeData, setGradeData] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [processingData, setProcessingData] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
        const res = await axios.get(`${apiUrl}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.status === true) {
          const d = res.data.response;
          setStats({
            coordinators: d.coordinators || 0,
            teachers: d.teachers || 0,
            students: d.students || 0,
            omrEntered: d.omrEntered || 0,
            studentsPresent: d.studentsPresent || 0,
            studentsAbsent: d.studentsAbsent || 0,
            evaluated: d.evaluated || 0,
          });
          setGradeData(d.gradeData || []);
          setRegionData(d.regionData || []);
          setProcessingData(d.processingData || []);
          
          const mappedActivities = (d.activities || []).map((act: any) => ({
            ...act,
            icon: act.icon_type === 'check' ? <CheckCircle size={16} color="#10B981" /> : <FileText size={16} color="#3B82F6" />
          }));
          setActivities(mappedActivities);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading dashboard data...</div>;
  }

  const presentPct = stats.students > 0 ? ((stats.studentsPresent / stats.students) * 100).toFixed(2) : '0.00';
  const absentPct = stats.students > 0 ? ((stats.studentsAbsent / stats.students) * 100).toFixed(2) : '0.00';
  const omrPct = stats.students > 0 ? ((stats.omrEntered / stats.students) * 100).toFixed(2) : '0.00';
  const evalPct = stats.students > 0 ? ((stats.evaluated / stats.students) * 100).toFixed(2) : '0.00';

  const maxRegionValue = regionData.length > 0 ? Math.max(...regionData.map((r: any) => r.value)) : 1;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            Welcome back, {roleName}! <span>👋</span>
          </h1>
          <p className="text-muted text-sm mt-1">Here's what's happening with LAT Assessment today.</p>
        </div>
        <button className="btn btn-outline bg-white border-slate-200">
          <Calendar size={16} className="text-muted" />
          <span style={{ fontSize: '0.85rem' }}>LAT 2025</span>
          <span style={{ fontSize: '0.7rem' }}>▼</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="card flex flex-col justify-between" style={{ padding: '1.25rem' }}>
          <div className="flex items-start gap-4 mb-4">
            <div style={{ background: '#6366F1', color: 'white', padding: '12px', borderRadius: '12px' }}>
              <Users size={24} />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-800">Coordinators</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.2 }}>{stats.coordinators.toLocaleString('en-IN')}</div>
              <div className="text-xs text-muted mt-1">Active Coordinators</div>
            </div>
          </div>
          <Link href="/coordinators" className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
            View details <ArrowRight size={12} />
          </Link>
        </div>

        <div className="card flex flex-col justify-between" style={{ padding: '1.25rem' }}>
          <div className="flex items-start gap-4 mb-4">
            <div style={{ background: '#10B981', color: 'white', padding: '12px', borderRadius: '12px' }}>
              <User size={24} />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-800">Teachers</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.2 }}>{stats.teachers.toLocaleString('en-IN')}</div>
              <div className="text-xs text-muted mt-1">Across All Schools</div>
            </div>
          </div>
          <Link href="/teachers" className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
            View details <ArrowRight size={12} />
          </Link>
        </div>

        <div className="card flex flex-col justify-between" style={{ padding: '1.25rem' }}>
          <div className="flex items-start gap-4 mb-4">
            <div style={{ background: '#F97316', color: 'white', padding: '12px', borderRadius: '12px' }}>
              <Users size={24} />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-800">Students Registered</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.2 }}>{stats.students.toLocaleString('en-IN')}</div>
              <div className="text-xs text-muted mt-1">Total Students</div>
            </div>
          </div>
          <Link href="/students" className="text-xs font-semibold text-orange-500 flex items-center gap-1">
            View details <ArrowRight size={12} />
          </Link>
        </div>

        <div className="card flex flex-col justify-between" style={{ padding: '1.25rem' }}>
          <div className="flex items-start gap-4 mb-4">
            <div style={{ background: '#3B82F6', color: 'white', padding: '12px', borderRadius: '12px' }}>
              <ClipboardList size={24} />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-800">OMR Entered</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.2 }}>{stats.omrEntered.toLocaleString('en-IN')}</div>
              <div className="text-xs text-muted mt-1">Students Responses</div>
            </div>
          </div>
          <Link href="/omr-entry-status" className="text-xs font-semibold text-blue-500 flex items-center gap-1">
            View details <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Middle Row: Assessment Overview & Processing Status */}
      <div className="grid gap-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
        
        {/* Assessment Overview */}
        <div className="card flex flex-col">
          <h3 className="font-semibold text-slate-800 mb-6">Assessment Overview</h3>
          <div className="grid grid-cols-4 gap-4 flex-1 items-center">
            
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-2" style={{ background: '#EDE9FE', padding: '12px', borderRadius: '50%' }}>
                <UserCheck size={24} color="#8B5CF6" />
              </div>
              <div className="text-xs text-slate-500 font-medium mb-1">Students Present</div>
              <div className="font-bold text-lg text-slate-800">{stats.studentsPresent.toLocaleString('en-IN')}</div>
              <div className="text-xs font-semibold text-emerald-500 mt-1">{presentPct}%</div>
            </div>

            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-2" style={{ background: '#FEE2E2', padding: '12px', borderRadius: '50%' }}>
                <UserX size={24} color="#EF4444" />
              </div>
              <div className="text-xs text-slate-500 font-medium mb-1">Students Absent</div>
              <div className="font-bold text-lg text-slate-800">{stats.studentsAbsent.toLocaleString('en-IN')}</div>
              <div className="text-xs font-semibold text-red-500 mt-1">{absentPct}%</div>
            </div>

            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-2" style={{ background: '#DBEAFE', padding: '12px', borderRadius: '50%' }}>
                <FileCheck size={24} color="#3B82F6" />
              </div>
              <div className="text-xs text-slate-500 font-medium mb-1">OMR Entered</div>
              <div className="font-bold text-lg text-slate-800">{stats.omrEntered.toLocaleString('en-IN')}</div>
              <div className="text-xs font-semibold text-emerald-500 mt-1">{omrPct}%</div>
            </div>

            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-2" style={{ background: '#D1FAE5', padding: '12px', borderRadius: '50%' }}>
                <CheckCircle size={24} color="#10B981" />
              </div>
              <div className="text-xs text-slate-500 font-medium mb-1">Evaluated</div>
              <div className="font-bold text-lg text-slate-800">{stats.evaluated.toLocaleString('en-IN')}</div>
              <div className="text-xs font-semibold text-emerald-500 mt-1">{evalPct}%</div>
            </div>

          </div>
        </div>

        {/* Processing Status Donut */}
        <div className="card flex flex-col">
          <h3 className="font-semibold text-slate-800 mb-2">Processing Status</h3>
          <div className="flex gap-4 items-center flex-1">
            <div className="w-1/2 relative h-full flex items-center justify-center min-h-[160px]">
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-slate-500">Total</span>
                <span className="font-bold text-slate-800">{stats.students.toLocaleString('en-IN')}</span>
                <span className="text-xs text-slate-500">Students</span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={processingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {processingData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 flex flex-col gap-3 text-xs">
              {processingData.map((d: any, i: number) => (
                <div key={i} className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ color: d.color }}>●</span>
                    <span className="text-slate-600 font-medium">{d.name}</span>
                  </div>
                  <div className="flex items-center justify-between pl-4 text-slate-500">
                    <span>{d.value.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Charts & Activities */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Students by Grade */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 text-sm">Students by Grade</h3>
            <div className="p-1.5 bg-slate-100 rounded text-slate-400">
              <BarChart size={14} />
            </div>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(val) => val >= 100000 ? `${(val/100000).toFixed(0)}L` : val.toString()} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="students" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {gradeData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Students by Region */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 text-sm">Students by Region (Top 5)</h3>
            <div className="p-1.5 bg-slate-100 rounded text-slate-400">
              <BarChart size={14} />
            </div>
          </div>
          <div className="flex flex-col gap-4 flex-1 justify-center">
            {regionData.map((region: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-20 text-xs text-slate-600 truncate" title={region.name}>{region.name}</div>
                <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(region.value / maxRegionValue) * 100}%` }}></div>
                </div>
                <div className="w-16 text-right text-xs font-semibold text-slate-700">{region.value.toLocaleString('en-IN')}</div>
              </div>
            ))}
            {regionData.length === 0 && (
              <div className="text-center text-xs text-slate-500">No data available</div>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 text-sm">Recent Activities</h3>
            <Link href="#" className="text-xs font-medium text-indigo-600">View all</Link>
          </div>
          <div className="flex flex-col gap-4">
            {activities.map((act: any) => (
              <div key={act.id} className="flex gap-3">
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: act.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {act.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-800 truncate">{act.text}</div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{act.subtext}</div>
                </div>
                <div className="text-[10px] text-slate-400 whitespace-nowrap">
                  {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="text-center text-xs text-slate-500">No activities yet</div>
            )}
          </div>
        </div>

      </div>

      {/* Info Banner */}
      <div className="bg-indigo-50 rounded-xl p-4 flex items-start gap-3 border border-indigo-100">
        <Info size={20} className="text-indigo-600 mt-0.5" />
        <div>
          <div className="text-sm font-semibold text-indigo-900">Important Note</div>
          <div className="text-xs text-indigo-700 mt-1">Reports are generated based on evaluated data. Please ensure OMR entry is completed for accurate results.</div>
        </div>
      </div>

    </div>
  );
}
