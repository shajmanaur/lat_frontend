'use client';

import React, { useState } from 'react';
import { Users, UserCheck, Clock, UserX, Search, Filter, RotateCcw, Plus, Edit, MoreVertical } from 'lucide-react';

const mockTeachers = [
  { id: 1, name: 'Amit Sharma', email: 'amit.sharma@lat.com', mobile: '9876543210', grade: 'Grade 5', section: 'A', status: 'Active', assignedOn: '15 May 2025' },
  { id: 2, name: 'Priya Reddy', email: 'priya.reddy@lat.com', mobile: '9876543211', grade: 'Grade 3', section: 'C', status: 'Active', assignedOn: '12 May 2025' },
  { id: 3, name: 'Neha Kapoor', email: 'neha.kapoor@lat.com', mobile: '9876543212', grade: 'Grade 8', section: 'B', status: 'Active', assignedOn: '08 May 2025' },
  { id: 4, name: 'Rohit Singh', email: 'rohit.singh@lat.com', mobile: '9876543213', grade: 'Grade 10', section: 'A', status: 'Inactive', assignedOn: '04 May 2025' },
  { id: 5, name: 'Meera Sinha', email: 'meera.sinha@lat.com', mobile: '9876543214', grade: 'Grade 5', section: 'B', status: 'Active', assignedOn: '02 May 2025' },
];

export default function TeacherList() {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="flex flex-col gap-6 relative">
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Teacher List</h1>
          <p className="text-muted text-sm mt-1">Manage all teachers in your region. View, edit and manage teacher details.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}>
          <Plus size={16} />
          Add Teacher
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="card flex items-center gap-4 py-4">
          <div style={{ color: '#4C35E6', background: 'rgba(76,53,230,0.1)', padding: '10px', borderRadius: '50%' }}>
            <Users size={20} />
          </div>
          <div>
            <div className="text-sm font-medium text-muted">Total Teachers</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>128</div>
          </div>
        </div>

        <div className="card flex items-center gap-4 py-4">
          <div style={{ color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '10px', borderRadius: '50%' }}>
            <UserCheck size={20} />
          </div>
          <div>
            <div className="text-sm font-medium text-muted">Active Teachers</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>118</div>
          </div>
        </div>

        <div className="card flex items-center gap-4 py-4">
          <div style={{ color: '#F59E0B', background: 'rgba(245,158,11,0.1)', padding: '10px', borderRadius: '50%' }}>
            <Clock size={20} />
          </div>
          <div>
            <div className="text-sm font-medium text-muted">Inactive Teachers</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>10</div>
          </div>
        </div>

        <div className="card flex items-center gap-4 py-4">
          <div style={{ color: '#3B82F6', background: 'rgba(59,130,246,0.1)', padding: '10px', borderRadius: '50%' }}>
            <UserX size={20} />
          </div>
          <div>
            <div className="text-sm font-medium text-muted">Unassigned Teachers</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>6</div>
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
              placeholder="Search by name, email or mobile" 
              style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.875rem' }} 
            />
          </div>
          <select style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.875rem', minWidth: '150px' }}>
            <option>All Grades</option>
          </select>
          <select style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.875rem', minWidth: '150px' }}>
            <option>All Sections</option>
          </select>
          <select style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.875rem', minWidth: '150px' }}>
            <option>All Status</option>
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
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>Mobile Number</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>Grade</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>Section</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>Assigned On</th>
                <th style={{ textAlign: 'center', padding: '12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockTeachers.map((t, idx) => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '16px 12px' }}>{idx + 1}</td>
                  <td style={{ padding: '16px 12px', fontWeight: 600 }}>
                    <div className="flex items-center gap-2">
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(76,53,230,0.1)', color: '#4C35E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {t.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      {t.name}
                    </div>
                  </td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{t.email}</td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{t.mobile}</td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{t.grade}</td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{t.section}</td>
                  <td style={{ padding: '16px 12px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      background: t.status === 'Active' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                      color: t.status === 'Active' ? '#10B981' : '#F59E0B'
                    }}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{t.assignedOn}</td>
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
        <div className="flex justify-between items-center mt-6 text-sm text-muted">
          <div>Showing Top 10 of 128 teachers</div>
          <div className="flex gap-1">
            <button style={{ padding: '4px 10px', border: '1px solid var(--border-light)', borderRadius: '4px' }}>&lt;</button>
            <button style={{ padding: '4px 10px', background: '#4C35E6', color: 'white', borderRadius: '4px' }}>1</button>
            <button style={{ padding: '4px 10px', border: '1px solid var(--border-light)', borderRadius: '4px' }}>2</button>
            <button style={{ padding: '4px 10px', border: '1px solid var(--border-light)', borderRadius: '4px' }}>3</button>
            <button style={{ padding: '4px 10px', border: '1px solid var(--border-light)', borderRadius: '4px' }}>&gt;</button>
          </div>
        </div>
      </div>

      {/* Add Teacher Modal Overlay */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '600px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '24px' }}>Add Teacher</h2>
            
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '16px' }}>Personal Information</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Full Name *</label>
                <input type="text" placeholder="Enter full name" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.875rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Email Address *</label>
                <input type="email" placeholder="Enter email address" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.875rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Mobile Number *</label>
                <div className="flex">
                  <select style={{ padding: '10px', borderRadius: '8px 0 0 8px', border: '1px solid var(--border-light)', borderRight: 'none', fontSize: '0.875rem', background: '#F8FAFC' }}>
                    <option>+91</option>
                  </select>
                  <input type="text" placeholder="Enter mobile number" style={{ width: '100%', padding: '10px', borderRadius: '0 8px 8px 0', border: '1px solid var(--border-light)', fontSize: '0.875rem' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Gender *</label>
                <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.875rem' }}>
                  <option>Select gender</option>
                </select>
              </div>
            </div>

            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '16px' }}>Professional Information</h3>
            <div className="mb-8">
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Designation *</label>
              <input type="text" placeholder="Enter designation, role" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.875rem' }} />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="btn btn-outline" style={{ background: 'white', padding: '10px 24px' }}>Cancel</button>
              <button className="btn btn-primary" style={{ padding: '10px 24px' }}>Save Teacher</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
