'use client';

import React, { useState, useEffect } from 'react';
import { Users, FileCheck, Clock, UserX, Search, Filter, RotateCcw, ChevronLeft, Save, ArrowRight, UserPlus, FileText } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function OMRPage() {
  const [view, setView] = useState<'list' | 'entry'>('list');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStudent, setActiveStudent] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      const res = await axios.get(`${apiUrl}/omr/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load students', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const renderStatus = (status: string) => {
    switch(status) {
      case 'Completed': return <span className="text-emerald-500 font-medium flex items-center gap-1">✓ Completed</span>;
      case 'In Progress': return <span className="text-amber-500 font-medium flex items-center gap-1">↻ In Progress</span>;
      case 'Pending': return <span className="text-blue-500 font-medium flex items-center gap-1">○ Pending</span>;
      case 'Not Uploaded': return <span className="text-red-500 font-medium flex items-center gap-1">⚠ Not Uploaded</span>;
      case 'Absent': return <span className="text-gray-500 font-medium flex items-center gap-1">⨯ Absent</span>;
      default: return null;
    }
  };

  const renderActionButton = (status: string, student: any) => {
    const isStart = status === 'Pending' || status === 'Not Uploaded';
    const actionText = isStart ? 'Start Entry' : (status === 'In Progress' ? 'Continue' : 'View / Edit');
    const handleClick = () => startOMREntry(student);

    if (isStart || status === 'In Progress') {
      return <button onClick={handleClick} className="btn btn-primary w-full py-1 text-xs">{actionText}</button>;
    }
    return <button onClick={handleClick} className="btn btn-outline text-primary-purple border-primary-purple w-full py-1 text-xs bg-purple-50 hover:bg-purple-100">{actionText}</button>;
  };

  const startOMREntry = async (student: any) => {
    setActiveStudent(student);
    setView('entry');
    setQuestions([]);
    setAnswers({});
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      
      // Fetch questions
      const qRes = await axios.get(`${apiUrl}/omr/questions/${student.student_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(qRes.data?.data || []);

      // Fetch existing responses
      const rRes = await axios.get(`${apiUrl}/omr/responses/${student.student_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const existing = rRes.data?.data || [];
      const loadedAnswers: Record<number, string> = {};
      existing.forEach((resp: any, index: number) => {
        // Find question index
        const qIndex = (qRes.data?.data || []).findIndex((q: any) => q.id === resp.question_id);
        if (qIndex !== -1 && resp.selected_option) {
          loadedAnswers[qIndex] = resp.selected_option;
        }
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
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      
      const responses = Object.keys(answers).map(qIndexStr => {
        const qIndex = parseInt(qIndexStr);
        return {
          question_id: questions[qIndex].id,
          selected_option: answers[qIndex]
        };
      });

      await axios.post(`${apiUrl}/omr/save`, {
        student_id: activeStudent.student_id,
        teacher_id: 0, // Backend will use req.user.sub
        responses,
        status
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(status === 1 ? 'Responses Submitted!' : 'Draft Saved!');
      
      if (status === 1) {
        // Go back to list and refresh
        setView('list');
        fetchStudents();
      }
    } catch (err) {
      toast.error('Failed to save responses');
    } finally {
      setIsSaving(false);
    }
  };



  if (view === 'entry') {
    return (
      <div className="flex flex-col gap-6">
        {/* Breadcrumb & Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted mb-2 flex items-center gap-2">
              <span className="cursor-pointer hover:text-primary-purple" onClick={() => setView('list')}>OMR Result</span>
              <span>›</span>
              <span className="cursor-pointer hover:text-primary-purple" onClick={() => setView('list')}>Digital OMR Entry</span>
              <span>›</span>
              <span className="cursor-pointer hover:text-primary-purple" onClick={() => setView('list')}>Student List</span>
              <span>›</span>
              <span className="font-semibold text-text-dark">OMR Sheet</span>
            </div>
            <h1 className="text-xl font-bold">OMR Sheet Entry</h1>
            <p className="text-sm text-muted">Fill the selected option for each question as per the student's OMR sheet.</p>
          </div>
          <button onClick={() => setView('list')} className="btn btn-outline flex items-center gap-2 bg-white">
            <ChevronLeft size={16} /> Exit OMR Entry
          </button>
        </div>

        {/* Student Info Bar */}
        <div className="card flex items-center justify-between bg-white border border-border-light shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-primary-purple flex items-center justify-center font-bold text-lg">
              {activeStudent?.full_name ? activeStudent.full_name.split(' ').map((n: string) => n[0]).join('') : '?'}
            </div>
            <div>
              <div className="font-bold">{activeStudent?.full_name}</div>
              <div className="text-xs text-muted">APAAR ID: {activeStudent?.apaar_id || 'N/A'}</div>
            </div>
          </div>
          <div className="flex gap-8 text-sm">
            <div>
              <div className="text-muted text-xs">Grade</div>
              <div className="font-semibold">{activeStudent?.grade}</div>
            </div>
            <div>
              <div className="text-muted text-xs">Section</div>
              <div className="font-semibold">{activeStudent?.section}</div>
            </div>
            <div>
              <div className="text-muted text-xs">Test/Exam</div>
              <div className="font-semibold">Unit Test - 1 (LAT)</div>
            </div>
            <div>
              <div className="text-muted text-xs">Total Questions</div>
              <div className="font-semibold">{questions.length}</div>
            </div>
            <div>
              <div className="text-muted text-xs mb-1">Progress</div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">{Object.keys(answers).length} / {questions.length || 1}</span>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-purple" style={{ width: `${(Object.keys(answers).length / (questions.length || 1)) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Toggle */}
        <div className="card bg-green-50/50 border border-green-100 flex items-center gap-8 py-3">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Users size={16} /> Attendance
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="attendance" defaultChecked className="accent-green-500 w-4 h-4" />
              <span className="text-sm font-medium text-green-700">Present</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="attendance" className="accent-gray-400 w-4 h-4" />
              <span className="text-sm font-medium text-muted">Absent</span>
            </label>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-100 px-3 py-1 rounded-md ml-auto">
            <FileCheck size={16} /> Student is marked present. Please fill the OMR below.
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-xs text-muted px-2">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-primary-purple"></span> Selected Answer</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full border border-gray-300"></span> Not Selected</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full border border-gray-300" style={{ borderStyle: 'dashed' }}></span> Not Visited</div>
        </div>

        {/* Grid of Bubbles */}
        <div className="card" style={{ backgroundColor: 'white', padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px 24px' }}>
            {questions.map((q, i) => {
              // Highlight the next unanswered question
              const nextUnanswered = Array.from({length: questions.length}).findIndex((_, idx) => !answers[idx]);
              const isHighlighted = i === nextUnanswered;
              
              return (
                <div key={i} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px',
                  border: isHighlighted ? '2px solid var(--primary-purple)' : '1px solid var(--border-light)',
                  backgroundColor: isHighlighted ? 'rgba(76,53,230,0.05)' : 'white',
                  borderRadius: '8px',
                  padding: '12px'
                }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)' }}>{i + 1}</div>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
                    {['A', 'B', 'C', 'D'].map((opt) => {
                      const isSelected = answers[i] === opt;
                      const isNotVisited = i > nextUnanswered;
                      
                      return (
                        <div 
                          key={opt} 
                          onClick={() => setAnswers(prev => ({ ...prev, [i]: opt }))}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                        >
                          <div style={{
                            width: '20px', 
                            height: '20px', 
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            backgroundColor: isSelected ? 'var(--primary-purple)' : 'transparent',
                            color: isSelected ? 'white' : 'transparent',
                            border: isSelected 
                              ? 'none' 
                              : isNotVisited 
                                ? '1px dashed #CBD5E1' 
                                : '1px solid #94A3B8',
                            transition: 'all 0.2s ease'
                          }}>
                            {isSelected ? opt : ''}
                          </div>
                          <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-dark)' }}>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
            <button className="btn btn-outline" style={{ color: 'var(--primary-purple)', borderColor: 'var(--primary-purple)', backgroundColor: 'rgba(76,53,230,0.05)', fontSize: '0.75rem', padding: '6px 16px' }}>
              + Load More
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border-light pt-6 mt-2">
          <button onClick={() => { setView('list'); fetchStudents(); }} className="btn btn-outline bg-white text-muted">
            <ChevronLeft size={16} /> Exit
          </button>
          <button onClick={() => handleSaveOMR(0)} disabled={isSaving} className="btn btn-outline bg-white flex items-center gap-2 text-text-dark">
            <Save size={16} /> {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
          <button onClick={() => handleSaveOMR(1)} disabled={isSaving} className="btn btn-primary flex items-center gap-2">
            {isSaving ? 'Submitting...' : 'Save & Submit'} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All Grades');
  const [sectionFilter, setSectionFilter] = useState('All Sections');

  const filteredStudents = students.filter(s => {
    const matchesSearch = !searchQuery || s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || (s.apaar_id && s.apaar_id.includes(searchQuery));
    const matchesGrade = gradeFilter === 'All Grades' || s.grade === gradeFilter;
    const matchesSection = sectionFilter === 'All Sections' || s.section === sectionFilter;
    return matchesSearch && matchesGrade && matchesSection;
  });

  const totalStudents = filteredStudents.length;
  const completedCount = filteredStudents.filter(s => s.omr_status === 'Completed').length;
  const inProgressCount = filteredStudents.filter(s => s.omr_status === 'In Progress').length;
  const pendingCount = filteredStudents.filter(s => s.omr_status === 'Pending').length;

  const uniqueGrades = Array.from(new Set(students.map(s => s.grade))).filter(Boolean).sort();
  const uniqueSections = Array.from(new Set(students.map(s => s.section))).filter(Boolean).sort();

  // --- LIST VIEW ---
  return (
    <div className="flex flex-col gap-6 relative">
      {/* Breadcrumb */}
      <div className="text-xs text-muted flex items-center gap-2">
        <span className="cursor-pointer hover:text-primary-purple">OMR Result</span>
        <span>›</span>
        <span className="font-semibold text-text-dark">Digital OMR Entry</span>
        <span>›</span>
        <span className="font-semibold text-text-dark">Student List</span>
      </div>

      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Student List</h1>
          <p className="text-muted text-sm mt-1">Select a student to start or continue entering OMR responses.<br/>Once all the students' OMR are filled, click on <strong>Submit</strong> to share final OMR data.</p>
        </div>
        <button className="btn btn-outline text-muted" disabled style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#F8FAFC', opacity: 0.6 }}>
          <FileText size={16} />
          Submit All
        </button>
      </div>

      {/* Filters Area */}
      <div className="card">
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs text-muted mb-1 block">Grade</label>
            <select 
              className="w-full p-2 rounded-md border border-border-light text-sm bg-white"
              value={gradeFilter}
              onChange={e => setGradeFilter(e.target.value)}
            >
              <option value="All Grades">All Grades</option>
              <option value="Grade 3">Grade 3</option>
              <option value="Grade 6">Grade 6</option>
              <option value="Grade 9">Grade 9</option>
            </select>
          </div>
          <div className="flex-1 min-w-[100px]">
            <label className="text-xs text-muted mb-1 block">Section</label>
            <select 
              className="w-full p-2 rounded-md border border-border-light text-sm bg-white"
              value={sectionFilter}
              onChange={e => setSectionFilter(e.target.value)}
            >
              <option value="All Sections">All Sections</option>
              {uniqueSections.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-muted mb-1 block">Test/Exam</label>
            <select className="w-full p-2 rounded-md border border-border-light text-sm bg-white">
              <option>Unit Test - 1 (LAT)</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs text-muted mb-1 block">OMR Status</label>
            <select className="w-full p-2 rounded-md border border-border-light text-sm bg-white">
              <option>All Status</option>
            </select>
          </div>
          <div className="flex-[2] min-w-[250px]">
            <label className="text-xs text-muted mb-1 block">Search Student</label>
            <div className="relative">
              <Search size={16} className="text-muted absolute left-3 top-2.5" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by student name or roll no." 
                className="w-full p-2 pl-9 rounded-md border border-border-light text-sm" 
              />
            </div>
          </div>
          <div className="flex items-end">
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(76,53,230,0.1)', color: '#4C35E6', border: '1px solid rgba(76,53,230,0.2)' }}>
              <Filter size={16} /> Filters
            </button>
          </div>
        </div>

        {/* Stat Cards Row */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="border border-border-light rounded-lg p-3 flex items-center gap-3">
            <div className="bg-purple-50 text-primary-purple p-2 rounded-full"><Users size={18} /></div>
            <div>
              <div className="text-xs text-muted">Total Students</div>
              <div className="font-bold text-lg">{totalStudents}</div>
            </div>
          </div>
          <div className="border border-green-200 bg-green-50/30 rounded-lg p-3 flex items-center gap-3">
            <div className="bg-green-100 text-green-600 p-2 rounded-full"><FileCheck size={18} /></div>
            <div>
              <div className="text-xs text-green-700">OMR Completed</div>
              <div className="font-bold text-lg text-green-700">{completedCount} <span className="text-xs font-normal opacity-70">{totalStudents ? ((completedCount/totalStudents)*100).toFixed(2) : 0}%</span></div>
            </div>
          </div>
          <div className="border border-border-light rounded-lg p-3 flex items-center gap-3">
            <div className="bg-amber-50 text-amber-500 p-2 rounded-full"><Clock size={18} /></div>
            <div>
              <div className="text-xs text-muted">In Progress</div>
              <div className="font-bold text-lg">{inProgressCount} <span className="text-xs font-normal text-muted">{totalStudents ? ((inProgressCount/totalStudents)*100).toFixed(2) : 0}%</span></div>
            </div>
          </div>
          <div className="border border-border-light rounded-lg p-3 flex items-center gap-3">
            <div className="bg-red-50 text-red-500 p-2 rounded-full"><UserX size={18} /></div>
            <div>
              <div className="text-xs text-muted">Pending</div>
              <div className="font-bold text-lg">{pendingCount} <span className="text-xs font-normal text-muted">{totalStudents ? ((pendingCount/totalStudents)*100).toFixed(2) : 0}%</span></div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>S.No.</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>Student Name</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>APAR ID</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>Gender</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>OMR Status</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>Last Saved On</th>
                <th style={{ textAlign: 'center', padding: '12px', fontWeight: 600 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>Loading students...</td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>No students found</td></tr>
              ) : filteredStudents.map((s, idx) => (
                <tr key={s.student_id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '16px 12px' }}>{idx + 1}</td>
                  <td style={{ padding: '16px 12px', fontWeight: 600 }}>
                    <div className="flex items-center gap-2">
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(76,53,230,0.1)', color: '#4C35E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {s.full_name ? s.full_name.split(' ').map((n: string) => n[0]).join('') : '?'}
                      </div>
                      {s.full_name}
                    </div>
                  </td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{s.apaar_id || '-'}</td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{s.gender === 'm' ? 'Male' : s.gender === 'f' ? 'Female' : 'Other'}</td>
                  <td style={{ padding: '16px 12px' }}>{renderStatus(s.omr_status)}</td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{s.last_saved ? new Date(s.last_saved).toLocaleString() : '-'}</td>
                  <td style={{ padding: '16px 12px', textAlign: 'center', width: '120px' }}>
                    {renderActionButton(s.omr_status, s)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-6 text-sm text-muted">
          <div>Showing Top 6 of 45 students</div>
          <div className="flex gap-1">
            <button style={{ padding: '4px 10px', background: '#4C35E6', color: 'white', borderRadius: '4px' }}>1</button>
            <button style={{ padding: '4px 10px', border: '1px solid var(--border-light)', borderRadius: '4px' }}>2</button>
            <button style={{ padding: '4px 10px', border: '1px solid var(--border-light)', borderRadius: '4px' }}>3</button>
            <button style={{ padding: '4px 10px', border: '1px solid var(--border-light)', borderRadius: '4px' }}>...</button>
            <button style={{ padding: '4px 10px', border: '1px solid var(--border-light)', borderRadius: '4px' }}>8</button>
          </div>
        </div>
      </div>
    </div>
  );
}
