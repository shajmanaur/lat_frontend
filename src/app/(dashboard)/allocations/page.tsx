'use client';

import React, { useState } from 'react';
import { Users, UserCheck, Clock, Layers, Search, Filter, RotateCcw, Plus, Edit, MoreVertical, LayoutGrid, CheckSquare, Square } from 'lucide-react';

const mockAllocations = [
  { id: 1, name: 'Amit Sharma', role: 'Class Teacher', subjects: 'Mathematics', status: 'Active', assignedOn: '15 May 2025', allocations: [{ grade: 'Grade 5', section: 'A' }, { grade: 'Grade 5', section: 'B' }] },
  { id: 2, name: 'Priya Reddy', role: 'Subject Teacher', subjects: 'Science', status: 'Active', assignedOn: '12 May 2025', allocations: [{ grade: 'Grade 3', section: 'A' }] },
  { id: 3, name: 'Neha Kapoor', role: 'Class Teacher', subjects: 'English', status: 'Active', assignedOn: '08 May 2025', allocations: [{ grade: 'Grade 8', section: 'B' }, { grade: 'Grade 8', section: 'C' }] },
  { id: 4, name: 'Rohit Singh', role: 'Subject Teacher', subjects: 'Mathematics', status: 'Inactive', assignedOn: '04 May 2025', allocations: [{ grade: 'Grade 10', section: 'A' }] },
  { id: 5, name: 'Meera Sinha', role: 'Subject Teacher', subjects: 'Science', status: 'Active', assignedOn: '02 May 2025', allocations: [{ grade: 'Grade 5', section: 'A' }, { grade: 'Grade 5', section: 'B' }] },
];

