'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronRight, ChevronLeft, ChevronDown, Calendar, CheckCircle2, XCircle, Plus, X, User, UploadCloud, Download, FileText } from 'lucide-react';
import Link from 'next/link';
import { studentsApi, teacherOmrApi } from '@/services/api';
import toast, { Toaster } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { ShimmerTable, ShimmerCard } from '@/components/ui/Shimmer';

const avatarColors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
const gradeColors: Record<string, string> = {
  '3': '#6366F1',
  '5': '#10B981',
  '8': '#F59E0B',
  '6': '#3B82F6',
  '9': '#EF4444',
  '10': '#8B5CF6',
};

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getGradeNumber(grade: any): string {
  if (!grade) return '';
  if (typeof grade === 'object') return String(grade.grade_id || grade.grade_name || '');
  const str = String(grade).replace('Grade ', '').trim();
  return str;
}

function getGradeLabel(grade: any): string {
  if (!grade) return '';
  let label = '';
  if (typeof grade === 'object') {
    label = grade.grade_name || String(grade.grade_id || '');
  } else {
    label = String(grade);
  }
  // Strip "Grade" prefix if present to avoid "Grade Grade X"
  return label.replace(/^Grade\s+/i, '').trim();
}

export default function MyAllocation() {
  const [loading, setLoading] = useState(true);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentFilter, setStudentFilter] = useState('All Students');
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  // Add Student Modal State
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [addStudentTab, setAddStudentTab] = useState<'single' | 'bulk'>('single');
  const [singleForm, setSingleForm] = useState({
    name: '',
    rollNo: '',
    gender: '',
    section: '',
    apaarId: '',
  });
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkPreview, setBulkPreview] = useState<any[]>([]);
  const [bulkStep, setBulkStep] = useState(1);
  const [bulkError, setBulkError] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAllocations();
  }, []);

  useEffect(() => {
    if (selectedGrade) {
      fetchStudentsForGrade(selectedGrade);
    }
  }, [selectedGrade]);

  // Debounced search effect
  useEffect(() => {
    if (!selectedGrade) return;
    const timer = setTimeout(() => {
      fetchStudentsForGrade(selectedGrade);
    }, 300);
    return () => clearTimeout(timer);
  }, [studentSearch]);

  const fetchAllocations = async () => {
    try {
      // Try the new teacher-specific grades endpoint first
      let gradeList: any[] = [];
      try {
        const res = await teacherOmrApi.getGrades();
        console.log('Grades API response:', JSON.stringify(res, null, 2));
        const gradeData = res?.response?.data || res?.response || res?.data || res;

        if (Array.isArray(gradeData)) {
          gradeList = gradeData;
        } else if (gradeData?.grades && Array.isArray(gradeData.grades)) {
          gradeList = gradeData.grades;
        } else if (gradeData?.data && Array.isArray(gradeData.data)) {
          gradeList = gradeData.data;
        }
      } catch (gradeErr) {
        console.warn('New grades API failed, falling back to allocations API:', gradeErr);
      }


      console.log('Final gradeList:', gradeList);

      // Map API response to our grade format
      const gradeMap = new Map<string, { grade: string; gradeId: number; sections: string[]; studentCount: number }>();
      gradeList.forEach((g: any) => {
        const gradeId = g.grade_id || g.id || g.gradeId;
        const gradeName = g.grade_name || g.gradeName || g.name || String(gradeId);
        const gradeKey = getGradeNumber(gradeName) || String(gradeId);
        let sections = g.sections || (g.section ? [g.section] : []);
        if (typeof sections === 'string') {
          sections = sections.split(',').map(s => s.trim()).filter(Boolean);
        }
        const studentCount = g.student_count || g.students_count || g.students || g.total_students || 0;

        if (!gradeKey) return;

        if (!gradeMap.has(gradeKey)) {
          gradeMap.set(gradeKey, {
            grade: getGradeLabel(gradeName),
            gradeId: gradeId,
            sections: Array.isArray(sections) ? sections : [],
            studentCount,
          });
        } else {
          const existing = gradeMap.get(gradeKey)!;
          if (Array.isArray(sections)) {
            sections.forEach((s: string) => {
              if (!existing.sections.includes(s)) existing.sections.push(s);
            });
          }
          existing.studentCount += studentCount;
        }
      });

      setAllocations(Array.from(gradeMap.values()));

      if (gradeMap.size > 0) {
        const firstGrade = Array.from(gradeMap.keys())[0];
        setSelectedGrade(firstGrade);
      }
    } catch (err: any) {
      console.error('Failed to fetch allocations:', err);
      console.error('Error response:', err.response?.data);
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to load allocations');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsForGrade = async (gradeKey: string) => {
    setStudentsLoading(true);
    setStudents([]);
    setCurrentPage(1);
    try {
      const gradeEntry = allocations.find(g => getGradeNumber(g.grade) === gradeKey);
      if (!gradeEntry) return;

      let studentList: any[] = [];

      // Try new API first
      try {
        const res = await teacherOmrApi.getStudents(gradeEntry.gradeId, undefined, studentSearch || undefined);
        console.log('Students API response:', JSON.stringify(res, null, 2));
        const studentData = res?.response?.data || res?.response || res?.data || res;

        if (Array.isArray(studentData)) {
          studentList = studentData;
        } else if (studentData?.students && Array.isArray(studentData.students)) {
          studentList = studentData.students;
        } else if (studentData?.data && Array.isArray(studentData.data)) {
          studentList = studentData.data;
        }
      } catch (studentErr) {
        console.warn('New students API failed, falling back to students list API:', studentErr);
      }


      // Filter by sections if needed
      const filtered = gradeEntry.sections.length > 0 && studentList.length > 0
        ? studentList.filter((s: any) => gradeEntry.sections.includes(s.section || ''))
        : studentList;

      // Deduplicate by student id
      const seen = new Set<number>();
      const unique = filtered.filter((s: any) => {
        const id = s.id || s.student_id;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      setStudents(unique);

      // Update student count in allocations
      setAllocations(prev => prev.map(g => {
        if (getGradeNumber(g.grade) === gradeKey) {
          return { ...g, studentCount: unique.length };
        }
        return g;
      }));
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Single student add handler
  const handleSingleAdd = async () => {
    if (!singleForm.name || !singleForm.rollNo || !singleForm.gender || !singleForm.section) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const gradeKey = selectedGrade || '';
      const payload: any = {
        name: singleForm.name,
        roll_no: singleForm.rollNo,
        gender: singleForm.gender,
        section: singleForm.section,
        grade: gradeKey,
      };
      if (singleForm.apaarId) payload.apaar_id = singleForm.apaarId;

      await studentsApi.createStudent(payload);
      toast.success('Student added successfully');
      setSingleForm({ name: '', rollNo: '', gender: '', section: '', apaarId: '' });
      setShowAddStudentModal(false);
      if (selectedGrade) fetchStudentsForGrade(selectedGrade);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to add student');
    } finally {
      setSubmitting(false);
    }
  };

  // Bulk file parse handler
  const handleBulkFileParse = (file: File) => {
    setBulkError('');
    setBulkPreview([]);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        if (jsonData.length === 0) {
          setBulkError('The file is empty or has no valid data');
          return;
        }

        // Normalize column names
        const normalized = jsonData.map((row: any) => {
          const keys = Object.keys(row);
          const find = (alternatives: string[]) => {
            for (const alt of alternatives) {
              const key = keys.find(k => k.toLowerCase().replace(/[\s_-]/g, '') === alt.toLowerCase().replace(/[\s_-]/g, ''));
              if (key) return row[key];
            }
            return '';
          };
          return {
            name: find(['name', 'student_name', 'full_name', 'studentname']),
            roll_no: find(['roll_no', 'rollno', 'roll_number', 'rollno.']),
            gender: find(['gender', 'sex']),
            section: find(['section', 'sec']),
            apaar_id: find(['apaar_id', 'apaarid', 'apaar']),
          };
        });

        setBulkPreview(normalized);
        setBulkStep(3);
      } catch {
        setBulkError('Failed to parse file. Please check the format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Bulk submit handler
  const handleBulkSubmit = async () => {
    if (bulkPreview.length === 0) {
      toast.error('No students to add');
      return;
    }
    setSubmitting(true);
    setBulkError('');
    setBulkSuccess('');
    try {
      const gradeKey = selectedGrade || '';
      const payload = bulkPreview.map((row: any) => ({
        name: row.name,
        roll_no: row.roll_no,
        gender: row.gender,
        section: row.section,
        grade: gradeKey,
        apaar_id: row.apaar_id || undefined,
      }));

      await studentsApi.bulkCreateStudents(payload);
      setBulkSuccess(`${bulkPreview.length} students added successfully`);
      toast.success(`${bulkPreview.length} students added`);
      setTimeout(() => {
        setShowAddStudentModal(false);
        setBulkFile(null);
        setBulkPreview([]);
        setBulkStep(1);
        setBulkSuccess('');
        if (selectedGrade) fetchStudentsForGrade(selectedGrade);
      }, 1500);
    } catch (err: any) {
      setBulkError(err.response?.data?.message || err.response?.data?.error || 'Failed to add students');
    } finally {
      setSubmitting(false);
    }
  };

  // Download template handler
  const handleDownloadTemplate = () => {
    const headers = ['Name', 'Roll No', 'Gender', 'Section', 'APAAR ID'];
    const sampleData = [
      ['Aarav Sharma', '30101', 'M', 'A', ''],
      ['Reyansh Verma', '30102', 'M', 'A', ''],
      ['Anaya Herma', '30103', 'F', 'A', ''],
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'student_template.csv');
  };

  const resetAddStudentModal = () => {
    setShowAddStudentModal(false);
    setAddStudentTab('single');
    setSingleForm({ name: '', rollNo: '', gender: '', section: '', apaarId: '' });
    setBulkFile(null);
    setBulkPreview([]);
    setBulkStep(1);
    setBulkError('');
    setBulkSuccess('');
  };

  const filteredStudents = students.filter((s: any) => {
    // Search is handled by API, only apply status filter client-side
    if (studentFilter === 'Added' && String(s.omr_status || s.omrStatus || '').toLowerCase() !== 'added') return false;
    if (studentFilter === 'Not Started' && String(s.omr_status || s.omrStatus || '').toLowerCase() !== 'not started') return false;
    return true;
  });

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + studentsPerPage);

  const selectedGradeEntry = allocations.find(g => getGradeNumber(g.grade) === selectedGrade);
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'long' });

  const renderStatus = (status: string) => {
    const s = String(status || '').toLowerCase();
    if (s === 'completed') return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500, background: '#D1FAE5', color: '#10B981' }}><CheckCircle2 size={14} /> Completed</span>;
    if (s === 'in progress') return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500, background: '#FEF3C7', color: '#F59E0B' }}>↻ In Progress</span>;
    if (s === 'pending') return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500, background: '#FEF9C3', color: '#CA8A04' }}>○ Pending</span>;
    if (s === 'not uploaded') return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500, background: '#FEE2E2', color: '#EF4444' }}>! Not Uploaded</span>;
    if (s === 'absent') return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500, background: '#F1F5F9', color: '#64748B' }}>- Absent</span>;
    if (s === 'added') return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500, background: '#D1FAE5', color: '#10B981' }}><CheckCircle2 size={14} /> Added</span>;
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500, background: '#FEE2E2', color: '#EF4444' }}><XCircle size={14} /> Not Started</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Toaster position="top-right" />

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: '#64748B' }}>
        <Link href="/" style={{ color: '#6366F1', textDecoration: 'none' }}>Dashboard</Link>
        <ChevronRight size={14} color="#94A3B8" />
        <span style={{ color: '#1E293B', fontWeight: 500 }}>My Allocations</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#1E293B' }}>My Allocation</h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '4px' }}>
            View students allocated to you and enter their OMR responses.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '0.875rem' }}>
          <Calendar size={16} />
          <span>{today}</span>
        </div>
      </div>

      {/* Grades Assigned to Me */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>Grades Assigned to Me</h2>
            <p style={{ color: '#64748B', fontSize: '0.8125rem', marginTop: '4px' }}>You have been allocated the following grades.</p>
          </div>
          <button
            onClick={() => setShowAddStudentModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', background: '#4C35E6', color: 'white', border: 'none', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
          >
            <Plus size={16} />
            Add Student
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
          </div>
        ) : allocations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
            <p>No grades assigned yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(allocations.length, 3)}, 1fr)`, gap: '16px' }}>
            {allocations.map((g) => {
              const gradeKey = getGradeNumber(g.grade);
              const isSelected = selectedGrade === gradeKey;
              const color = gradeColors[gradeKey] || '#6366F1';
              return (
                <div
                  key={gradeKey}
                  onClick={() => setSelectedGrade(gradeKey)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '20px', borderRadius: '12px', cursor: 'pointer',
                    border: `2px solid ${isSelected ? color : '#E5E7EB'}`,
                    background: isSelected ? `${color}08` : 'white',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '12px',
                    background: `${color}15`, color: color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '1.125rem', flexShrink: 0,
                  }}>
                    G{gradeKey}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.9375rem' }}>
                      Grade {g.grade} - Unit Test 1 (LAT)
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '4px' }}>
                      {g.sections.length} Section{g.sections.length !== 1 ? 's' : ''} &bull; {g.studentCount} Students
                    </div>
                  </div>
                  <ChevronRight size={20} color={isSelected ? color : '#94A3B8'} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Students Table */}
      {selectedGradeEntry && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #F1F5F9' }}>
          {/* Section Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>
                Students (Grade {selectedGradeEntry.grade} - Unit Test 1 (LAT))
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.8125rem', marginTop: '4px' }}>
                Total {students.length} Students
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <select
                  value={studentFilter}
                  onChange={(e) => { setStudentFilter(e.target.value); setCurrentPage(1); }}
                  style={{
                    padding: '8px 32px 8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0',
                    fontSize: '0.8125rem', background: 'white', cursor: 'pointer', outline: 'none',
                    color: '#1E293B', appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
                  }}
                >
                  <option>All Students</option>
                  <option>Added</option>
                  <option>Not Started</option>
                </select>
              </div>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Search student"
                  value={studentSearch}
                  onChange={(e) => { setStudentSearch(e.target.value); setCurrentPage(1); }}
                  style={{
                    width: '200px', padding: '8px 12px 8px 36px', borderRadius: '8px',
                    border: '1px solid #E2E8F0', fontSize: '0.8125rem', outline: 'none',
                    color: '#1E293B',
                  }}
                />
              </div>
              <button style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white',
                fontSize: '0.8125rem', cursor: 'pointer', color: '#64748B',
              }}>
                <Filter size={14} />
                Filters
              </button>
            </div>
          </div>

          {/* Table */}
          {studentsLoading ? (
            <ShimmerTable columns={8} rows={studentsPerPage || 10} />
          ) : filteredStudents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#64748B' }}>No students found.</div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, fontSize: '0.8125rem', color: '#64748B', background: '#FAFBFC' }}>S. No.</th>
                      <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, fontSize: '0.8125rem', color: '#64748B', background: '#FAFBFC' }}>Student Name</th>
                      <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, fontSize: '0.8125rem', color: '#64748B', background: '#FAFBFC' }}>Roll No.</th>
                      <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, fontSize: '0.8125rem', color: '#64748B', background: '#FAFBFC' }}>Gender</th>
                      <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, fontSize: '0.8125rem', color: '#64748B', background: '#FAFBFC' }}>Section</th>
                      <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, fontSize: '0.8125rem', color: '#64748B', background: '#FAFBFC' }}>OMR Status</th>
                      <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, fontSize: '0.8125rem', color: '#64748B', background: '#FAFBFC' }}>Added On</th>
                      <th style={{ textAlign: 'center', padding: '14px 16px', fontWeight: 600, fontSize: '0.8125rem', color: '#64748B', background: '#FAFBFC' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.map((s: any, index: number) => {
                      const name = s.name || s.student_name || s.full_name || '-';
                      const rollNo = s.roll_no || s.rollNo || s.id || '-';
                      const gender = (s.gender === 'm' || s.gender === 'M' || (s.gender || '').toLowerCase() === 'male') ? 'Male' :
                                     (s.gender === 'f' || s.gender === 'F' || (s.gender || '').toLowerCase() === 'female') ? 'Female' : s.gender || '-';
                      const section = s.section || '-';
                      const omrStatus = String(s.omr_status || s.omrStatus || 'Not Started').toLowerCase();
                      const addedOn = s.created_at || s.addedOn || s.createdAt || '-';
                      const formattedDate = addedOn !== '-' ? new Date(addedOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
                      const formattedTime = addedOn !== '-' ? new Date(addedOn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '';

                      return (
                        <tr key={s.id || index} style={{ borderBottom: '1px solid #F8FAFC' }}>
                          <td style={{ padding: '14px 16px', color: '#64748B', fontSize: '0.875rem' }}>{startIndex + index + 1}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: getAvatarColor(name),
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.75rem', fontWeight: 600, color: 'white', flexShrink: 0,
                              }}>
                                {getInitials(name)}
                              </div>
                              <span style={{ fontWeight: 500, color: '#1E293B' }}>{name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', color: '#64748B' }}>{rollNo}</td>
                          <td style={{ padding: '14px 16px', color: '#64748B' }}>{gender}</td>
                          <td style={{ padding: '14px 16px', color: '#64748B' }}>{section}</td>
                          <td style={{ padding: '14px 16px' }}>
                            {renderStatus(omrStatus)}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '0.8125rem' }}>
                              <Calendar size={14} color="#94A3B8" />
                              <div>
                                <div>{formattedDate}</div>
                                {formattedTime && <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{formattedTime}</div>}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <ChevronRight size={18} color="#94A3B8" style={{ cursor: 'pointer' }} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                  Showing {startIndex + 1} to {Math.min(startIndex + studentsPerPage, filteredStudents.length)} of {filteredStudents.length} students
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      border: '1px solid #E2E8F0', background: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      opacity: currentPage === 1 ? 0.5 : 1,
                    }}
                  >
                    <ChevronLeft size={16} color="#64748B" />
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
                          border: currentPage === pageNum ? '1px solid #4C35E6' : '1px solid #E2E8F0',
                          background: currentPage === pageNum ? '#4C35E6' : 'white',
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
                          width: '32px', height: '32px', borderRadius: '8px',
                          border: '1px solid #E2E8F0', background: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
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
                      width: '32px', height: '32px', borderRadius: '8px',
                      border: '1px solid #E2E8F0', background: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      opacity: currentPage === totalPages ? 0.5 : 1,
                    }}
                  >
                    <ChevronRight size={16} color="#64748B" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '640px', maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto', position: 'relative' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>Add Student</h2>
              <button
                onClick={resetAddStudentModal}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} color="#64748B" />
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid #F1F5F9' }}>
              <button
                onClick={() => setAddStudentTab('single')}
                style={{
                  flex: 1, padding: '16px', background: 'transparent', border: 'none', borderBottom: `2px solid ${addStudentTab === 'single' ? '#4C35E6' : 'transparent'}`,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  color: addStudentTab === 'single' ? '#4C35E6' : '#64748B', fontWeight: addStudentTab === 'single' ? 600 : 400,
                  fontSize: '0.9375rem', transition: 'all 0.2s',
                }}
              >
                <User size={18} />
                <div style={{ textAlign: 'left' }}>
                  <div>Add Single Student</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 400, color: '#94A3B8' }}>Add one student at a time</div>
                </div>
              </button>
              <button
                onClick={() => setAddStudentTab('bulk')}
                style={{
                  flex: 1, padding: '16px', background: 'transparent', border: 'none', borderBottom: `2px solid ${addStudentTab === 'bulk' ? '#4C35E6' : 'transparent'}`,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  color: addStudentTab === 'bulk' ? '#4C35E6' : '#64748B', fontWeight: addStudentTab === 'bulk' ? 600 : 400,
                  fontSize: '0.9375rem', transition: 'all 0.2s',
                }}
              >
                <FileText size={18} />
                <div style={{ textAlign: 'left' }}>
                  <div>Bulk Add Students</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 400, color: '#94A3B8' }}>Add multiple students at once</div>
                </div>
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px' }}>
              {/* Single Student Tab */}
              {addStudentTab === 'single' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                      Student Name <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter student name"
                      value={singleForm.name}
                      onChange={(e) => setSingleForm({ ...singleForm, name: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.875rem', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Roll No. <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter roll number"
                        value={singleForm.rollNo}
                        onChange={(e) => setSingleForm({ ...singleForm, rollNo: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.875rem', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Gender <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <select
                        value={singleForm.gender}
                        onChange={(e) => setSingleForm({ ...singleForm, gender: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.875rem', outline: 'none', background: 'white' }}
                      >
                        <option value="">Select Gender</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Section <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <select
                        value={singleForm.section}
                        onChange={(e) => setSingleForm({ ...singleForm, section: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.875rem', outline: 'none', background: 'white' }}
                      >
                        <option value="">Select Section</option>
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                        <option value="D">Section D</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        APAAR ID
                      </label>
                      <input
                        type="text"
                        placeholder="Enter APAAR ID"
                        value={singleForm.apaarId}
                        onChange={(e) => setSingleForm({ ...singleForm, apaarId: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.875rem', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bulk Students Tab */}
              {addStudentTab === 'bulk' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1E293B', margin: '0 0 4px 0' }}>Bulk Add Students</h3>
                    <p style={{ color: '#64748B', fontSize: '0.8125rem', margin: 0 }}>Upload a CSV file to add multiple students at once.</p>
                  </div>

                  {/* Step 1: Download Template */}
                  <div style={{ padding: '16px', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ color: '#4C35E6', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Step 1: Download Template</div>
                        <div style={{ fontWeight: 500, color: '#1E293B' }}>Download our CSV template and fill in student details.</div>
                      </div>
                      <button
                        onClick={handleDownloadTemplate}
                        style={{ padding: '8px 16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, cursor: 'pointer', fontSize: '0.8125rem', color: '#374151' }}
                      >
                        <Download size={14} />
                        Download Template
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Upload CSV */}
                  <div style={{ padding: '16px', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                    <div style={{ color: '#4C35E6', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Step 2: Upload CSV File</div>
                    <div style={{ fontWeight: 500, color: '#1E293B', marginBottom: '12px' }}>Upload the filled CSV file.</div>
                    
                    <div
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const file = e.dataTransfer.files?.[0];
                        if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
                          setBulkFile(file);
                          handleBulkFileParse(file);
                        }
                      }}
                      style={{
                        border: '2px dashed #E2E8F0', borderRadius: '10px', padding: '32px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        background: '#FAFBFC', position: 'relative', cursor: 'pointer',
                      }}
                    >
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setBulkFile(file);
                            handleBulkFileParse(file);
                          }
                        }}
                        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer' }}
                      />
                      <UploadCloud size={32} color="#94A3B8" style={{ marginBottom: '12px' }} />
                      <div style={{ fontWeight: 500, color: '#1E293B', fontSize: '0.875rem' }}>
                        {bulkFile ? bulkFile.name : 'Drag and drop your CSV file here'}
                      </div>
                      <div style={{ color: '#94A3B8', fontSize: '0.8125rem', marginTop: '4px' }}>or</div>
                      <button
                        type="button"
                        style={{ marginTop: '8px', padding: '6px 16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '0.8125rem', cursor: 'pointer', color: '#374151' }}
                      >
                        Choose File
                      </button>
                      <div style={{ color: '#94A3B8', fontSize: '0.75rem', marginTop: '8px' }}>Only CSV files are supported. Max file size: 5MB</div>
                    </div>
                  </div>

                  {/* Step 3: Preview */}
                  <div style={{ padding: '16px', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                    <div style={{ color: '#4C35E6', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Step 3: Preview & Confirm</div>
                    <div style={{ fontWeight: 500, color: '#1E293B', marginBottom: '12px' }}>We'll preview the data before adding students.</div>
                    
                    {bulkPreview.length > 0 ? (
                      <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                          <thead>
                            <tr style={{ background: '#FAFBFC' }}>
                              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500, color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Name</th>
                              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500, color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Roll No</th>
                              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500, color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Section</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bulkPreview.slice(0, 5).map((row: any, i: number) => (
                              <tr key={i} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                <td style={{ padding: '10px 12px', color: '#1E293B' }}>{row.name || '-'}</td>
                                <td style={{ padding: '10px 12px', color: '#64748B' }}>{row.roll_no || row.rollNo || '-'}</td>
                                <td style={{ padding: '10px 12px', color: '#64748B' }}>{row.section || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {bulkPreview.length > 5 && (
                          <div style={{ padding: '8px 12px', textAlign: 'center', color: '#64748B', fontSize: '0.75rem', background: '#FAFBFC' }}>
                            Showing 5 of {bulkPreview.length} students
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: '8px', padding: '12px', display: 'flex', gap: '8px', color: '#1E40AF', fontSize: '0.8125rem' }}>
                        <span style={{ fontSize: '1rem' }}>&#8505;</span>
                        <span>Make sure your file follows the template format. <span style={{ color: '#4C35E6', cursor: 'pointer', fontWeight: 500 }}>View guidelines</span></span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {bulkError && (
                <div style={{ padding: '10px', background: '#FEE2E2', color: '#B91C1C', borderRadius: '8px', marginTop: '16px', fontSize: '0.8125rem' }}>{bulkError}</div>
              )}
              {bulkSuccess && (
                <div style={{ padding: '10px', background: '#DCFCE7', color: '#15803D', borderRadius: '8px', marginTop: '16px', fontSize: '0.8125rem' }}>{bulkSuccess}</div>
              )}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', gap: '12px', padding: '16px 24px', borderTop: '1px solid #F1F5F9' }}>
              <button
                onClick={resetAddStudentModal}
                style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '10px', fontWeight: 500, cursor: 'pointer', fontSize: '0.875rem', color: '#374151' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (addStudentTab === 'single') {
                    handleSingleAdd();
                  } else {
                    handleBulkSubmit();
                  }
                }}
                disabled={submitting}
                style={{ flex: 1, padding: '12px', background: '#4C35E6', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 500, cursor: 'pointer', fontSize: '0.875rem', opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? 'Saving...' : (addStudentTab === 'single' ? 'Add Student' : `Add ${bulkPreview.length} Students`)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
