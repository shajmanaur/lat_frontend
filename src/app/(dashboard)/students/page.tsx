'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, UserCheck, UserX, Building2, Calendar, ChevronDown, Eye, Edit3, MoreVertical, RefreshCw } from 'lucide-react';
import { studentsApi, regionsApi, schoolsApi, dashboardApi, formatGradeName } from '@/services/api';
import toast, { Toaster } from 'react-hot-toast';

const avatarColors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalStudents, setTotalStudents] = useState(0);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    inactiveStudents: 0,
    gradesCovered: 0,
  });

  const [error, setError] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await studentsApi.getStudents(currentPage, itemsPerPage);
      let studentList: any[] = [];
      let total = 0;
      if (res.status === true && res.response) {
        const resp = res.response;
        if (resp.meta) {
          studentList = Array.isArray(resp.data) ? resp.data : [];
          total = resp.meta.total || 0;
        } else if (Array.isArray(resp)) {
          studentList = resp;
          total = resp.length;
        } else {
          studentList = resp.data || resp.students || resp.items || [];
          total = resp.total || resp.count || studentList.length;
        }
      } else if (Array.isArray(res)) {
        studentList = res;
        total = res.length;
      } else if (res.data) {
        studentList = Array.isArray(res.data) ? res.data : [];
        total = res.total || studentList.length;
      }
      setStudents(studentList);
      setTotalStudents(total);

      const active = studentList.filter((s: any) => String(s.status || '').toLowerCase() === 'active').length;
      const inactive = studentList.filter((s: any) => String(s.status || '').toLowerCase() === 'inactive').length;
      const grades = new Set(studentList.map((s: any) => {
        const g = s.grade;
        if (typeof g === 'object' && g) return g.grade_id || g.grade_name;
        return g;
      }).filter(Boolean));

      setStats({
        totalStudents: total,
        activeStudents: active,
        inactiveStudents: inactive,
        gradesCovered: grades.size || 3,
      });
    } catch (err: any) {
      console.error('Failed to fetch students', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [currentPage, itemsPerPage]);

  const filteredStudents = students.filter((s: any) => {
    const q = searchQuery.toLowerCase();
    if (q) {
      const nameMatch = (s.name || s.student_name || s.full_name || '').toLowerCase().includes(q);
      const apaarMatch = (s.apaarId || s.apaar_id || '').toLowerCase().includes(q);
      if (!nameMatch && !apaarMatch) return false;
    }
    if (selectedGrade && String(s.grade) !== selectedGrade) return false;
    if (selectedSection && s.section !== selectedSection) return false;
    if (selectedStatus && String(s.status || '').toLowerCase() !== selectedStatus.toLowerCase()) return false;
    return true;
  });

  const totalPages = Math.ceil(totalStudents / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalStudents);

  const activePercent = stats.totalStudents > 0 ? ((stats.activeStudents / stats.totalStudents) * 100).toFixed(1) : '0.0';
  const inactivePercent = stats.totalStudents > 0 ? ((stats.inactiveStudents / stats.totalStudents) * 100).toFixed(1) : '0.0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#1E293B' }}>Student List</h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '4px' }}>View and manage all students.</p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', borderRadius: '10px',
          background: '#6366F1', color: 'white', fontSize: '0.875rem', fontWeight: 600,
          border: 'none', cursor: 'pointer',
        }}>
          + Add Student
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '14px 16px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color="#6366F1" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Total Students</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}>{stats.totalStudents.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '2px' }}>Across all grades</div>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '14px 16px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={20} color="#10B981" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Active Students</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}>{stats.activeStudents}</div>
              <div style={{ fontSize: '0.6875rem', color: '#10B981', marginTop: '2px' }}>{activePercent}% of total</div>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '14px 16px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserX size={20} color="#EF4444" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Inactive Students</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}>{stats.inactiveStudents}</div>
              <div style={{ fontSize: '0.6875rem', color: '#EF4444', marginTop: '2px' }}>{inactivePercent}% of total</div>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '14px 16px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} color="#3B82F6" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Grades Covered</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}>{stats.gradesCovered}</div>
              <div style={{ fontSize: '0.6875rem', color: '#3B82F6', marginTop: '2px' }}>Grades 3, 6, 9</div>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '14px 16px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={20} color="#8B5CF6" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Academic Year</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}>2024-25</div>
              <div style={{ fontSize: '0.6875rem', color: '#8B5CF6', marginTop: '2px' }}>Current Year</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'nowrap' }}>
        <div style={{ position: 'relative', minWidth: '280px', flex: 1, maxWidth: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search by student name or APAAR ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px',
              border: '1px solid #E2E8F0', fontSize: '0.8125rem', outline: 'none',
              background: 'white', height: '40px',
            }}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            style={{
              padding: '10px 32px 10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0',
              fontSize: '0.8125rem', background: 'white', height: '40px', outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="">All Grades</option>
            <option value="3">Grade 3</option>
            <option value="6">Grade 6</option>
            <option value="9">Grade 9</option>
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748B' }} />
        </div>

        <div style={{ position: 'relative' }}>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            style={{
              padding: '10px 32px 10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0',
              fontSize: '0.8125rem', background: 'white', height: '40px', outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="">All Sections</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748B' }} />
        </div>

        <div style={{ position: 'relative' }}>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: '10px 32px 10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0',
              fontSize: '0.8125rem', background: 'white', height: '40px', outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748B' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.8125rem', background: 'white', height: '40px', color: '#64748B' }}>
          <Calendar size={14} color="#6366F1" />
          <span style={{ color: '#1E293B' }}>Academic Year: 2024-25</span>
        </div>

        <button
          onClick={() => { setSelectedGrade(''); setSelectedSection(''); setSelectedStatus(''); setSearchQuery(''); setCurrentPage(1); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px',
            border: '1px solid #E2E8F0', fontSize: '0.8125rem', background: 'white', height: '40px',
            cursor: 'pointer', color: '#64748B',
          }}
        >
          <RefreshCw size={14} />
          Reset
        </button>

        <button
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px',
            border: '1px solid #6366F1', fontSize: '0.8125rem', background: '#6366F1', height: '40px',
            cursor: 'pointer', color: 'white', fontWeight: 500,
          }}
        >
          <Filter size={14} />
          Filters
        </button>
      </div>

      {/* Table Section */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, fontSize: '0.8125rem', color: '#64748B', background: '#FAFBFC' }}>S. No.</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, fontSize: '0.8125rem', color: '#64748B', background: '#FAFBFC' }}>Student Name</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, fontSize: '0.8125rem', color: '#64748B', background: '#FAFBFC' }}>APAAR ID</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, fontSize: '0.8125rem', color: '#64748B', background: '#FAFBFC' }}>Gender</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, fontSize: '0.8125rem', color: '#64748B', background: '#FAFBFC' }}>Grade</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, fontSize: '0.8125rem', color: '#64748B', background: '#FAFBFC' }}>Section</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, fontSize: '0.8125rem', color: '#64748B', background: '#FAFBFC' }}>Date of Birth</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, fontSize: '0.8125rem', color: '#64748B', background: '#FAFBFC' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, fontSize: '0.8125rem', color: '#64748B', background: '#FAFBFC' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    Loading students...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#EF4444' }}>
                    {error}
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    No students found
                  </td>
                </tr>
              ) : filteredStudents.map((row: any, index: number) => {
                const studentName = row.name || row.student_name || row.full_name || '-';
                const initials = getInitials(studentName);
                const avatarColor = getAvatarColor(studentName);
                const grade = typeof row.grade === 'object' ? row.grade?.grade_name : (row.grade || '-');
                const gradeFormatted = typeof grade === 'string' && grade.toLowerCase().startsWith('grade') ? grade : (typeof grade === 'number' ? `Grade ${grade}` : grade);
                const status = String(row.status || '').toLowerCase();
                const dateOfBirth = row.dob || row.date_of_birth || row.DateOfBirth || '-';

                return (
                  <tr key={row.id || index} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 16px', fontSize: '0.875rem', color: '#64748B' }}>{startIndex + index + 1}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%', background: avatarColor,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 600, color: 'white', flexShrink: 0,
                        }}>
                          {initials}
                        </div>
                        <span style={{ fontWeight: 500, color: '#1E293B' }}>{studentName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.875rem', color: '#64748B' }}>{row.apaarId || row.apaar_id || '-'}</td>
                    <td style={{ padding: '14px 16px', fontSize: '0.875rem', color: '#64748B' }}>{(row.gender === 'm' || row.gender === 'M' || (row.gender || '').toLowerCase() === 'male') ? 'Male' : (row.gender === 'f' || row.gender === 'F' || (row.gender || '').toLowerCase() === 'female') ? 'Female' : row.gender || '-'}</td>
                    <td style={{ padding: '14px 16px', fontSize: '0.875rem', color: '#64748B' }}>{gradeFormatted}</td>
                    <td style={{ padding: '14px 16px', fontSize: '0.875rem', color: '#64748B' }}>{row.section || '-'}</td>
                    <td style={{ padding: '14px 16px', fontSize: '0.875rem', color: '#64748B' }}>{dateOfBirth}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500,
                        background: status === 'active' ? '#D1FAE5' : '#FEE2E2',
                        color: status === 'active' ? '#10B981' : '#EF4444',
                      }}>
                        {row.status || '-'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="View"
                        >
                          <Eye size={16} color="#6366F1" />
                        </button>
                        <button
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Edit"
                        >
                          <Edit3 size={16} color="#6366F1" />
                        </button>
                        <div style={{ position: 'relative' }}>
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === (row.id || index) ? null : (row.id || index))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <MoreVertical size={16} color="#64748B" />
                          </button>
                          {activeDropdown === (row.id || index) && (
                            <div style={{
                              position: 'absolute', right: 0, top: '100%', background: 'white',
                              borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', border: '1px solid #E2E8F0',
                              minWidth: '140px', zIndex: 10, padding: '4px',
                            }}>
                              <button style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', fontSize: '0.8125rem', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px', color: '#1E293B' }}>View Details</button>
                              <button style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', fontSize: '0.8125rem', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px', color: '#1E293B' }}>Edit</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>
            Showing {totalStudents > 0 ? startIndex + 1 : 0} to {endIndex} of {totalStudents.toLocaleString('en-IN')} students
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0',
                  background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1,
                  fontSize: '0.875rem', color: '#64748B',
                }}
              >
                &lt;
              </button>
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      border: currentPage === pageNum ? '1px solid #6366F1' : '1px solid #E2E8F0',
                      background: currentPage === pageNum ? '#6366F1' : 'white',
                      color: currentPage === pageNum ? 'white' : '#64748B',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', fontSize: '0.875rem', fontWeight: currentPage === pageNum ? 600 : 400,
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span style={{ color: '#94A3B8', padding: '0 4px' }}>...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    style={{
                      width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0',
                      background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', fontSize: '0.875rem', color: '#64748B',
                    }}
                  >
                    {totalPages}
                  </button>
                </>
              )}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0',
                  background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1,
                  fontSize: '0.875rem', color: '#64748B',
                }}
              >
                &gt;
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                style={{
                  padding: '6px 8px', borderRadius: '8px', border: '1px solid #E2E8F0',
                  fontSize: '0.8125rem', background: 'white', cursor: 'pointer', color: '#64748B',
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>/ page</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
