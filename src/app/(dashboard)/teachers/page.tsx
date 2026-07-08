'use client';

import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Clock, Building, Search, Filter, RotateCcw, Plus, Edit, MoreVertical, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatGradeName } from '@/services/api';
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
  });

  useEffect(() => {
    fetchTeachers();
    fetchGrades();
  }, []);

  useEffect(() => {
    if (gradeFilter !== 'All Grades') {
      fetchSections(gradeFilter);
    } else {
      setSectionOptions([]);
      setSectionFilter('All Sections');
    }
  }, [gradeFilter]);

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      const res = await axios.get(`${apiUrl}/teachers/meta/grades`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data?.response?.data || res.data?.data || [];
      setGradeOptions(data.map((g: any) => ({
        ...g,
        displayName: formatGradeName(`Grade ${g.grade_name}`),
      })));
    } catch (err) {
      console.error('Failed to fetch grades', err);
    }
  };

  const fetchSections = async (grade: string) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      // Send raw grade name (e.g. "III") to the API, not "Grade III"
      const rawGrade = grade.replace(/^Grade\s+/, '');
      const res = await axios.get(`${apiUrl}/teachers/meta/sections?grade=${rawGrade}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data?.response?.data || res.data?.data || [];
      setSectionOptions(data);
    } catch (err) {
      console.error('Failed to fetch sections', err);
    }
  };

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
    setFormData({ name: '', email: '', mobile: '' });
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
        <button onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', background: '#4C35E6', color: 'white', border: 'none', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <Plus size={16} />
          Add Teacher
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-4" style={{ gap: '16px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '14px 16px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-3">
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '10px', 
              background: 'rgba(99, 102, 241, 0.1)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Users size={20} color="#6366F1" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500, marginBottom: '2px' }}>Total Teachers</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B', lineHeight: 1 }}>{loading ? '-' : stats.total}</div>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '14px 16px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-3">
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '10px', 
              background: 'rgba(16, 185, 129, 0.1)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <UserCheck size={20} color="#10B981" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500, marginBottom: '2px' }}>Active Teachers</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B', lineHeight: 1 }}>{loading ? '-' : stats.active}</div>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '14px 16px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-3">
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '10px', 
              background: 'rgba(245, 158, 11, 0.1)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Clock size={20} color="#F59E0B" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500, marginBottom: '2px' }}>Inactive Teachers</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B', lineHeight: 1 }}>{loading ? '-' : stats.inactive}</div>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '14px 16px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-3">
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '10px', 
              background: 'rgba(59, 130, 246, 0.1)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Building size={20} color="#3B82F6" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500, marginBottom: '2px' }}>Unassigned Teachers</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B', lineHeight: 1 }}>{loading ? '-' : stats.unassigned}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Table */}
      <div className="card">
        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'nowrap', marginBottom: '24px' }}>
          <div style={{ position: 'relative', minWidth: '280px', maxWidth: '320px', flexShrink: 0 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input 
              type="text" 
              placeholder="Search by name, email or mobile" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', outline: 'none', color: '#1E293B', height: '40px', boxSizing: 'border-box' }} 
            />
          </div>
          <select 
            value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}
            style={{ padding: '0 32px 0 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', minWidth: '140px', color: '#1E293B', background: 'white', cursor: 'pointer', outline: 'none', height: '40px', boxSizing: 'border-box', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
            <option>All Grades</option>
            {gradeOptions.map((g: any) => <option key={g.grade_id} value={g.displayName}>{g.displayName}</option>)}
          </select>
          <select 
            value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}
            style={{ padding: '0 32px 0 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', minWidth: '140px', color: gradeFilter === 'All Grades' ? '#94A3B8' : '#1E293B', background: 'white', cursor: 'pointer', outline: 'none', height: '40px', boxSizing: 'border-box', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
            disabled={gradeFilter === 'All Grades'}>
            <option>All Sections</option>
            {sectionOptions.map((s: string) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select 
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0 32px 0 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', minWidth: '140px', color: '#1E293B', background: 'white', cursor: 'pointer', outline: 'none', height: '40px', boxSizing: 'border-box', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          
          {(searchQuery || gradeFilter !== 'All Grades' || sectionFilter !== 'All Sections' || statusFilter !== 'All Status') && (
            <button onClick={handleResetFilters} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', padding: '0 16px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', cursor: 'pointer', color: '#64748B', whiteSpace: 'nowrap', flexShrink: 0, height: '40px', boxSizing: 'border-box' }}>
              <RotateCcw size={14} /> Reset
            </button>
          )}
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', padding: '0 16px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', cursor: 'pointer', color: '#4C35E6', whiteSpace: 'nowrap', flexShrink: 0, height: '40px', boxSizing: 'border-box' }}>
            <Filter size={14} /> Filters
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', minHeight: '300px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', color: '#64748B' }}>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 500, borderBottom: '1px solid #F1F5F9', fontSize: '0.8rem' }}>S.No.</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 500, borderBottom: '1px solid #F1F5F9', fontSize: '0.8rem' }}>Teacher Name</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 500, borderBottom: '1px solid #F1F5F9', fontSize: '0.8rem' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 500, borderBottom: '1px solid #F1F5F9', fontSize: '0.8rem' }}>Mobile Number</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 500, borderBottom: '1px solid #F1F5F9', fontSize: '0.8rem' }}>Grade</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 500, borderBottom: '1px solid #F1F5F9', fontSize: '0.8rem' }}>Section</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 500, borderBottom: '1px solid #F1F5F9', fontSize: '0.8rem' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 500, borderBottom: '1px solid #F1F5F9', fontSize: '0.8rem' }}>Assigned On</th>
                <th style={{ textAlign: 'center', padding: '14px 16px', fontWeight: 500, borderBottom: '1px solid #F1F5F9', fontSize: '0.8rem' }}>Actions</th>
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
                  <tr key={t.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }} className="hover:bg-slate-50">
                    <td style={{ padding: '16px', color: '#64748B' }}>{idx + 1}</td>
                    <td style={{ padding: '16px', fontWeight: 500, color: '#1E293B' }}>
                      <div className="flex items-center gap-3">
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(76,53,230,0.1)', color: '#4C35E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>
                          {t.name?.split(' ').map((n: string) => n[0]).join('').substring(0,2) || 'T'}
                        </div>
                        {t.name}
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#64748B' }}>{t.email}</td>
                    <td style={{ padding: '16px', color: '#64748B' }}>{t.mobile}</td>
                    <td style={{ padding: '16px', color: '#64748B' }}>{formatGradeName(t.grade)}</td>
                    <td style={{ padding: '16px', color: '#64748B' }}>{t.section}</td>
                    <td style={{ padding: '16px' }}>
                      <div 
                        onClick={() => handleToggleStatus(t.id)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none',
                        }}
                      >
                        <div style={{
                          width: '36px', height: '20px', borderRadius: '12px', position: 'relative', transition: 'background 0.2s',
                          background: t.status === 'Active' ? '#10B981' : '#E2E8F0',
                        }}>
                          <div style={{
                            width: '16px', height: '16px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', transition: 'left 0.2s',
                            left: t.status === 'Active' ? '18px' : '2px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: t.status === 'Active' ? '#10B981' : '#94A3B8', fontWeight: 500 }}>
                          {t.status}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#64748B' }}>{t.assignedOn}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => openEditModal(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}><Edit size={16} /></button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}><MoreVertical size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-6" style={{ fontSize: '0.85rem', color: '#64748B' }}>
          <div>Showing 1 to {Math.min(10, filteredTeachers.length)} of {filteredTeachers.length} teachers</div>
          <div className="flex items-center gap-1">
            <button style={{ padding: '6px 10px', border: '1px solid #E2E8F0', borderRadius: '6px', background: 'white', cursor: 'pointer', color: '#64748B' }}><ChevronLeft size={14} /></button>
            <button style={{ padding: '6px 12px', background: '#4C35E6', color: 'white', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}>1</button>
            <button style={{ padding: '6px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', background: 'white', cursor: 'pointer', color: '#64748B', fontSize: '0.8rem' }}>2</button>
            <button style={{ padding: '6px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', background: 'white', cursor: 'pointer', color: '#64748B', fontSize: '0.8rem' }}>3</button>
            <button style={{ padding: '6px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', background: 'white', cursor: 'pointer', color: '#64748B', fontSize: '0.8rem' }}>4</button>
            <button style={{ padding: '6px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', background: 'white', cursor: 'pointer', color: '#64748B', fontSize: '0.8rem' }}>5</button>
            <button style={{ padding: '6px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', background: 'white', cursor: 'pointer', color: '#64748B', fontSize: '0.8rem' }}>...</button>
            <button style={{ padding: '6px 10px', border: '1px solid #E2E8F0', borderRadius: '6px', background: 'white', cursor: 'pointer', color: '#64748B' }}><ChevronRight size={14} /></button>
            <select style={{ marginLeft: '12px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.8rem', color: '#64748B', background: 'white', cursor: 'pointer' }}>
              <option>10 / page</option>
              <option>25 / page</option>
              <option>50 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add/Edit Teacher Modal Overlay */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '600px', maxHeight: '90vh', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>{editingTeacher ? 'Edit Teacher' : 'Add Teacher'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {globalError && <div style={{ padding: '10px', background: '#FEE2E2', color: '#B91C1C', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>{globalError}</div>}
              {successMsg && <div style={{ padding: '10px', background: '#DCFCE7', color: '#15803D', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>{successMsg}</div>}
              
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B', marginBottom: '16px' }}>Personal Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '6px', fontWeight: 500 }}>Full Name *</label>
                  <input 
                    type="text" 
                    placeholder="Enter full name" 
                    value={formData.name}
                    onChange={(e) => { setFormData({...formData, name: e.target.value}); setFieldErrors({...fieldErrors, name: null}); }}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: `1px solid ${fieldErrors.name ? '#EF4444' : '#E2E8F0'}`, fontSize: '0.875rem', outline: 'none' }} 
                  />
                  {fieldErrors.name && <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>{fieldErrors.name}</div>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '6px', fontWeight: 500 }}>Email Address *</label>
                  <input 
                    type="email" 
                    placeholder="Enter email address" 
                    value={formData.email}
                    onChange={(e) => { setFormData({...formData, email: e.target.value}); setFieldErrors({...fieldErrors, email: null}); }}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: `1px solid ${fieldErrors.email ? '#EF4444' : '#E2E8F0'}`, fontSize: '0.875rem', outline: 'none' }} 
                  />
                  {fieldErrors.email && <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>{fieldErrors.email}</div>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '6px', fontWeight: 500 }}>Mobile Number *</label>
                  <div style={{ display: 'flex' }}>
                    <select style={{ padding: '10px 12px', borderRadius: '10px 0 0 10px', border: `1px solid ${fieldErrors.mobile ? '#EF4444' : '#E2E8F0'}`, borderRight: 'none', fontSize: '0.875rem', background: '#F8FAFC', outline: 'none', cursor: 'pointer' }}>
                      <option>+91</option>
                    </select>
                    <input 
                      type="text" 
                      placeholder="Enter mobile number" 
                      value={formData.mobile}
                      onChange={(e) => { setFormData({...formData, mobile: e.target.value}); setFieldErrors({...fieldErrors, mobile: null}); }}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '0 10px 10px 0', border: `1px solid ${fieldErrors.mobile ? '#EF4444' : '#E2E8F0'}`, fontSize: '0.875rem', outline: 'none' }} 
                    />
                  </div>
                  {fieldErrors.mobile && <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>{fieldErrors.mobile}</div>}
                </div>
              </div>
            </div>
            
            {/* Fixed Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={closeModal} style={{ padding: '10px 24px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', color: '#64748B' }}>Cancel</button>
              <button onClick={handleSave} style={{ padding: '10px 24px', borderRadius: '10px', background: '#6366F1', color: 'white', fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                {editingTeacher ? 'Update Teacher' : 'Save Teacher'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
