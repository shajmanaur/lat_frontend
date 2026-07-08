'use client';
import React, { useEffect, useState } from 'react';
import { Users, User, ClipboardList, ArrowRight, UserCheck, UserX, FileCheck, CheckCircle, Info, UploadCloud, FileText, Calendar, Upload, ClipboardCheck, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LabelList } from 'recharts';
import Link from 'next/link';
import { api } from '@/services/api';

const sparkData1 = [{ v: 40 }, { v: 55 }, { v: 45 }, { v: 70 }, { v: 60 }, { v: 80 }, { v: 72 }];
const sparkData2 = [{ v: 30 }, { v: 50 }, { v: 40 }, { v: 65 }, { v: 55 }, { v: 75 }, { v: 68 }];
const sparkData3 = [{ v: 20 }, { v: 35 }, { v: 50 }, { v: 45 }, { v: 60 }, { v: 55 }, { v: 70 }];
const sparkData4 = [{ v: 50 }, { v: 40 }, { v: 60 }, { v: 55 }, { v: 70 }, { v: 65 }, { v: 80 }];

const GRADE_FALLBACK_COLORS = ['#818CF8', '#F472B6', '#22D3EE', '#FBBF24', '#A78BFA', '#34D399'];

export default function AdminDashboard({ roleName }: { roleName: string }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    coordinators: 0, teachers: 0, students: 0, omrEntered: 0,
    studentsPresent: 0, studentsAbsent: 0, evaluated: 0,
  });
  const [gradeData, setGradeData] = useState<any[]>([]);
  const [regionData, setRegionData] = useState<any[]>([]);
  const [processingData, setProcessingData] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const statsRes = await api.get('/dashboard/stats');
        const d = statsRes.data?.response || statsRes.data;
        if (d) {
          setStats({
            coordinators: d.coordinators || 0,
            teachers: d.teachers || 0,
            students: d.students || 0,
            omrEntered: d.omrEntered || 0,
            studentsPresent: d.studentsPresent || 0,
            studentsAbsent: d.studentsAbsent || 0,
            evaluated: d.evaluated || 0,
          });
          if (d.processingData && d.processingData.length > 0) setProcessingData(d.processingData);
          if (d.gradeData && d.gradeData.length > 0) setGradeData(d.gradeData);
          if (d.regionData && d.regionData.length > 0) setRegionData(d.regionData);
          if (d.activities && d.activities.length > 0) {
            setActivities(d.activities.map((act: any, i: number) => {
              let timeLabel = act.timeLabel || '';
              if (!timeLabel && act.time) {
                const diff = Date.now() - new Date(act.time).getTime();
                const mins = Math.floor(diff / 60000);
                if (mins < 1) timeLabel = 'Just now';
                else if (mins < 60) timeLabel = `${mins}m ago`;
                else if (mins < 1440) timeLabel = `${Math.floor(mins / 60)}h ago`;
                else timeLabel = `${Math.floor(mins / 1440)}d ago`;
              }
              return {
                id: i, text: act.text || act.message, subtext: act.subtext || '', bg: act.bg || '#f1f5f9',
                timeLabel, icon_type: act.icon_type,
                icon: act.icon_type === 'check' ? <CheckCircle size={16} color="#10B981" /> : act.icon_type === 'upload' ? <UploadCloud size={16} color="#4F46E5" /> : <FileText size={16} color="#3B82F6" />,
              };
            }));
          }
        }

        // --- Students (for grade + region grouping) ---
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading dashboard data...</div>;
  }

  const presentPct = stats.students > 0 ? ((stats.studentsPresent / stats.students) * 100).toFixed(2) : '0.00';
  const absentPct = stats.students > 0 ? ((stats.studentsAbsent / stats.students) * 100).toFixed(2) : '0.00';
  const omrPct = stats.omrEntered > 0 ? ((stats.omrEntered / stats.students) * 100).toFixed(2) : '0.00';
  const evalPct = stats.omrEntered > 0 ? ((stats.evaluated / stats.students) * 100).toFixed(2) : '0.00';
  const maxRegionValue = regionData.length > 0 ? Math.max(...regionData.map((r: any) => r.value)) : 1;
  const totalProcessed = processingData.reduce((sum: number, d: any) => sum + d.value, 0);

  const Sparkline = ({ data, color, id }: { data: any[]; color: string; id: string }) => (
    <div style={{ width: '64px', height: '32px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.15} />
              <stop offset="100%" stopColor={color} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#${id})`} dot={false} activeDot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  const renderBarLabel = (props: any) => {
    const { x, y, width, value } = props;
    return (
      <text x={x + width / 2} y={y - 6} fill="#475569" textAnchor="middle" fontSize={11} fontWeight={500}>
        {value?.toLocaleString('en-IN')}
      </text>
    );
  };

  return (
    <div className="flex flex-col" style={{ gap: '20px' }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1e293b' }}>
            Welcome back, {roleName}! 👋
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>Here's what's happening with LAT Assessment today.</p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 16px', borderRadius: '10px',
          border: '1px solid #e2e8f0', background: '#fff',
          fontSize: '0.85rem', color: '#475569', cursor: 'pointer',
        }}>
          <Calendar size={16} color="#64748b" />
          LAT 2025
          <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>▼</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-4" style={{ gap: '16px' }}>
        {[
          { label: 'Coordinators', value: stats.coordinators, sub: 'Active Coordinators', bg: '#EDE9FE', icon: <Users size={20} />, color: '#6366F1', link: '/coordinators', spark: sparkData1, id: 'sparkPurple' },
          { label: 'Teachers', value: stats.teachers, sub: 'Across All Schools', bg: '#D1FAE5', icon: <User size={20} />, color: '#10B981', link: '/teachers', spark: sparkData2, id: 'sparkGreen' },
          { label: 'Students Registered', value: stats.students, sub: 'Total Students', bg: '#FFEDD5', icon: <Users size={20} />, color: '#F97316', link: '/students', spark: sparkData3, id: 'sparkOrange' },
          { label: 'OMR Entered', value: stats.omrEntered, sub: 'Students Responses', bg: '#DBEAFE', icon: <ClipboardList size={20} />, color: '#3B82F6', link: '/omr-entry-status', spark: sparkData4, id: 'sparkBlue' },
        ].map((card, i) => (
          <div key={i} className="card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
              <div style={{ background: card.bg, color: card.color, padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {card.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{card.label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>{card.value.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '2px' }}>{card.sub}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Link href={card.link} style={{ fontSize: '0.75rem', fontWeight: 600, color: card.color, display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                View details <ArrowRight size={12} />
              </Link>
              <Sparkline data={card.spark} color={card.color} id={card.id} />
            </div>
          </div>
        ))}
      </div>

      {/* Middle Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>

        {/* Assessment Overview */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '20px' }}>Assessment Overview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {[
              { label: 'Students Present', value: stats.studentsPresent, pct: presentPct, bg: '#EDE9FE', icon: <UserCheck size={20} color="#8B5CF6" />, pctColor: '#10B981' },
              { label: 'Students Absent', value: stats.studentsAbsent, pct: absentPct, bg: '#FEE2E2', icon: <UserX size={20} color="#EF4444" />, pctColor: '#EF4444' },
              { label: 'OMR Entered', value: stats.omrEntered, pct: omrPct, bg: '#DBEAFE', icon: <FileCheck size={20} color="#3B82F6" />, pctColor: '#10B981' },
              { label: 'Evaluated', value: stats.evaluated, pct: evalPct, bg: '#D1FAE5', icon: <CheckCircle size={20} color="#10B981" />, pctColor: '#10B981' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ background: item.bg, padding: '12px', borderRadius: '50%', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.icon}
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 500, marginBottom: '4px' }}>{item.label}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>{item.value.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: item.pctColor, marginTop: '2px' }}>{item.pct}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Processing Status Donut */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>Processing Status</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '200px', height: '200px', flexShrink: 0 }}>
              <PieChart width={200} height={200}>
                <Pie data={processingData} cx="50%" cy="50%" innerRadius={58} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                  {processingData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <g>
                  <text x="50%" y="44%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '11px', fill: '#94a3b8' }}>Total</text>
                  <text x="50%" y="53%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '18px', fontWeight: 700, fill: '#1e293b' }}>{totalProcessed.toLocaleString('en-IN')}</text>
                  <text x="50%" y="63%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '11px', fill: '#94a3b8' }}>Students</text>
                </g>
              </PieChart>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
              {processingData.map((d: any, i: number) => {
                const pct = totalProcessed > 0 ? ((d.value / totalProcessed) * 100).toFixed(2) : '0.00';
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.color, flexShrink: 0 }}></span>
                    <div style={{ flex: 1, fontSize: '0.78rem', color: '#475569', fontWeight: 500 }}>{d.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 500, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {d.value.toLocaleString('en-IN')} <span style={{ color: '#94a3b8' }}>({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>

        {/* Students by Grade */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>Students by Grade</h3>
            <div style={{ padding: '6px', background: '#f1f5f9', borderRadius: '6px' }}>
              <BarChart3 size={14} color="#94a3b8" />
            </div>
          </div>
          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(val) => val >= 100000 ? `${(val / 100000).toFixed(0)}L` : val.toString()} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                <Bar dataKey="students" radius={[6, 6, 0, 0]} maxBarSize={48} barSize={48}>
                  {gradeData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || GRADE_FALLBACK_COLORS[index % GRADE_FALLBACK_COLORS.length]} />
                  ))}
                  <LabelList dataKey="students" content={renderBarLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Students by Region */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>Students by Region (Top 5)</h3>
            <div style={{ padding: '6px', background: '#f1f5f9', borderRadius: '6px' }}>
              <BarChart3 size={14} color="#94a3b8" />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', flex: 1, justifyContent: 'center' }}>
            {regionData.length === 0 && (
              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', padding: '20px' }}>No region data available</div>
            )}
            {regionData.map((region: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '80px', fontSize: '0.75rem', color: '#475569', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={region.name}>{region.name}</div>
                <div style={{ flex: 1, background: '#f1f5f9', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ background: '#6366F1', height: '100%', borderRadius: '5px', width: `${maxRegionValue > 0 ? (region.value / maxRegionValue) * 100 : 0}%`, transition: 'width 0.5s ease' }}></div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>{region.value.toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>Recent Activities</h3>
            <Link href="#" style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6366F1', textDecoration: 'none' }}>View all</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {activities.length === 0 && (
              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', padding: '20px' }}>No activities yet</div>
            )}
            {activities.map((act: any) => (
              <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', background: act.bg || '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {act.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.3 }}>{act.text}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>{act.subtext}</div>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap', flexShrink: 0 }}>{act.timeLabel}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
        borderRadius: '12px', padding: '16px 20px',
        display: 'flex', alignItems: 'flex-start', gap: '12px',
        border: '1px solid #C7D2FE',
      }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
          <Info size={16} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4338CA' }}>Important Note</div>
          <div style={{ fontSize: '0.78rem', color: '#4F46E5', marginTop: '4px', lineHeight: 1.5 }}>Reports are generated based on evaluated data. Please ensure OMR entry is completed for accurate results.</div>
        </div>
      </div>

    </div>
  );
}