export default function TeacherAllocation() {
  const [showAllocateModal, setShowAllocateModal] = useState(false);

  return (
    <div className="flex flex-col gap-6 relative">
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Teacher Allocation</h1>
          <p className="text-muted text-sm mt-1">View all teacher allocations by grade and section.</p>
        </div>
        <button onClick={() => setShowAllocateModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}>
          <UserCheck size={16} />
          Allocate Teacher
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="card flex items-center gap-4 py-4">
          <div style={{ color: '#4C35E6', background: 'rgba(76,53,230,0.1)', padding: '10px', borderRadius: '50%' }}>
            <Users size={20} />
          </div>
          <div>
            <div className="text-sm font-medium text-muted">Total Allocations</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>24</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Across all grades</div>
          </div>
        </div>

        <div className="card flex items-center gap-4 py-4">
          <div style={{ color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '10px', borderRadius: '50%' }}>
            <UserCheck size={20} />
          </div>
          <div>
            <div className="text-sm font-medium text-muted">Active Allocations</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>21</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>87.5% of total</div>
          </div>
        </div>

        <div className="card flex items-center gap-4 py-4">
          <div style={{ color: '#F59E0B', background: 'rgba(245,158,11,0.1)', padding: '10px', borderRadius: '50%' }}>
            <Clock size={20} />
          </div>
          <div>
            <div className="text-sm font-medium text-muted">Inactive Allocations</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>3</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>12.5% of total</div>
          </div>
        </div>

        <div className="card flex items-center gap-4 py-4">
          <div style={{ color: '#3B82F6', background: 'rgba(59,130,246,0.1)', padding: '10px', borderRadius: '50%' }}>
            <Layers size={20} />
          </div>
          <div>
            <div className="text-sm font-medium text-muted">Grades Covered</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>3</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Grades 3, 5, 8</div>
          </div>
        </div>
      </div>

      {/* Filters and Table */}
      <div className="card">
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search size={16} className="text-muted absolute left-3 top-3" />
            <input 
              type="text" 
              placeholder="Search by teacher name, grade, section or role" 
              style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.875rem' }} 
            />
          </div>
          <select style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.875rem', minWidth: '130px' }}>
            <option>All Grades</option>
          </select>
          <select style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.875rem', minWidth: '130px' }}>
            <option>All Sections</option>
          </select>
          <select style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.875rem', minWidth: '130px' }}>
            <option>All Roles</option>
          </select>
          <select style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.875rem', minWidth: '150px' }}>
            <option>Academic Year: 2025-26</option>
          </select>
          
          <button className="btn btn-outline text-muted" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white' }}>
            <RotateCcw size={16} /> Reset
          </button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(76,53,230,0.1)', color: '#4C35E6', border: '1px solid rgba(76,53,230,0.2)' }}>
            <Filter size={16} /> Filters
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', color: 'var(--text-muted)' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>S.No.</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>Teacher Name</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>Allocated To (Grade - Section)</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>Subject(s)</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>Role</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>Allocated On</th>
                <th style={{ textAlign: 'center', padding: '12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockAllocations.map((a, idx) => (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '16px 12px' }}>{idx + 1}</td>
                  <td style={{ padding: '16px 12px', fontWeight: 600 }}>
                    <div className="flex items-center gap-2">
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(76,53,230,0.1)', color: '#4C35E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {a.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      {a.name}
                    </div>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <div className="flex flex-wrap gap-2">
                      {a.allocations.map((alloc, i) => (
                        <span key={i} style={{ padding: '4px 8px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '4px', fontSize: '0.75rem', color: '#4C35E6', fontWeight: 500 }}>
                          {alloc.grade} - {alloc.section}
                        </span>
                      ))}
                    </div>
                    {a.allocations.length > 1 && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {a.allocations.length} allocations
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{a.subjects}</td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{a.role}</td>
                  <td style={{ padding: '16px 12px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      background: a.status === 'Active' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                      color: a.status === 'Active' ? '#10B981' : '#F59E0B'
                    }}>
                      {a.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{a.assignedOn}</td>
                  <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                    <div className="flex items-center justify-center gap-3 text-muted">
                      <button><Edit size={16} className="hover:text-primary-purple cursor-pointer" /></button>
                      <button><MoreVertical size={16} className="cursor-pointer" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Allocate Teacher Modal Overlay */}
      {showAllocateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '600px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '24px' }}>Allocate Teacher</h2>
            
            <div className="flex justify-between items-center mb-6" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
               <div className="flex items-center gap-2" style={{ color: '#4C35E6', fontWeight: 600, fontSize: '0.875rem' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#4C35E6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>1</div>
                  Select Teacher
               </div>
               <div style={{ flex: 1, height: '1px', background: 'var(--border-light)', margin: '0 16px' }}></div>
               <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#E2E8F0', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>2</div>
                  Select Grade & Section
               </div>
               <div style={{ flex: 1, height: '1px', background: 'var(--border-light)', margin: '0 16px' }}></div>
               <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#E2E8F0', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>3</div>
                  Review & Confirm
               </div>
            </div>

            <div className="mb-4">
               <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>1. Select Teacher</h3>
               <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Choose a teacher to allocate to grade and section.</p>
               
               <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Teacher *</label>
               <div className="relative mb-4">
                  <Search size={16} className="text-muted absolute left-3 top-3" />
                  <input type="text" placeholder="Search by teacher name" defaultValue="Amit Sharma" style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid var(--primary-purple)', fontSize: '0.875rem' }} />
               </div>

               <div style={{ border: '1px solid var(--border-light)', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', background: '#F8FAFC' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(76,53,230,0.1)', color: '#4C35E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                     AS
                  </div>
                  <div className="flex-1">
                     <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Amit Sharma</div>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Class Teacher</div>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mathematics</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                     <div style={{ fontSize: '0.75rem', color: '#4C35E6', fontWeight: 600 }}>Current Allocations</div>
                     <div style={{ fontSize: '0.75rem', display: 'flex', gap: '4px', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <span style={{ padding: '2px 6px', background: '#E2E8F0', borderRadius: '4px' }}>Grade 5-A</span>
                        <span style={{ padding: '2px 6px', background: '#E2E8F0', borderRadius: '4px' }}>Grade 5-B</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setShowAllocateModal(false)} className="btn btn-outline" style={{ background: 'white', padding: '10px 24px' }}>Cancel</button>
              <button className="btn btn-primary" style={{ padding: '10px 24px' }}>Next Steps</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
