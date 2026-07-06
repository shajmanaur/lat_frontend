'use client';

import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Clock, UserX, Search, Filter, RotateCcw, Plus, Edit, MoreVertical, X } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function TeacherList() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, unassigned: 0 });
  const [loading, setLoading] = useState(true);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All Grades');
  const [sectionFilter, setSectionFilter] = useState('All Sections');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // Filter Options State
  const [gradeOptions, setGradeOptions] = useState<any[]>([]);
  const [sectionOptions, setSectionOptions] = useState<any[]>([]);

  // Form State
  const [fieldErrors, setFieldErrors] = useState<any>({});
  const [globalError, setGlobalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    gender: 'Select gender',
    designation: ''
  });

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      const res = await axios.get(`${apiUrl}/teachers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.status && res.data.response) {
        const payload = res.data.response.data || res.data.response;
        setTeachers(payload.teachers || []);
        setStats(payload.stats || { total: 0, active: 0, inactive: 0, unassigned: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch teachers', err);
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingTeacher(null);
    setFormData({ name: '', email: '', mobile: '', gender: 'Select gender', designation: '' });
    setFieldErrors({});
    setGlobalError('');
    setSuccessMsg('');
    setShowAddModal(true);
  };

  const openEditModal = (t: any) => {
    setEditingTeacher(t);
    setFormData({
      name: t.name,
      email: t.email,
      mobile: t.mobile,
      gender: 'Select gender',
      designation: '' 
    });
    setFieldErrors({});
    setGlobalError('');
    setSuccessMsg('');
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingTeacher(null);
    setFieldErrors({});
    setGlobalError('');
    setSuccessMsg('');
  };

  const validateForm = () => {
    const errs: any = {};
    if (!formData.name) errs.name = 'Full name is required.';
    if (!formData.email) {
      errs.email = 'Email address is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errs.email = 'Enter a valid email address.';
    }
    if (!formData.mobile) {
      errs.mobile = 'Mobile number is required.';
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      errs.mobile = 'Enter a valid 10-digit mobile number.';
    }
    if (formData.gender === 'Select gender') errs.gender = 'Gender is required.';
    if (!formData.designation) errs.designation = 'Designation is required.';
    return errs;
  };

  const handleSave = async () => {
    setGlobalError('');
    setFieldErrors({});
    setSuccessMsg('');

    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      
      const payload = { ...formData };

      if (editingTeacher) {
        await axios.put(`${apiUrl}/teachers/${editingTeacher.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccessMsg('Teacher updated successfully');
      } else {
        await axios.post(`${apiUrl}/teachers`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccessMsg('Teacher added successfully. Welcome email sent!');
      }

      fetchTeachers();
      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error;
      setGlobalError(Array.isArray(msg) ? msg.join(', ') : (msg || err.message || 'Operation failed'));
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      await axios.patch(`${apiUrl}/teachers/${id}/status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Status updated successfully');
      fetchTeachers();
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setGradeFilter('All Grades');
    setSectionFilter('All Sections');
    setStatusFilter('All Status');
  };

  // Compute derived options
  // Filter locally by search and status
  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = !searchQuery || 
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.mobile?.includes(searchQuery);
    
    // Note: since the actual teacher list might not contain exact matching grade/section yet if it's unassigned or mocked, we still filter it.
    const matchesGrade = gradeFilter === 'All Grades' || t.grade === gradeFilter;
    const matchesSection = sectionFilter === 'All Sections' || t.section === sectionFilter;
    const matchesStatus = statusFilter === 'All Status' || t.status === statusFilter;
    
    return matchesSearch && matchesGrade && matchesSection && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 relative">
      <Toaster position="top-right" />
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Teacher List</h1>
          <p className="text-muted text-sm mt-1">Manage all teachers in your region. View, edit and manage teacher details.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}>
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
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{loading ? '-' : stats.total}</div>
          </div>
        </div>

        <div className="card flex items-center gap-4 py-4">
          <div style={{ color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '10px', borderRadius: '50%' }}>
            <UserCheck size={20} />
          </div>
          <div>
            <div className="text-sm font-medium text-muted">Active Teachers</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{loading ? '-' : stats.active}</div>
          </div>
        </div>

        <div className="card flex items-center gap-4 py-4">
          <div style={{ color: '#F59E0B', background: 'rgba(245,158,11,0.1)', padding: '10px', borderRadius: '50%' }}>
            <Clock size={20} />
          </div>
          <div>
            <div className="text-sm font-medium text-muted">Inactive Teachers</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{loading ? '-' : stats.inactive}</div>
          </div>
        </div>

        <div className="card flex items-center gap-4 py-4">
          <div style={{ color: '#3B82F6', background: 'rgba(59,130,246,0.1)', padding: '10px', borderRadius: '50%' }}>
            <UserX size={20} />
          </div>
          <div>
            <div className="text-sm font-medium text-muted">Unassigned Teachers</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{loading ? '-' : stats.unassigned}</div>
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.875rem' }} 
            />
          </div>
          <select 
            value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.875rem', minWidth: '150px' }}>
            <option>All Grades</option>
            {gradeOptions.map((g: any) => <option key={g.grade_id} value={g.grade_name}>{g.grade_name}</option>)}
          </select>
          <select 
            value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.875rem', minWidth: '150px' }}
            disabled={gradeFilter === 'All Grades'}>
            <option>All Sections</option>
            {sectionOptions.map((s: string) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select 
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.875rem', minWidth: '150px' }}>
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          
          <button onClick={handleResetFilters} className="btn btn-outline text-muted hover:bg-slate-50" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white' }}>
            <RotateCcw size={16} /> Reset
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', minHeight: '300px' }}>
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
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>Loading teachers...</td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>No teachers found.</td>
                </tr>
              ) : (
                filteredTeachers.map((t, idx) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }} className="hover:bg-slate-50">
                    <td style={{ padding: '16px 12px' }}>{idx + 1}</td>
                    <td style={{ padding: '16px 12px', fontWeight: 600 }}>
                      <div className="flex items-center gap-2">
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(76,53,230,0.1)', color: '#4C35E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          {t.name?.split(' ').map((n: string) => n[0]).join('').substring(0,2) || 'T'}
                        </div>
                        {t.name}
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{t.email}</td>
                    <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{t.mobile}</td>
                    <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{t.grade}</td>
                    <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{t.section}</td>
                    <td style={{ padding: '16px 12px' }}>
                      <button onClick={() => handleToggleStatus(t.id)} style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        background: t.status === 'Active' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        color: t.status === 'Active' ? '#10B981' : '#F59E0B',
                        border: 'none',
                        cursor: 'pointer'
                      }}>
                        {t.status}
                      </button>
                    </td>
                    <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{t.assignedOn}</td>
                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                      <div className="flex items-center justify-center gap-3 text-muted">
                        <button onClick={() => openEditModal(t)}><Edit size={16} className="hover:text-primary-purple cursor-pointer transition-colors" /></button>
                        <button><MoreVertical size={16} className="cursor-pointer hover:text-slate-700" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-6 text-sm text-muted">
          <div>Showing Top {Math.min(10, filteredTeachers.length)} of {filteredTeachers.length} teachers</div>
          <div className="flex gap-1">
            <button style={{ padding: '4px 10px', border: '1px solid var(--border-light)', borderRadius: '4px' }}>&lt;</button>
            <button style={{ padding: '4px 10px', background: '#4C35E6', color: 'white', borderRadius: '4px' }}>1</button>
            <button style={{ padding: '4px 10px', border: '1px solid var(--border-light)', borderRadius: '4px' }}>&gt;</button>
          </div>
        </div>
      </div>

      {/* Add/Edit Teacher Modal Overlay */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '600px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', position: 'relative' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '24px' }}>{editingTeacher ? 'Edit Teacher' : 'Add Teacher'}</h2>
            
            {globalError && <div style={{ padding: '10px', background: '#FEE2E2', color: '#B91C1C', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{globalError}</div>}
            {successMsg && <div style={{ padding: '10px', background: '#DCFCE7', color: '#15803D', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{successMsg}</div>}
            
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '16px' }}>Personal Information</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Full Name *</label>
                <input 
                  type="text" 
                  placeholder="Enter full name" 
                  value={formData.name}
                  onChange={(e) => { setFormData({...formData, name: e.target.value}); setFieldErrors({...fieldErrors, name: null}); }}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${fieldErrors.name ? '#EF4444' : 'var(--border-light)'}`, fontSize: '0.875rem' }} 
                />
                {fieldErrors.name && <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>{fieldErrors.name}</div>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Email Address *</label>
                <input 
                  type="email" 
                  placeholder="Enter email address" 
                  value={formData.email}
                  onChange={(e) => { setFormData({...formData, email: e.target.value}); setFieldErrors({...fieldErrors, email: null}); }}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${fieldErrors.email ? '#EF4444' : 'var(--border-light)'}`, fontSize: '0.875rem' }} 
                />
                {fieldErrors.email && <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>{fieldErrors.email}</div>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Mobile Number *</label>
                <div className="flex">
                  <select style={{ padding: '10px', borderRadius: '8px 0 0 8px', border: `1px solid ${fieldErrors.mobile ? '#EF4444' : 'var(--border-light)'}`, borderRight: 'none', fontSize: '0.875rem', background: '#F8FAFC' }}>
                    <option>+91</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="Enter mobile number" 
                    value={formData.mobile}
                    onChange={(e) => { setFormData({...formData, mobile: e.target.value}); setFieldErrors({...fieldErrors, mobile: null}); }}
                    style={{ width: '100%', padding: '10px', borderRadius: '0 8px 8px 0', border: `1px solid ${fieldErrors.mobile ? '#EF4444' : 'var(--border-light)'}`, fontSize: '0.875rem' }} 
                  />
                </div>
                {fieldErrors.mobile && <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>{fieldErrors.mobile}</div>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Gender *</label>
                <select 
                  value={formData.gender}
                  onChange={(e) => { setFormData({...formData, gender: e.target.value}); setFieldErrors({...fieldErrors, gender: null}); }}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${fieldErrors.gender ? '#EF4444' : 'var(--border-light)'}`, fontSize: '0.875rem' }}>
                  <option disabled>Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
                {fieldErrors.gender && <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>{fieldErrors.gender}</div>}
              </div>
            </div>

            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '16px' }}>Professional Information</h3>
            <div className="mb-8">
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Designation *</label>
              <input 
                type="text" 
                placeholder="Enter designation, role" 
                value={formData.designation}
                onChange={(e) => { setFormData({...formData, designation: e.target.value}); setFieldErrors({...fieldErrors, designation: null}); }}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${fieldErrors.designation ? '#EF4444' : 'var(--border-light)'}`, fontSize: '0.875rem' }} 
              />
              {fieldErrors.designation && <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>{fieldErrors.designation}</div>}
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={closeModal} className="btn btn-outline" style={{ background: 'white', padding: '10px 24px' }}>Cancel</button>
              <button onClick={handleSave} className="btn btn-primary" style={{ padding: '10px 24px' }}>
                {editingTeacher ? 'Update Teacher' : 'Save Teacher'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
