'use client';

import React, { useState, useEffect } from 'react';
import { Users, FileCheck, Clock, UserX, Search, Filter, ChevronDown, FileText, AlertCircle } from 'lucide-react';
import { teacherOmrApi, omrApi } from '@/services/api';
import toast from 'react-hot-toast';
import { ShimmerTable, ShimmerCard } from '@/components/ui/Shimmer';

const avatarColors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export default function OMRPage() {
  const [view, setView] = useState<'list' | 'entry'>('list');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStudent, setActiveStudent] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchStudents = async () => {
    try {
      // Fetch students from teacher OMR grades endpoint
      const gradesRes = await teacherOmrApi.getGrades();
      const gradesData = gradesRes?.response?.data || gradesRes?.data || [];
      const grades = Array.isArray(gradesData) ? gradesData : [];

      if (grades.length === 0) {
        setStudents([]);
        return;
      }

      // Fetch students for all grades
      const allStudents: any[] = [];
      for (const grade of grades) {
        const gradeId = grade.grade_id || grade.id;
        if (!gradeId) continue;
        
        const studentsRes = await teacherOmrApi.getStudents(gradeId);
        const studentsData = studentsRes?.response?.data || studentsRes?.data || [];
        const gradeStudents = Array.isArray(studentsData) ? studentsData : [];
        
        allStudents.push(...gradeStudents.map((s: any) => ({
          ...s,
          student_id: s.student_id || s.id,
          full_name: s.full_name || s.name || s.student_name,
          grade: grade.grade_name || grade.name || grade,
          omr_status: s.omr_status || s.status || 'Not Started',
        })));
      }

      setStudents(allStudents);
    } catch (err) {
      console.error('Failed to load students', err);
      // Fallback to old endpoint
      try {
        const { default: axios } = await import('axios');
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
        const res = await axios.get(`${apiUrl}/students?page=1&limit=100`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const payload = res.data;
        let data: any[] = [];
        if (payload.status === true && payload.response) {
          data = payload.response.data || payload.response || [];
        } else if (Array.isArray(payload)) {
          data = payload;
        } else if (payload.data) {
          data = payload.data;
        }
        const statuses = ['Completed', 'In Progress', 'Pending', 'Not Uploaded', 'Absent'];
        data = data.map((s: any, i: number) => ({
          ...s,
          student_id: s.student_id || s.id,
          full_name: s.full_name || s.name || s.student_name,
          omr_status: s.omr_status || statuses[i % statuses.length],
        }));
        setStudents(data);
      } catch {
        // Both endpoints failed
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const startOMREntry = async (student: any) => {
    setActiveStudent(student);
    setView('entry');
    setQuestions([]);
    setAnswers({});
    try {
      const qRes = await omrApi.getQuestionsForStudent(student.student_id);
      const questionsData = qRes?.data || qRes?.response?.data || [];
      setQuestions(questionsData);
      
      const rRes = await omrApi.getResponsesForStudent(student.student_id);
      const existing = rRes?.data || rRes?.response?.data || [];
      const loadedAnswers: Record<number, string> = {};
      existing.forEach((resp: any) => {
        const qIndex = questionsData.findIndex((q: any) => q.id === resp.question_id);
        if (qIndex !== -1 && resp.selected_option) loadedAnswers[qIndex] = resp.selected_option;
      });
      setAnswers(loadedAnswers);
    } catch (err) {
      toast.error('Failed to load OMR details');
    }
  };

  const handleSaveOMR = async (status: number) => {
    if (!activeStudent || questions.length === 0) return;
    setIsSaving(true);
    try {
      const responses = Object.keys(answers).map(qIndexStr => ({
        question_id: questions[parseInt(qIndexStr)].id,
        selected_option: answers[parseInt(qIndexStr)]
      }));
      await omrApi.saveResponses({
        student_id: activeStudent.student_id,
        teacher_id: 0,
        responses,
        status
      });
      toast.success(status === 1 ? 'Responses Submitted!' : 'Draft Saved!');
      if (status === 1) { setView('list'); fetchStudents(); }
    } catch (err) {
      toast.error('Failed to save responses');
    } finally {
      setIsSaving(false);
    }
  };

  // --- ENTRY VIEW ---
  if (view === 'entry') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => setView('list')}>OMR Result</span>
          <span>›</span>
          <span style={{ cursor: 'pointer' }} onClick={() => setView('list')}>Digital OMR Entry</span>
          <span>›</span>
          <span style={{ cursor: 'pointer' }} onClick={() => setView('list')}>Student List</span>
          <span>›</span>
          <span style={{ fontWeight: 600, color: '#1E293B' }}>OMR Sheet</span>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>OMR Sheet Entry</h1>
            <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '4px' }}>Fill the selected option for each question as per the student's OMR sheet.</p>
          </div>
          <button onClick={() => setView('list')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.875rem', cursor: 'pointer', color: '#64748B' }}>
            Exit OMR Entry
          </button>
        </div>

        {/* Student Info */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px 20px', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#EEF2FF', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem' }}>
              {activeStudent?.full_name ? activeStudent.full_name.split(' ').map((n: string) => n[0]).join('') : '?'}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#1E293B' }}>{activeStudent?.full_name}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>APAAR ID: {activeStudent?.apaar_id || 'N/A'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '32px', fontSize: '0.8125rem' }}>
            <div><div style={{ color: '#64748B', fontSize: '0.6875rem' }}>Grade</div><div style={{ fontWeight: 600 }}>{typeof activeStudent?.grade === 'object' ? activeStudent?.grade?.grade_name : activeStudent?.grade}</div></div>
            <div><div style={{ color: '#64748B', fontSize: '0.6875rem' }}>Section</div><div style={{ fontWeight: 600 }}>{activeStudent?.section}</div></div>
            <div><div style={{ color: '#64748B', fontSize: '0.6875rem' }}>Test/Exam</div><div style={{ fontWeight: 600 }}>Unit Test - 1 (LAT)</div></div>
            <div><div style={{ color: '#64748B', fontSize: '0.6875rem' }}>Total Questions</div><div style={{ fontWeight: 600 }}>{questions.length}</div></div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.6875rem', marginBottom: '4px' }}>Progress</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600 }}>{Object.keys(answers).length} / {questions.length || 1}</span>
                <div style={{ width: '120px', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#6366F1', borderRadius: '3px', width: `${(Object.keys(answers).length / (questions.length || 1)) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance */}
        <div style={{ background: '#F0FDF4', borderRadius: '12px', padding: '14px 20px', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: '#64748B' }}>
            <Users size={16} /> Attendance
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input type="radio" name="attendance" defaultChecked style={{ accentColor: '#10B981' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#16A34A' }}>Present</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input type="radio" name="attendance" style={{ accentColor: '#94A3B8' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748B' }}>Absent</span>
            </label>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: '#16A34A', background: '#DCFCE7', padding: '6px 12px', borderRadius: '8px' }}>
            <FileCheck size={14} /> Student is marked present. Please fill the OMR below.
          </div>
        </div>

        {/* Questions Grid */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px 24px' }}>
            {questions.map((q, i) => {
              const nextUnanswered = Array.from({ length: questions.length }).findIndex((_, idx) => !answers[idx]);
              const isHighlighted = i === nextUnanswered;
              return (
                <div key={i} style={{
                  display: 'flex', flexDirection: 'column', gap: '12px',
                  border: isHighlighted ? '2px solid #6366F1' : '1px solid #E2E8F0',
                  background: isHighlighted ? 'rgba(99,102,241,0.05)' : 'white',
                  borderRadius: '8px', padding: '12px'
                }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B' }}>{i + 1}</div>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
                    {['A', 'B', 'C', 'D'].map((opt) => {
                      const isSelected = answers[i] === opt;
                      return (
                        <div key={opt} onClick={() => setAnswers(prev => ({ ...prev, [i]: opt }))} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '10px', fontWeight: 'bold',
                            background: isSelected ? '#6366F1' : 'transparent',
                            color: isSelected ? 'white' : 'transparent',
                            border: isSelected ? 'none' : (i > nextUnanswered ? '1px dashed #CBD5E1' : '1px solid #94A3B8'),
                          }}>{isSelected ? opt : ''}</div>
                          <span style={{ fontSize: '10px', fontWeight: 600, color: '#1E293B' }}>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '20px' }}>
          <button onClick={() => { setView('list'); fetchStudents(); }} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.875rem', cursor: 'pointer', color: '#64748B' }}>
            Exit
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => handleSaveOMR(0)} disabled={isSaving} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.875rem', cursor: 'pointer', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button onClick={() => handleSaveOMR(1)} disabled={isSaving} style={{ padding: '10px 20px', borderRadius: '10px', background: '#6366F1', color: 'white', fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isSaving ? 'Submitting...' : 'Save & Submit'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  const filteredStudents = students.filter(s => {
    const q = searchQuery.toLowerCase();
    if (q) {
      const nameMatch = (s.full_name || '').toLowerCase().includes(q);
      const apaarMatch = (s.apaar_id || '').includes(q);
      if (!nameMatch && !apaarMatch) return false;
    }
    if (gradeFilter) {
      const studentGrade = typeof s.grade === 'object' ? s.grade?.grade_name : s.grade;
      if (studentGrade !== gradeFilter) return false;
    }
    if (sectionFilter && s.section !== sectionFilter) return false;
    if (statusFilter && s.omr_status !== statusFilter) return false;
    return true;
  });

  const totalStudents = filteredStudents.length;
  const completedCount = filteredStudents.filter(s => s.omr_status === 'Completed').length;
  const pendingCount = filteredStudents.filter(s => s.omr_status === 'Pending').length;
  const inProgressCount = filteredStudents.filter(s => s.omr_status === 'In Progress').length;
  const notUploadedCount = filteredStudents.filter(s => s.omr_status === 'Not Uploaded').length;
  const absentCount = filteredStudents.filter(s => s.omr_status === 'Absent').length;

  const totalPages = Math.ceil(totalStudents / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  const renderStatus = (status: string) => {
    const s = String(status || '').toLowerCase();
    if (s === 'completed') return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500, background: '#D1FAE5', color: '#10B981' }}>✓ Completed</span>;
    if (s === 'in progress') return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500, background: '#FEF3C7', color: '#F59E0B' }}>↻ In Progress</span>;
    if (s === 'pending') return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500, background: '#FEF9C3', color: '#CA8A04' }}>○ Pending</span>;
    if (s === 'not uploaded') return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500, background: '#FEE2E2', color: '#EF4444' }}>✗ Not Uploaded</span>;
    if (s === 'absent') return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500, background: '#F1F5F9', color: '#64748B' }}>⊘ Absent</span>;
    return <span style={{ color: '#64748B' }}>{status || '-'}</span>;
  };

  const renderActionButton = (status: string, student: any) => {
    const s = String(status || '').toLowerCase();
    if (s === 'completed') return <button onClick={() => startOMREntry(student)} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.75rem', cursor: 'pointer', color: '#6366F1', fontWeight: 500, whiteSpace: 'nowrap' }}>View / Edit</button>;
    if (s === 'in progress') return <button onClick={() => startOMREntry(student)} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: '#6366F1', fontSize: '0.75rem', cursor: 'pointer', color: 'white', fontWeight: 600, whiteSpace: 'nowrap' }}>Continue</button>;
    if (s === 'absent') return <button onClick={() => startOMREntry(student)} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.75rem', cursor: 'pointer', color: '#64748B', fontWeight: 500, whiteSpace: 'nowrap' }}>View</button>;
    return <button onClick={() => startOMREntry(student)} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: '#6366F1', fontSize: '0.75rem', cursor: 'pointer', color: 'white', fontWeight: 600, whiteSpace: 'nowrap' }}>Start Entry</button>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ cursor: 'pointer' }}>OMR Result</span>
        <span>›</span>
        <span style={{ cursor: 'pointer' }}>Digital OMR Entry</span>
        <span>›</span>
        <span style={{ fontWeight: 600, color: '#1E293B' }}>Student List</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Student List</h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '4px' }}>
            Select a student to start or continue entering OMR responses.<br />
            Once all the students' OMR are filled, then click on <strong style={{ color: '#1E293B' }}>Submit</strong> to share final OMR data.
          </p>
        </div>
        <button disabled style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.875rem', cursor: 'not-allowed', color: '#94A3B8', opacity: 0.7 }}>
          <FileText size={16} />
          Submit All
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '140px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '6px', fontWeight: 500 }}>Grade</label>
          <div style={{ position: 'relative' }}>
            <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)} style={{ width: '100%', padding: '10px 32px 10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.8125rem', background: 'white', outline: 'none', cursor: 'pointer', appearance: 'none' }}>
              <option value="">All Grades</option>
              <option value="Grade 3">Grade 3</option>
              <option value="Grade 5">Grade 5</option>
              <option value="Grade 6">Grade 6</option>
              <option value="Grade 9">Grade 9</option>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748B' }} />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '100px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '6px', fontWeight: 500 }}>Section</label>
          <div style={{ position: 'relative' }}>
            <select value={sectionFilter} onChange={e => setSectionFilter(e.target.value)} style={{ width: '100%', padding: '10px 32px 10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.8125rem', background: 'white', outline: 'none', cursor: 'pointer', appearance: 'none' }}>
              <option value="">All Sections</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748B' }} />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '6px', fontWeight: 500 }}>Test/Exam</label>
          <div style={{ position: 'relative' }}>
            <select style={{ width: '100%', padding: '10px 32px 10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.8125rem', background: 'white', outline: 'none', cursor: 'pointer', appearance: 'none' }}>
              <option>Unit Test - 1 (LAT)</option>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748B' }} />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '6px', fontWeight: 500 }}>OMR Status</label>
          <div style={{ position: 'relative' }}>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: '100%', padding: '10px 32px 10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.8125rem', background: 'white', outline: 'none', cursor: 'pointer', appearance: 'none' }}>
              <option value="">All Status</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Not Uploaded">Not Uploaded</option>
              <option value="Absent">Absent</option>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748B' }} />
          </div>
        </div>
        <div style={{ flex: 1.5, minWidth: '250px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '6px', fontWeight: 500 }}>Search Student</label>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by student name or roll no." style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.8125rem', outline: 'none' }} />
          </div>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.8125rem', cursor: 'pointer', color: '#64748B', height: '40px', marginBottom: '1px' }}>
          <Filter size={14} />
          Filters
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
        {loading ? (
          <>
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
          </>
        ) : (
          <>
        <div style={{ background: 'white', borderRadius: '12px', padding: '14px 16px', border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color="#6366F1" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Total Students</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>{totalStudents}</div>
            </div>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '14px 16px', border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileCheck size={20} color="#10B981" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>OMR Completed</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>{completedCount}</div>
              <div style={{ fontSize: '0.6875rem', color: '#10B981', marginTop: '2px' }}>{totalStudents ? ((completedCount / totalStudents) * 100).toFixed(2) : 0}%</div>
            </div>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '14px 16px', border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} color="#F59E0B" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Pending</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>{pendingCount + inProgressCount}</div>
              <div style={{ fontSize: '0.6875rem', color: '#F59E0B', marginTop: '2px' }}>{totalStudents ? (((pendingCount + inProgressCount) / totalStudents) * 100).toFixed(2) : 0}%</div>
            </div>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '14px 16px', border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={20} color="#EF4444" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Not Uploaded</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>{notUploadedCount}</div>
              <div style={{ fontSize: '0.6875rem', color: '#EF4444', marginTop: '2px' }}>{totalStudents ? ((notUploadedCount / totalStudents) * 100).toFixed(2) : 0}%</div>
            </div>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '14px 16px', border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserX size={20} color="#64748B" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Absent</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>{absentCount}</div>
              <div style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: '2px' }}>{totalStudents ? ((absentCount / totalStudents) * 100).toFixed(2) : 0}%</div>
            </div>
          </div>
        </div>
        </>
        )}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #F1F5F9', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <ShimmerTable columns={7} rows={itemsPerPage || 8} />
          ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, fontSize: '0.8125rem', color: '#64748B', background: '#FAFBFC' }}>S. No.</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, fontSize: '0.8125rem', color: '#64748B', background: '#FAFBFC' }}>Student Name</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, fontSize: '0.8125rem', color: '#64748B', background: '#FAFBFC' }}>APAAR ID</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, fontSize: '0.8125rem', color: '#64748B', background: '#FAFBFC' }}>Gender</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, fontSize: '0.8125rem', color: '#64748B', background: '#FAFBFC' }}>OMR Status</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, fontSize: '0.8125rem', color: '#64748B', background: '#FAFBFC' }}>Last Saved On</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600, fontSize: '0.8125rem', color: '#64748B', background: '#FAFBFC' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>No students found</td></tr>
              ) : paginatedStudents.map((s, idx) => {
                const name = s.full_name || '-';
                const initials = getInitials(name);
                const avatarColor = getAvatarColor(name);
                const gender = s.gender === 'm' || s.gender === 'M' || (s.gender || '').toLowerCase() === 'male' ? 'Male' : s.gender === 'f' || s.gender === 'F' || (s.gender || '').toLowerCase() === 'female' ? 'Female' : s.gender || '-';
                const lastSaved = s.last_saved ? new Date(s.last_saved).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + new Date(s.last_saved).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-';

                return (
                  <tr key={s.student_id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 16px', color: '#64748B' }}>{startIndex + idx + 1}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'white', flexShrink: 0 }}>
                          {initials}
                        </div>
                        <span style={{ fontWeight: 500, color: '#1E293B' }}>{name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748B' }}>{s.apaar_id || '-'}</td>
                    <td style={{ padding: '14px 16px', color: '#64748B' }}>{gender}</td>
                    <td style={{ padding: '14px 16px' }}>{renderStatus(s.omr_status)}</td>
                    <td style={{ padding: '14px 16px', color: '#64748B', fontSize: '0.8125rem' }}>{lastSaved}</td>
                    <td style={{ padding: '14px 16px' }}>{renderActionButton(s.omr_status, s)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>
            Showing {totalStudents > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, totalStudents)} of {totalStudents} students
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              let pageNum: number;
              if (totalPages <= 5) { pageNum = i + 1; }
              else if (currentPage <= 3) { pageNum = i + 1; }
              else if (currentPage >= totalPages - 2) { pageNum = totalPages - 4 + i; }
              else { pageNum = currentPage - 2 + i; }
              return (
                <button key={pageNum} onClick={() => setCurrentPage(pageNum)} style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  border: currentPage === pageNum ? '1px solid #6366F1' : '1px solid #E2E8F0',
                  background: currentPage === pageNum ? '#6366F1' : 'white',
                  color: currentPage === pageNum ? 'white' : '#64748B',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: '0.875rem', fontWeight: currentPage === pageNum ? 600 : 400,
                }}>{pageNum}</button>
              );
            })}
            {totalPages > 5 && (
              <>
                <span style={{ color: '#94A3B8', padding: '0 4px' }}>...</span>
                <button onClick={() => setCurrentPage(totalPages)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.875rem', color: '#64748B' }}>{totalPages}</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
