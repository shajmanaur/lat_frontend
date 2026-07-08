'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Users, GraduationCap, ClipboardCheck, Clock, ArrowRight, UserPlus, UserCheck, FilePlus, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';
import { dashboardApi, omrStudentsApi, teachersApi } from '@/services/api';
import { ShimmerCard, ShimmerTable } from '@/components/ui/Shimmer';

const GRADE_COLORS: Record<string, string> = {
  'Grade 3': '#4C35E6',
  'Grade 5': '#3B82F6',
  'Grade 8': '#10B981',
  'Grade 10': '#F59E0B',
};

const FALLBACK_COLORS = ['#4C35E6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

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
  const [stats, setStats] = useState<any>(null);
  const [omrStudents, setOmrStudents] = useState<any[]>([]);
  const [teacherMap, setTeacherMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, omrRes, teachersRes] = await Promise.all([
          dashboardApi.getStats(),
          omrStudentsApi.getStudents(),
          teachersApi.getTeachers(),
        ]);
        if (statsRes.status === true) {
          setStats(statsRes.response);
        } else if (statsRes.response) {
          setStats(statsRes.response);
        }
        const omrData = omrRes?.response?.data || omrRes?.response || [];
        if (Array.isArray(omrData)) {
          setOmrStudents(omrData);
        }
        // Build teacher map: email -> name
        const tData = teachersRes?.response?.data?.teachers || [];
        const map: Record<string, string> = {};
        tData.forEach((t: any) => {
          if (t.email && t.name) {
            map[t.email.toLowerCase()] = t.name;
            // Also map email prefix (without @domain) for partial matches
            const prefix = t.email.split('@')[0];
            map[prefix.toLowerCase()] = t.name;
          }
        });
        setTeacherMap(map);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        {/* Header Shimmer */}
        <div style={{ height: '60px', width: '30%', background: '#F1F5F9', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4">
          <ShimmerCard />
          <ShimmerCard />
          <ShimmerCard />
          <ShimmerCard />
        </div>
        {/* Chart / List Shimmer */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2"><ShimmerCard height="400px" /></div>
          <div className="col-span-1"><ShimmerCard height="400px" /></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Failed to load dashboard.</div>;
  }

  const teachers = stats.teachers || 0;
  const students = stats.students || 0;
  const omrEntered = stats.omrEntered || 0;
  const gradeData = stats.gradeData || [];
  const activities = stats.activities || [];

  // Build student lookup by name for grade/section
  const studentMap: Record<string, any> = {};
  omrStudents.forEach((s: any) => {
    studentMap[s.full_name] = s;
  });

  // Resolve teacher name from "By" text
  const resolveTeacherName = (byText: string): string => {
    if (!byText) return 'You';
    const clean = byText.trim();
    // Direct match on email
    if (teacherMap[clean.toLowerCase()]) return teacherMap[clean.toLowerCase()];
    // Match on email prefix (e.g. "mock_teacher_1783337675841_1" from "Teacher_1783337675841_1")
    const prefix = clean.toLowerCase();
    if (teacherMap[prefix]) return teacherMap[prefix];
    // Try with "mock_" prefix
    if (teacherMap[`mock_${prefix}`]) return teacherMap[`mock_${prefix}`];
    // Try matching by email parts
    for (const [email, name] of Object.entries(teacherMap)) {
      const emailPrefix = email.split('@')[0];
      if (emailPrefix === prefix || emailPrefix === `mock_${prefix}`) return name;
    }
    return clean;
  };

  const pieData = gradeData.map((g: any, i: number) => ({
    name: g.name || g.grade_name || `Grade ${i + 1}`,
    students: g.students || g.count || 0,
    fill: GRADE_COLORS[g.name || g.grade_name] || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
  }));

  const totalStudents = pieData.reduce((sum: number, p: any) => sum + p.students, 0);

  const statCards = [
    { label: 'Total Teachers', value: teachers, icon: Users, color: '#4C35E6', bg: 'rgba(76,53,230,0.1)', trend: '+8 this week', trendUp: true },
    { label: 'Total Students', value: students.toLocaleString(), icon: GraduationCap, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', trend: '+156 this week', trendUp: true },
    { label: 'OMR Results Added', value: omrEntered.toLocaleString(), icon: ClipboardCheck, color: '#10B981', bg: 'rgba(16,185,129,0.1)', trend: '+245 this week', trendUp: true },
    { label: 'Classes Managed', value: pieData.filter((p: any) => p.students > 0).length || 36, icon: Clock, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', trend: 'No change', trendUp: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Welcome back, {roleName}! <span style={{ fontSize: '1.5rem' }}>👋</span>
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>
            Here's an overview of teachers, students and assessments.
          </p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 16px', borderRadius: '10px', border: '1px solid #E2E8F0',
          background: 'white', fontSize: '0.85rem', color: '#334155', cursor: 'pointer',
        }}>
          <Calendar size={16} color="#64748B" />
          <span>20 May 2025 - 26 May 2025</span>
          <ChevronRight size={14} color="#94A3B8" style={{ transform: 'rotate(90deg)' }} />
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} style={{
              background: 'white', borderRadius: '12px', padding: '14px 16px',
              border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '10px',
                background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={20} color={card.color} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>{card.label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}>{card.value}</div>
                <div style={{ fontSize: '0.6875rem', color: card.trendUp ? '#10B981' : '#94A3B8', fontWeight: 500, marginTop: '2px' }}>
                  {card.trendUp && <span style={{ marginRight: '4px' }}>↑</span>}
                  {card.trend}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>

        {/* OMR Results Overview */}
        <div style={{
          background: 'white', borderRadius: '16px', padding: '24px',
          border: '1px solid #F1F5F9',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: '#1E293B' }}>OMR Results Overview</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#64748B' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4C35E6', display: 'inline-block' }}></span>
                OMR Results Added
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#64748B' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }}></span>
                Pending Entry
              </div>
              <button style={{
                padding: '6px 12px', borderRadius: '8px', border: '1px solid #E2E8F0',
                background: 'white', fontSize: '0.8rem', color: '#334155', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                This Week
                <ChevronRight size={12} style={{ transform: 'rotate(90deg)' }} />
              </button>
            </div>
          </div>
          <div style={{ width: '100%', height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockLineData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '0.85rem' }}
                />
                <Line type="monotone" dataKey="results" stroke="#4C35E6" strokeWidth={2.5} dot={{ r: 4, fill: '#4C35E6' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4, fill: '#F59E0B' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Students by Grade */}
        <div style={{
          background: 'white', borderRadius: '16px', padding: '24px',
          border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column',
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px 0', color: '#1E293B' }}>Students by Grade</h3>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative', width: '180px', height: '180px', flexShrink: 0 }}>
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                textAlign: 'center', zIndex: 1,
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>{totalStudents.toLocaleString()}</div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Total</div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              {pieData.map((d: any, i: number) => {
                const pct = totalStudents > 0 ? ((d.students / totalStudents) * 100).toFixed(1) : '0';
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.fill, flexShrink: 0 }}></span>
                    <span style={{ color: '#64748B', flex: 1 }}>{d.name}</span>
                    <span style={{ fontWeight: 600, color: '#1E293B' }}>{d.students.toLocaleString()}</span>
                    <span style={{ color: '#94A3B8', fontSize: '0.75rem', minWidth: '42px', textAlign: 'right' }}>({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
          <Link href="/coordinator/students" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: '16px', padding: '12px 0', borderTop: '1px solid #F1F5F9',
            color: '#4C35E6', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none',
          }}>
            View Student List
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>

        {/* Recent OMR Results Table */}
        <div style={{
          background: 'white', borderRadius: '16px', padding: '24px',
          border: '1px solid #F1F5F9',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: '#1E293B' }}>Recent OMR Results Added</h3>
            <Link href="/coordinator/omr-status" style={{
              color: '#4C35E6', fontSize: '0.8rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none',
            }}>
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                {['S.No.', 'Student Name', 'Grade', 'Section', 'Added On', 'Added By'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: '#64748B', fontSize: '0.8rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#94A3B8' }}>No recent results found.</td>
                </tr>
              ) : (
                activities.slice(0, 5).map((act: any, idx: number) => {
                  const studentName = act.subtext?.split('|')[0]?.replace('Student:', '').trim() || '';
                  const student = studentMap[studentName];
                  const gradeName = student?.grade?.grade_name || student?.grade_name || '—';
                  const section = student?.section || '—';
                  return (
                    <tr key={act.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 16px', color: '#64748B' }}>{idx + 1}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 500, color: '#1E293B' }}>{studentName}</td>
                      <td style={{ padding: '14px 16px', color: '#64748B' }}>{gradeName}</td>
                      <td style={{ padding: '14px 16px', color: '#64748B' }}>{section}</td>
                      <td style={{ padding: '14px 16px', color: '#64748B' }}>{act.time ? new Date(act.time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                      <td style={{ padding: '14px 16px', color: '#64748B' }}>{resolveTeacherName(act.subtext?.split('|')[1]?.replace('By:', '').trim() || '')}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {activities.length > 0 && (
            <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#94A3B8' }}>
              Showing 1 to {Math.min(5, activities.length)} of {activities.length} entries
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{
          background: 'white', borderRadius: '16px', padding: '24px',
          border: '1px solid #F1F5F9',
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px 0', color: '#1E293B' }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { href: '/coordinator/teachers', icon: UserPlus, color: '#4C35E6', bg: 'rgba(76,53,230,0.1)', title: 'Add Teacher', desc: 'Create a new teacher profile' },
              { href: '/coordinator/allocations', icon: UserCheck, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', title: 'Teacher Allocation', desc: 'Assign teachers to grade & section' },
              { href: '/coordinator/students', icon: GraduationCap, color: '#10B981', bg: 'rgba(16,185,129,0.1)', title: 'Add Student', desc: 'Register a new student' },
              { href: '/admin/omr', icon: FilePlus, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', title: 'Add OMR Result', desc: 'Enter OMR assessment results' },
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <Link key={i} href={action.href} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '16px', borderRadius: '12px', border: '1px solid #F1F5F9',
                  textDecoration: 'none', transition: 'all 0.2s', background: '#FAFBFC',
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: action.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon size={18} color={action.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1E293B' }}>{action.title}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '2px', lineHeight: 1.3 }}>{action.desc}</div>
                  </div>
                  <ChevronRight size={16} color="#CBD5E1" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
