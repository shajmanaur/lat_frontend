'use client';

import React, { useState } from 'react';
import { Users, FileCheck, Clock, UserX, Search, Filter, RotateCcw, ChevronLeft, Save, ArrowRight, UserPlus, FileText } from 'lucide-react';

const mockStudents = [
  { id: 1, name: 'Aman Sharma', aadhar: 'AF345678901234', gender: 'Male', status: 'Completed', lastSaved: '20 May 2025 10:30 AM', action: 'View / Edit' },
  { id: 2, name: 'Siya Verma', aadhar: 'AF345678901235', gender: 'Female', status: 'Completed', lastSaved: '20 May 2025 10:25 AM', action: 'View / Edit' },
  { id: 3, name: 'Rohan Mehta', aadhar: 'AF345678901236', gender: 'Male', status: 'In Progress', lastSaved: '20 May 2025 10:15 AM', action: 'Continue' },
  { id: 4, name: 'Neha Patel', aadhar: 'AF345678901237', gender: 'Female', status: 'Pending', lastSaved: '-', action: 'Start Entry' },
  { id: 5, name: 'Aditya Singh', aadhar: 'AF345678901238', gender: 'Male', status: 'Not Uploaded', lastSaved: '-', action: 'Start Entry' },
  { id: 6, name: 'Ananya Gupta', aadhar: 'AF345678901239', gender: 'Female', status: 'Absent', lastSaved: '20 May 2025 10:00 AM', action: 'View' },
  { id: 7, name: 'Vihaan Kumar', aadhar: 'AF345678901240', gender: 'Male', status: 'Pending', lastSaved: '-', action: 'Start Entry' },
];

export default function OMRPage() {
  const [view, setView] = useState<'list' | 'entry'>('list');

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

  const renderActionButton = (action: string) => {
    if (action === 'Start Entry' || action === 'Continue') {
      return <button onClick={() => setView('entry')} className="btn btn-primary w-full py-1 text-xs">{action}</button>;
    }
    return <button onClick={() => setView('entry')} className="btn btn-outline text-primary-purple border-primary-purple w-full py-1 text-xs bg-purple-50 hover:bg-purple-100">{action}</button>;
  };

  const [answers, setAnswers] = useState<Record<number, string>>({});

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
              AS
            </div>
            <div>
              <div className="font-bold">Aman Sharma</div>
              <div className="text-xs text-muted">UPMA ID: UP6802090004</div>
            </div>
          </div>
          <div className="flex gap-8 text-sm">
            <div>
              <div className="text-muted text-xs">Grade</div>
              <div className="font-semibold">5</div>
            </div>
            <div>
              <div className="text-muted text-xs">Section</div>
              <div className="font-semibold">A</div>
            </div>
            <div>
              <div className="text-muted text-xs">Test/Exam</div>
              <div className="font-semibold">Unit Test - 1 (LAT)</div>
            </div>
            <div>
              <div className="text-muted text-xs">Total Questions</div>
              <div className="font-semibold">45</div>
            </div>
            <div>
              <div className="text-muted text-xs mb-1">Progress</div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">{Object.keys(answers).length} / 45</span>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-purple" style={{ width: `${(Object.keys(answers).length / 45) * 100}%` }}></div>
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
            {Array.from({ length: 24 }).map((_, i) => {
              // Highlight the next unanswered question
              const nextUnanswered = Array.from({length: 24}).findIndex((_, idx) => !answers[idx]);
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
          <button className="btn btn-outline bg-white text-muted">
            <ChevronLeft size={16} /> Previous Student
          </button>
          <button className="btn btn-outline bg-white flex items-center gap-2 text-text-dark">
            <Save size={16} /> Save Draft
          </button>
          <button className="btn btn-primary flex items-center gap-2">
            Save & Next Student <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

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
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-muted mb-1 block">Grade</label>
            <select className="w-full p-2 rounded-md border border-border-light text-sm bg-white">
              <option>Grade 5</option>
            </select>
          </div>
          <div className="flex-1 min-w-[100px]">
            <label className="text-xs text-muted mb-1 block">Section</label>
            <select className="w-full p-2 rounded-md border border-border-light text-sm bg-white">
              <option>A</option>
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
              <div className="font-bold text-lg">45</div>
            </div>
          </div>
          <div className="border border-green-200 bg-green-50/30 rounded-lg p-3 flex items-center gap-3">
            <div className="bg-green-100 text-green-600 p-2 rounded-full"><FileCheck size={18} /></div>
            <div>
              <div className="text-xs text-green-700">OMR Completed</div>
              <div className="font-bold text-lg text-green-700">28 <span className="text-xs font-normal opacity-70">62.22%</span></div>
            </div>
          </div>
          <div className="border border-border-light rounded-lg p-3 flex items-center gap-3">
            <div className="bg-amber-50 text-amber-500 p-2 rounded-full"><Clock size={18} /></div>
            <div>
              <div className="text-xs text-muted">Pending</div>
              <div className="font-bold text-lg">12 <span className="text-xs font-normal text-muted">26.67%</span></div>
            </div>
          </div>
          <div className="border border-border-light rounded-lg p-3 flex items-center gap-3">
            <div className="bg-red-50 text-red-500 p-2 rounded-full"><UserX size={18} /></div>
            <div>
              <div className="text-xs text-muted">Not Uploaded</div>
              <div className="font-bold text-lg">3 <span className="text-xs font-normal text-muted">6.67%</span></div>
            </div>
          </div>
          <div className="border border-border-light rounded-lg p-3 flex items-center gap-3">
            <div className="bg-gray-100 text-gray-500 p-2 rounded-full"><Users size={18} /></div>
            <div>
              <div className="text-xs text-muted">Absent</div>
              <div className="font-bold text-lg">2 <span className="text-xs font-normal text-muted">4.44%</span></div>
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
              {mockStudents.map((s, idx) => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '16px 12px' }}>{idx + 1}</td>
                  <td style={{ padding: '16px 12px', fontWeight: 600 }}>
                    <div className="flex items-center gap-2">
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(76,53,230,0.1)', color: '#4C35E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {s.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      {s.name}
                    </div>
                  </td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{s.aadhar}</td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{s.gender}</td>
                  <td style={{ padding: '16px 12px' }}>{renderStatus(s.status)}</td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{s.lastSaved}</td>
                  <td style={{ padding: '16px 12px', textAlign: 'center', width: '120px' }}>
                    {renderActionButton(s.action)}
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
