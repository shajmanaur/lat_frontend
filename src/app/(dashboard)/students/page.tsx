'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, RotateCcw, Plus, Upload, MoreVertical, Edit, Download, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function StudentList() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [uploadState, setUploadState] = useState<'empty' | 'uploading' | 'success' | 'error'>('empty');

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All Grades');
  const [sectionFilter, setSectionFilter] = useState('All Sections');
  const [gradeOptions, setGradeOptions] = useState<any[]>([]);
  const [sectionOptions, setSectionOptions] = useState<any[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Form State
  const [formData, setFormData] = useState({
    student_id: null as number | null,
    full_name: '',
    apaar_id: '',
    gender: '',
    grade: '',
    section: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGrades();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [page]);

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
      let fetchedGrades = [];
      if (res.data?.response?.data) fetchedGrades = res.data.response.data;
      else if (res.data?.data) fetchedGrades = res.data.data;
      
      // Filter to Grade 3, 6, 9 as requested
      const allowedGrades = ['Grade 3', 'Grade 6', 'Grade 9', 'III', 'VI', 'IX', '3', '6', '9'];
      setGradeOptions(fetchedGrades.filter((g: any) => allowedGrades.includes(g.grade_name)));
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
      if (res.data?.response?.data) setSectionOptions(res.data.response.data);
      else if (res.data?.data) setSectionOptions(res.data.data);
    } catch (err) {
      console.error('Failed to fetch sections', err);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      const res = await axios.get(`${apiUrl}/students?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.response) {
        const payload = res.data.response.data || res.data.response;
        setStudents(payload.data || payload || []);
        if (res.data.response.meta) {
          setTotal(res.data.response.meta.total);
        } else if (payload.meta) {
          setTotal(payload.meta.total);
        }
      }
    } catch (err) {
      console.error('Failed to fetch students', err);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrEditStudent = async () => {
    if (!formData.full_name || !formData.gender || !formData.grade || !formData.section) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      
      if (formData.student_id) {
        // Edit mode
        await axios.put(`${apiUrl}/students/${formData.student_id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Student updated successfully');
      } else {
        // Create mode
        await axios.post(`${apiUrl}/students`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Student created successfully');
      }

      setShowAddModal(false);
      setFormData({ student_id: null, full_name: '', apaar_id: '', gender: '', grade: '', section: '' });
      fetchStudents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to save student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (student: any) => {
    setFormData({
      student_id: student.student_id,
      full_name: student.full_name,
      apaar_id: student.apaar_id || '',
      gender: student.gender === 'm' ? 'Male' : student.gender === 'f' ? 'Female' : 'Other',
      grade: student.grade,
      section: student.section
    });
    setShowAddModal(true);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = !searchQuery || s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || (s.apaar_id && s.apaar_id.includes(searchQuery));
    const matchesGrade = gradeFilter === 'All Grades' || s.grade === gradeFilter;
    const matchesSection = sectionFilter === 'All Sections' || s.section === sectionFilter;
    return matchesSearch && matchesGrade && matchesSection;
  });

  return (
    <div className="flex flex-col gap-6 relative">
      
      <Toaster position="top-right" />
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Student List</h1>
          <p className="text-muted text-sm mt-1">Manage and view all registered students in your school.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowBulkUploadModal(true)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white' }}>
            <Upload size={16} />
            Bulk Upload
          </button>
          <button onClick={() => {
            setFormData({ student_id: null, full_name: '', apaar_id: '', gender: '', grade: '', section: '' });
            setShowAddModal(true);
          }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}>
            <Plus size={16} />
            Add Student
          </button>
        </div>
      </div>

      {/* Filters and Table */}
      <div className="card" style={{ borderRadius: '20px', boxShadow: 'var(--shadow-card)', padding: '24px' }}>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search size={16} className="text-muted absolute left-3 top-3" />
            <input 
              type="text" 
              placeholder="Search by student name or APAAR ID" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '0.875rem' }} 
            />
          </div>
          <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '0.875rem', minWidth: '150px' }}>
            <option>All Grades</option>
            {gradeOptions.map(g => <option key={g.grade_id} value={g.grade_name}>{g.grade_name}</option>)}
          </select>
          <select disabled={gradeFilter === 'All Grades'} value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '0.875rem', minWidth: '150px' }}>
            <option>All Sections</option>
            {sectionOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          
          <button onClick={() => { setSearchQuery(''); setGradeFilter('All Grades'); }} className="btn btn-outline text-muted" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', borderRadius: '12px' }}>
            <RotateCcw size={16} /> Reset
          </button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(76,53,230,0.1)', color: '#4C35E6', border: '1px solid rgba(76,53,230,0.2)', borderRadius: '12px' }}>
            <Filter size={16} /> Filters
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', color: 'var(--text-muted)' }}>
                <th style={{ textAlign: 'left', padding: '16px 12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>S.No.</th>
                <th style={{ textAlign: 'left', padding: '16px 12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>Student Name</th>
                <th style={{ textAlign: 'left', padding: '16px 12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>APAAR ID</th>
                <th style={{ textAlign: 'left', padding: '16px 12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>Gender</th>
                <th style={{ textAlign: 'left', padding: '16px 12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>Grade</th>
                <th style={{ textAlign: 'left', padding: '16px 12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>Section</th>
                <th style={{ textAlign: 'center', padding: '16px 12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>Loading students...</td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>No students found.</td></tr>
              ) : (
                filteredStudents.map((s, idx) => (
                  <tr key={s.student_id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'all 0.2s ease' }} className="hover:bg-slate-50">
                    <td style={{ padding: '20px 12px' }}>{(page - 1) * limit + idx + 1}</td>
                    <td style={{ padding: '20px 12px', fontWeight: 600 }}>
                      <div className="flex items-center gap-3">
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(76,53,230,0.1)', color: '#4C35E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          {s.full_name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        {s.full_name}
                      </div>
                    </td>
                    <td style={{ padding: '20px 12px', color: 'var(--text-muted)' }}>{s.apaar_id || '-'}</td>
                    <td style={{ padding: '20px 12px', color: 'var(--text-muted)' }}>
                      <span style={{ padding: '4px 10px', background: '#F1F5F9', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500 }}>
                        {s.gender === 'm' ? 'Male' : s.gender === 'f' ? 'Female' : 'Other'}
                      </span>
                    </td>
                    <td style={{ padding: '20px 12px', color: 'var(--text-muted)' }}>{s.grade}</td>
                    <td style={{ padding: '20px 12px', color: 'var(--text-muted)' }}>{s.section}</td>
                    <td style={{ padding: '20px 12px', textAlign: 'center' }}>
                      <div className="flex items-center justify-center gap-4 text-muted">
                        <button onClick={() => handleEditClick(s)}><Edit size={16} className="hover:text-primary-purple cursor-pointer transition-colors" /></button>
                        <button><MoreVertical size={16} className="cursor-pointer hover:text-text-dark transition-colors" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && (
          <div className="flex justify-between items-center mt-6 text-sm text-muted">
            <div>Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} students</div>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ padding: '6px 12px', border: '1px solid var(--border-light)', borderRadius: '8px', opacity: page === 1 ? 0.5 : 1 }}>Previous</button>
              <button style={{ padding: '6px 12px', background: '#4C35E6', color: 'white', borderRadius: '8px', fontWeight: 600 }}>{page}</button>
              <button disabled={page * limit >= total} onClick={() => setPage(page + 1)} style={{ padding: '6px 12px', border: '1px solid var(--border-light)', borderRadius: '8px', opacity: page * limit >= total ? 0.5 : 1 }}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(17,24,39,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '24px', width: '600px', boxShadow: '0 20px 50px rgba(17,24,39,0.12)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px' }}>
              {formData.student_id ? 'Edit Student' : 'Add Student'}
            </h2>
            
            <div className="grid grid-cols-2 gap-5 mb-8">
              <div className="col-span-2">
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-dark)', marginBottom: '8px' }}>Student Name *</label>
                <input type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="Enter full name" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '0.875rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-dark)', marginBottom: '8px' }}>APAAR ID <span className="text-muted font-normal text-xs">(Optional)</span></label>
                <input type="text" value={formData.apaar_id} onChange={e => setFormData({...formData, apaar_id: e.target.value})} placeholder="Enter APAAR ID" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '0.875rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-dark)', marginBottom: '8px' }}>Gender *</label>
                <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '0.875rem', backgroundColor: 'white' }}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-dark)', marginBottom: '8px' }}>Grade *</label>
                <select value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '0.875rem', backgroundColor: 'white' }}>
                  <option value="">Select Grade</option>
                  {gradeOptions.map(g => <option key={g.grade_id} value={g.grade_name}>{g.grade_name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-dark)', marginBottom: '8px' }}>Section *</label>
                <input type="text" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value.toUpperCase()})} placeholder="e.g. A" maxLength={2} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '0.875rem' }} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--border-light)' }}>
              <button onClick={() => setShowAddModal(false)} className="btn btn-outline" style={{ background: 'white', padding: '12px 24px', borderRadius: '12px' }}>Cancel</button>
              <button onClick={handleAddOrEditStudent} disabled={submitting} className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: '12px', opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Saving...' : (formData.student_id ? 'Update Student' : 'Save Student')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(17,24,39,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '24px', width: '600px', boxShadow: '0 20px 50px rgba(17,24,39,0.12)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Bulk Upload Students</h2>
            <p className="text-muted text-sm mb-6">Download the template, fill in student details, and upload the Excel file.</p>
            
            {uploadState === 'empty' && (
              <>
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="flex items-center gap-3">
                    <div style={{ background: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                      <Download size={20} className="text-primary-purple" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Student Template.xlsx</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Standard format for bulk upload</div>
                    </div>
                  </div>
                  <button className="text-primary-purple font-semibold text-sm hover:underline">Download Template</button>
                </div>

                <div 
                  onClick={() => setUploadState('uploading')}
                  style={{ 
                    border: '2px dashed var(--border-light)', 
                    borderRadius: '16px', 
                    padding: '48px 24px', 
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: 'white'
                  }}
                  className="hover:border-primary-purple hover:bg-purple-50/30"
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Upload size={24} className="text-muted" />
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>Click or drag file to upload</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supports .xlsx up to 10MB</div>
                </div>
              </>
            )}

            {uploadState === 'uploading' && (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTopColor: 'var(--primary-purple)', borderRadius: '50%', margin: '0 auto 16px' }}></div>
                <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>Processing file...</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Validating 142 records</div>
                
                <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '4px', marginTop: '24px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '65%', background: 'var(--primary-purple)', borderRadius: '4px', transition: 'width 0.3s ease' }}></div>
                </div>
                
                <button onClick={() => setUploadState('success')} className="mt-8 text-sm text-primary-purple">(Simulate Success)</button>
                <button onClick={() => setUploadState('error')} className="mt-2 ml-4 text-sm text-red-500">(Simulate Error)</button>
              </div>
            )}

            {uploadState === 'success' && (
              <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#D1FAE5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle size={32} />
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Upload Successful</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>142 students have been successfully registered.</div>
              </div>
            )}

            {uploadState === 'error' && (
              <div style={{ padding: '32px 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <AlertCircle size={32} />
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Validation Failed</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>12 records contain errors. Please download the error file, fix the issues, and re-upload.</div>
                </div>
                
                <div style={{ padding: '16px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="flex items-center gap-3 text-red-700">
                    <Download size={20} />
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Download Error Log.xlsx</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 mt-6" style={{ borderTop: '1px solid var(--border-light)' }}>
              <button 
                onClick={() => { setShowBulkUploadModal(false); setTimeout(() => setUploadState('empty'), 300); }} 
                className="btn btn-outline" 
                style={{ background: 'white', padding: '12px 24px', borderRadius: '12px' }}
              >
                {uploadState === 'success' ? 'Close' : 'Cancel'}
              </button>
              
              {uploadState === 'error' && (
                <button onClick={() => setUploadState('empty')} className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: '12px' }}>
                  Re-upload File
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
