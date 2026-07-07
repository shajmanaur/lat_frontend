'use client';

import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Clock, Layers, Search, Filter, RotateCcw, Plus, Edit, MoreVertical, LayoutGrid, CheckSquare, Square } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function TeacherAllocation() {
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, gradesCovered: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All Grades');
  const [sectionFilter, setSectionFilter] = useState('All Sections');

  // Dynamic Options
  const [gradeOptions, setGradeOptions] = useState<any[]>([]);
  const [sectionOptions, setSectionOptions] = useState<any[]>([]);

  // Modal State
  const [modalStep, setModalStep] = useState(1);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [modalSectionOptions, setModalSectionOptions] = useState<string[]>([]);
  const [modalSearch, setModalSearch] = useState('');
  const [allocating, setAllocating] = useState(false);

  useEffect(() => {
    fetchAllocations();
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

  useEffect(() => {
    if (selectedGrade) {
      const fetchModalSections = async () => {
        try {
          const token = localStorage.getItem('token');
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
          const res = await axios.get(`${apiUrl}/teachers/meta/sections?grade=${selectedGrade}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data?.response?.data) {
            setModalSectionOptions(res.data.response.data);
          } else if (res.data?.data) {
            setModalSectionOptions(res.data.data);
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchModalSections();
    } else {
      setModalSectionOptions([]);
    }
  }, [selectedGrade]);

  const fetchAllocations = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      const res = await axios.get(`${apiUrl}/teachers/allocations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.response) {
        const payload = res.data.response.data || res.data.response;
        setAllocations(payload.allocations || []);
        setStats(payload.stats || { total: 0, active: 0, inactive: 0, gradesCovered: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch allocations', err);
      toast.error('Failed to load allocations');
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      const res = await axios.get(`${apiUrl}/teachers/meta/grades`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.response?.data) {
        setGradeOptions(res.data.response.data);
      } else if (res.data?.data) {
        setGradeOptions(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch grades', err);
    }
  };

  const fetchSections = async (grade: string) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      const res = await axios.get(`${apiUrl}/teachers/meta/sections?grade=${grade}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.response?.data) {
        setSectionOptions(res.data.response.data);
      } else if (res.data?.data) {
        setSectionOptions(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch sections', err);
    }
  };

  const filteredAllocations = allocations.filter(a => {
    const matchesSearch = !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check if the teacher has any allocation matching the grade/section filters
    const matchesGrade = gradeFilter === 'All Grades' || a.allocations.some((alloc: any) => alloc.grade === gradeFilter);
    const matchesSection = sectionFilter === 'All Sections' || a.allocations.some((alloc: any) => alloc.section === sectionFilter);
    
    return matchesSearch && matchesGrade && matchesSection;
  });

  const handleAllocate = async () => {
    if (!selectedTeacherId || !selectedGrade || !selectedSection) {
      toast.error('Please select teacher, grade and section');
      return;
    }
    setAllocating(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      await axios.post(`${apiUrl}/teachers/allocations`, {
        teacher_id: selectedTeacherId,
        grade: selectedGrade,
        section: selectedSection
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Teacher allocated successfully');
      setShowAllocateModal(false);
      setModalStep(1);
      setSelectedTeacherId(null);
      setSelectedGrade('');
      setSelectedSection('');
      fetchAllocations();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to allocate teacher');
    } finally {
      setAllocating(false);
    }
  };

  const getSelectedTeacher = () => allocations.find(a => a.id === selectedTeacherId);

  return (
    <div className="flex flex-col gap-6 relative">
      
      {/* Header Section */}
      <Toaster position="top-right" />
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
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.total}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Across all grades</div>
          </div>
        </div>

        <div className="card flex items-center gap-4 py-4">
          <div style={{ color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '10px', borderRadius: '50%' }}>
            <UserCheck size={20} />
          </div>
          <div>
            <div className="text-sm font-medium text-muted">Active Allocations</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.active}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Currently teaching</div>
          </div>
        </div>

        <div className="card flex items-center gap-4 py-4">
          <div style={{ color: '#F59E0B', background: 'rgba(245,158,11,0.1)', padding: '10px', borderRadius: '50%' }}>
            <Clock size={20} />
          </div>
          <div>
            <div className="text-sm font-medium text-muted">Inactive Allocations</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.inactive}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Teachers inactive</div>
          </div>
        </div>

        <div className="card flex items-center gap-4 py-4">
          <div style={{ color: '#3B82F6', background: 'rgba(59,130,246,0.1)', padding: '10px', borderRadius: '50%' }}>
            <Layers size={20} />
          </div>
          <div>
            <div className="text-sm font-medium text-muted">Grades Covered</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.gradesCovered}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unique grades</div>
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
              placeholder="Search by teacher name" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.875rem' }} 
            />
          </div>
          <select 
            value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.875rem', minWidth: '130px' }}>
            <option>All Grades</option>
            {gradeOptions.map((g: any) => <option key={g.grade_id} value={g.grade_name}>{g.grade_name}</option>)}
          </select>
          <select 
            value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.875rem', minWidth: '130px' }}
            disabled={gradeFilter === 'All Grades'}>
            <option>All Sections</option>
            {sectionOptions.map((s: string) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.875rem', minWidth: '150px' }}>
            <option>Academic Year: 2025-26</option>
          </select>
          
          <button onClick={() => { setSearchQuery(''); setGradeFilter('All Grades'); }} className="btn btn-outline text-muted" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white' }}>
            <RotateCcw size={16} /> Reset
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
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>Loading allocations...</td></tr>
              ) : filteredAllocations.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>No allocations found.</td></tr>
              ) : (
                filteredAllocations.map((a, idx) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '16px 12px' }}>{idx + 1}</td>
                    <td style={{ padding: '16px 12px', fontWeight: 600 }}>
                      <div className="flex items-center gap-2">
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(76,53,230,0.1)', color: '#4C35E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          {a.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        {a.name}
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <div className="flex flex-wrap gap-2">
                        {a.allocations.map((alloc: any, i: number) => (
                          <span key={i} style={{ padding: '4px 8px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '4px', fontSize: '0.75rem', color: '#4C35E6', fontWeight: 500 }}>
                            {alloc.grade} - {alloc.section}
                          </span>
                        ))}
                        {a.allocations.length === 0 && <span className="text-muted italic">Unassigned</span>}
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
                        <button 
                          onClick={() => {
                            setSelectedTeacherId(a.id);
                            if (a.allocations && a.allocations.length > 0) {
                              setSelectedGrade(a.allocations[0].grade);
                              setSelectedSection(a.allocations[0].section);
                            } else {
                              setSelectedGrade('');
                              setSelectedSection('');
                            }
                            setModalStep(2);
                            setShowAllocateModal(true);
                          }}
                        >
                          <Edit size={16} className="hover:text-primary-purple cursor-pointer" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
               <div className="flex items-center gap-2" style={{ color: modalStep >= 1 ? '#4C35E6' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: modalStep >= 1 ? '#4C35E6' : '#E2E8F0', color: modalStep >= 1 ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>1</div>
                  Select Teacher
               </div>
               <div style={{ flex: 1, height: '1px', background: 'var(--border-light)', margin: '0 16px' }}></div>
               <div className="flex items-center gap-2" style={{ color: modalStep >= 2 ? '#4C35E6' : 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: modalStep >= 2 ? '#4C35E6' : '#E2E8F0', color: modalStep >= 2 ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>2</div>
                  Select Grade & Section
               </div>
               <div style={{ flex: 1, height: '1px', background: 'var(--border-light)', margin: '0 16px' }}></div>
               <div className="flex items-center gap-2" style={{ color: modalStep >= 3 ? '#4C35E6' : 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: modalStep >= 3 ? '#4C35E6' : '#E2E8F0', color: modalStep >= 3 ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>3</div>
                  Review & Confirm
               </div>
            </div>

            {modalStep === 1 && (
              <div className="mb-4">
                 <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>1. Select Teacher</h3>
                 <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Choose a teacher to allocate to grade and section.</p>
                 
                 <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Teacher *</label>
                 <div className="relative mb-4">
                    <Search size={16} className="text-muted absolute left-3 top-3" />
                    <input 
                      type="text" 
                      placeholder="Search by teacher name" 
                      value={modalSearch}
                      onChange={(e) => setModalSearch(e.target.value)}
                      style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.875rem' }} 
                    />
                 </div>

                 <div style={{ maxHeight: '200px', overflowY: 'auto' }} className="flex flex-col gap-2">
                    {allocations.filter(t => t.name.toLowerCase().includes(modalSearch.toLowerCase())).map(t => (
                      <div 
                        key={t.id}
                        onClick={() => setSelectedTeacherId(t.id)}
                        style={{ border: `1px solid ${selectedTeacherId === t.id ? 'var(--primary-purple)' : 'var(--border-light)'}`, borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: selectedTeacherId === t.id ? 'rgba(76,53,230,0.05)' : '#fff', cursor: 'pointer' }}
                      >
                         <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(76,53,230,0.1)', color: '#4C35E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem' }}>
                            {t.name.split(' ').map((n: string) => n[0]).join('')}
                         </div>
                         <div className="flex-1">
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.role}</div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {modalStep === 2 && (
              <div className="mb-4">
                 <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>2. Select Grade & Section</h3>
                 <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Assign the selected teacher to a class.</p>
                 
                 <div className="flex gap-4">
                    <div className="flex-1">
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Grade *</label>
                      <select 
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.875rem' }}
                      >
                        <option value="">Select Grade</option>
                        {gradeOptions.map((g: any) => <option key={g.grade_id} value={g.grade_name}>{g.grade_name}</option>)}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Section *</label>
                      <select 
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        disabled={!selectedGrade || modalSectionOptions.length === 0}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.875rem' }}
                      >
                        <option value="">Select Section</option>
                        {modalSectionOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                 </div>
              </div>
            )}

            {modalStep === 3 && getSelectedTeacher() && (
              <div className="mb-4">
                 <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>3. Review & Confirm</h3>
                 <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Confirm the allocation details before saving.</p>
                 
                 <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                   <div className="mb-3">
                     <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Teacher</span>
                     <div style={{ fontWeight: 600 }}>{getSelectedTeacher()?.name}</div>
                   </div>
                   <div className="flex gap-12">
                     <div>
                       <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Grade</span>
                       <div style={{ fontWeight: 600 }}>{selectedGrade}</div>
                     </div>
                     <div>
                       <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Section</span>
                       <div style={{ fontWeight: 600 }}>{selectedSection}</div>
                     </div>
                   </div>
                 </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-8">
              {modalStep > 1 && (
                <button onClick={() => setModalStep(modalStep - 1)} className="btn btn-outline" style={{ background: 'white', padding: '10px 24px' }}>Back</button>
              )}
              <button 
                onClick={() => {
                  setShowAllocateModal(false);
                  setModalStep(1);
                  setSelectedTeacherId(null);
                  setSelectedGrade('');
                  setSelectedSection('');
                }} 
                className="btn btn-outline" 
                style={{ background: 'white', padding: '10px 24px' }}
              >
                Cancel
              </button>
              
              {modalStep < 3 ? (
                <button 
                  onClick={() => setModalStep(modalStep + 1)} 
                  disabled={modalStep === 1 ? !selectedTeacherId : (!selectedGrade || !selectedSection)}
                  className="btn btn-primary" 
                  style={{ padding: '10px 24px', opacity: (modalStep === 1 && !selectedTeacherId) || (modalStep === 2 && (!selectedGrade || !selectedSection)) ? 0.5 : 1 }}
                >
                  Next Step
                </button>
              ) : (
                <button 
                  onClick={handleAllocate}
                  disabled={allocating}
                  className="btn btn-primary" 
                  style={{ padding: '10px 24px', opacity: allocating ? 0.7 : 1 }}
                >
                  {allocating ? 'Saving...' : 'Confirm Allocation'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
