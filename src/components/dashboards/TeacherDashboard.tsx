'use client';

import React, { useState, useEffect } from 'react';
import { ClipboardList, Users, FileCheck, Clock, ChevronRight, Info, AlertTriangle, UserPlus, Headphones, Search } from 'lucide-react';
import Link from 'next/link';
import { studentsApi, dashboardApi, teachersApi, authApi, teacherOmrApi } from '@/services/api';
import { ShimmerCard, ShimmerTable } from '@/components/ui/Shimmer';

const avatarColors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export default function TeacherDashboard() {
  const [userName, setUserName] = useState('Teacher User');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAllocations: 0,
    studentsAllocated: 0,
    omrCompleted: 0,
    pendingOmr: 0,
    gradesCount: 0,
    sectionsCount: 0,
  });
  const [allocations, setAllocations] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [announcements] = useState([
    {
      id: 1,
      title: 'Welcome to LAT',
      description: 'Start by checking your allocations and entering OMR responses once students are added.',
      date: '20 May 2025',
      type: 'info',
    },
    {
      id: 2,
      title: 'OMR Entry Guidelines',
      description: 'Ensure all OMR data is entered carefully and submitted within the given timeline.',
      date: '18 May 2025',
      type: 'warning',
    },
  ]);

  const fetchDashboardData = async () => {
    try {
      // Get user info using centralized API
      try {
        const userRes = await authApi.getMe();
        const userData = userRes?.response?.data || userRes?.data;
        if (userData?.name) setUserName(userData.name);
      } catch {}

      // Get dashboard stats using centralized API (includes OMR stats)
      try {
        const statsRes = await dashboardApi.getStats();
        const statsData = statsRes?.response?.data || statsRes?.data || {};
        setStats({
          totalAllocations: statsData.totalAllocations || statsData.total_allocations || 0,
          studentsAllocated: statsData.studentsAllocated || statsData.students_allocated || 0,
          omrCompleted: statsData.omrCompleted || statsData.omr_completed || 0,
          pendingOmr: statsData.pendingOmr || statsData.pending_omr || 0,
          gradesCount: statsData.gradesCount || statsData.grades_count || 0,
          sectionsCount: statsData.sectionsCount || statsData.sections_count || 0,
        });
      } catch {}

      // Get teacher OMR summary using new endpoint
      try {
        const omrSummaryRes = await teacherOmrApi.getSummary();
        const omrData = omrSummaryRes?.response?.data || omrSummaryRes?.data || {};
        setStats(prev => ({
          ...prev,
          totalAllocations: omrData.totalGradesAssigned || omrData.totalGrades || omrData.total_grades || prev.totalAllocations,
          studentsAllocated: omrData.totalStudents || omrData.total_students || prev.studentsAllocated,
          omrCompleted: omrData.omrCompleted || omrData.omr_completed || prev.omrCompleted,
          pendingOmr: omrData.pending || omrData.pendingOmr || omrData.pending_omr || prev.pendingOmr,
        }));
      } catch {}

      // Get teacher allocations using teacherOmrApi
      try {
        const gradesRes = await teacherOmrApi.getGrades();
        const gradesData = gradesRes?.response?.data || gradesRes?.data || [];
        const teacherGrades = Array.isArray(gradesData) ? gradesData : [];
        
        // Map to allocations format expected by the UI
        const mappedAllocations = teacherGrades.map(g => ({
          grade: g.gradeName?.replace('Grade ', '') || g.gradeId,
          grade_name: g.gradeName,
          section: g.sections,
          students_count: g.students,
          gradeId: g.gradeId
        }));
        
        setAllocations(mappedAllocations);

        // Fetch students allocated to this teacher's grades
        const allStudents: any[] = [];
        
        for (const gradeObj of mappedAllocations) {
          if (!gradeObj.gradeId) continue;
          
          try {
            const studentRes = await teacherOmrApi.getStudents(gradeObj.gradeId);
            let studentList = [];
            if (studentRes?.data?.students) {
              studentList = studentRes.data.students;
            } else if (studentRes?.response?.data?.students) {
              studentList = studentRes.response.data.students;
            } else if (Array.isArray(studentRes?.data)) {
              studentList = studentRes.data;
            } else if (Array.isArray(studentRes)) {
              studentList = studentRes;
            }
            
            if (Array.isArray(studentList)) {
              allStudents.push(...studentList);
            }
          } catch (err) {
            console.error(`Failed to fetch students for grade ${gradeObj.gradeId}`, err);
          }
        }

        // Deduplicate by student id (though they should be unique per grade usually)
        const seen = new Set<number>();
        const unique = allStudents.filter((s: any) => {
          const id = s.id || s.student_id;
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });

        setStudents(unique);

        // Update stats with actual student count from API
        setStats(prev => ({
          ...prev,
          studentsAllocated: unique.length,
        }));
      } catch {}
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'long' });

  const filteredStudents = students.filter((s: any) => {
    if (!studentSearch) return true;
    const q = studentSearch.toLowerCase();
    const name = (s.name || s.student_name || s.full_name || '').toLowerCase();
    const apaar = (s.apaarId || s.apaar_id || '').toLowerCase();
    return name.includes(q) || apaar.includes(q);
  });

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '4px' }}>
            Welcome back, {userName}! 👋
          </p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#1E293B' }}>Teacher Dashboard</h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '4px' }}>
            Here's an overview of your assessment activities and tasks.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '0.875rem' }}>
          <span>{today}</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <Link href="/allocations" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '16px 20px', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'box-shadow 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ClipboardList size={22} color="#6366F1" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Total Allocations</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>{stats.totalAllocations}</div>
                <div style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '2px' }}>{stats.gradesCount} Grades • {stats.sectionsCount} Sections</div>
              </div>
            </div>
            <ChevronRight size={18} color="#94A3B8" />
          </div>
        </Link>

        <Link href="/allocations" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '16px 20px', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'box-shadow 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={22} color="#10B981" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Students Allocated</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>{stats.studentsAllocated}</div>
                <div style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '2px' }}>Across all allocations</div>
              </div>
            </div>
            <ChevronRight size={18} color="#94A3B8" />
          </div>
        </Link>

        <Link href="/omr-entry-status" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '16px 20px', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'box-shadow 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileCheck size={22} color="#F59E0B" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>OMR Completed</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>{stats.omrCompleted}</div>
                <div style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '2px' }}>0% Completion</div>
              </div>
            </div>
            <ChevronRight size={18} color="#94A3B8" />
          </div>
        </Link>

        <Link href="/omr-entry-status" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '16px 20px', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'box-shadow 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={22} color="#EF4444" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Pending OMR</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>{stats.pendingOmr}</div>
                <div style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '2px' }}>0% Pending</div>
              </div>
            </div>
            <ChevronRight size={18} color="#94A3B8" />
          </div>
        </Link>
      </div>

      {/* Main Content Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* My Allocations */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #F1F5F9' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1E293B', marginBottom: '24px' }}>My Allocations</h3>
            
            {allocations.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <ClipboardList size={48} color="#6366F1" strokeWidth={1.5} />
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#1E293B', marginBottom: '8px' }}>No Allocations Yet</h4>
                <p style={{ color: '#64748B', fontSize: '0.875rem', textAlign: 'center', maxWidth: '400px', marginBottom: '20px' }}>
                  You don't have any grade or section allocations yet. Once allocations are assigned by the coordinator, they will appear here.
                </p>
                <Link href="/allocations" style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
                  borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white',
                  fontSize: '0.875rem', fontWeight: 500, color: '#6366F1', textDecoration: 'none',
                }}>
                  <ClipboardList size={16} />
                  View All Allocations
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {allocations.slice(0, 5).map((alloc: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#FAFBFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#6366F1' }}>
                        {alloc.grade || alloc.grade_name || '-'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: '#1E293B', fontSize: '0.875rem' }}>Grade {alloc.grade || alloc.grade_name} - Section {alloc.section}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{alloc.students_count || 0} students</div>
                      </div>
                    </div>
                    <Link href="/teacher/omr-entry-status" style={{ padding: '6px 12px', borderRadius: '8px', background: '#6366F1', color: 'white', fontSize: '0.75rem', fontWeight: 500, textDecoration: 'none' }}>
                      Enter OMR
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Students */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1E293B', margin: 0 }}>My Students</h3>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{students.length} allocated</span>
            </div>

            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search by student name or APAAR ID"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.8125rem', outline: 'none', color: '#1E293B', height: '40px', boxSizing: 'border-box' }}
              />
            </div>

            {students.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Users size={36} color="#94A3B8" strokeWidth={1.5} />
                </div>
                <p style={{ color: '#64748B', fontSize: '0.875rem', textAlign: 'center' }}>No students allocated yet</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', maxHeight: '360px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#FAFBFC', zIndex: 1 }}>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500, color: '#64748B', borderBottom: '1px solid #F1F5F9', fontSize: '0.75rem' }}>S.No</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500, color: '#64748B', borderBottom: '1px solid #F1F5F9', fontSize: '0.75rem' }}>Name</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500, color: '#64748B', borderBottom: '1px solid #F1F5F9', fontSize: '0.75rem' }}>Grade</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500, color: '#64748B', borderBottom: '1px solid #F1F5F9', fontSize: '0.75rem' }}>Section</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500, color: '#64748B', borderBottom: '1px solid #F1F5F9', fontSize: '0.75rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.slice(0, 50).map((s: any, i: number) => {
                      const name = s.name || s.student_name || s.full_name || '-';
                      const grade = typeof s.grade === 'object' ? s.grade?.grade_name : (s.grade || '-');
                      const status = String(s.status || '').toLowerCase();
                      return (
                        <tr key={s.id || i} style={{ borderBottom: '1px solid #F8FAFC' }}>
                          <td style={{ padding: '10px 12px', color: '#64748B' }}>{i + 1}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: getAvatarColor(name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: 600, color: 'white', flexShrink: 0 }}>
                                {getInitials(name)}
                              </div>
                              <span style={{ fontWeight: 500, color: '#1E293B', fontSize: '0.8125rem' }}>{name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px', color: '#64748B' }}>{grade}</td>
                          <td style={{ padding: '10px 12px', color: '#64748B' }}>{s.section || '-'}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.6875rem', fontWeight: 500, background: status === 'active' ? '#D1FAE5' : '#FEE2E2', color: status === 'active' ? '#10B981' : '#EF4444' }}>
                              {s.status || '-'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredStudents.length > 50 && (
                  <div style={{ textAlign: 'center', padding: '12px', color: '#64748B', fontSize: '0.75rem' }}>
                    Showing 50 of {filteredStudents.length} students
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #F1F5F9' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1E293B', marginBottom: '24px' }}>Recent Activity</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>No Recent Activity</h4>
              <p style={{ color: '#64748B', fontSize: '0.8125rem' }}>Your recent activities will appear here.</p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Announcements */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1E293B', margin: 0 }}>Announcements</h3>
              <span style={{ fontSize: '0.75rem', color: '#6366F1', fontWeight: 500, cursor: 'pointer' }}>View All</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {announcements.map((ann) => (
                <div key={ann.id} style={{
                  padding: '14px 16px', borderRadius: '10px',
                  background: ann.type === 'info' ? '#EFF6FF' : '#FFFBEB',
                  border: `1px solid ${ann.type === 'info' ? '#DBEAFE' : '#FEF3C7'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ marginTop: '2px' }}>
                      {ann.type === 'info' ? (
                        <Info size={16} color="#3B82F6" />
                      ) : (
                        <AlertTriangle size={16} color="#F59E0B" />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.875rem', marginBottom: '4px' }}>{ann.title}</div>
                      <div style={{ color: '#64748B', fontSize: '0.8125rem', lineHeight: 1.5 }}>{ann.description}</div>
                      <div style={{ color: '#94A3B8', fontSize: '0.75rem', marginTop: '8px' }}>{ann.date}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #F1F5F9' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1E293B', marginBottom: '16px' }}>Quick Actions</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Link href="/allocations" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '20px 12px', borderRadius: '12px', border: '1px solid #E2E8F0',
                background: 'white', textDecoration: 'none', gap: '8px', cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}>
                <Users size={24} color="#6366F1" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1E293B' }}>My Allocations</span>
              </Link>
              
              <Link href="/omr-entry-status" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '20px 12px', borderRadius: '12px', border: '1px solid #E2E8F0',
                background: 'white', textDecoration: 'none', gap: '8px', cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}>
                <ClipboardList size={24} color="#6366F1" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1E293B' }}>Digital OMR Entry</span>
              </Link>
              
              <Link href="/support" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '20px 12px', borderRadius: '12px', border: '1px solid #E2E8F0',
                background: 'white', textDecoration: 'none', gap: '8px', cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}>
                <Headphones size={24} color="#6366F1" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1E293B' }}>Help & Support</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
