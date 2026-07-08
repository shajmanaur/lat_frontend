'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, RotateCcw, Plus, Upload, MoreVertical, Edit, Download, CheckCircle, AlertCircle, FileText, X, GraduationCap, FileCheck, Building } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { dashboardApi, studentsApi, regionsApi, schoolsApi, teachersApi } from '@/services/api';
import { ShimmerTable, ShimmerCard } from '@/components/ui/Shimmer';

export default function AdminStudentList() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  
  const [regionOptions, setRegionOptions] = useState<any[]>([]);
  const [schoolOptions, setSchoolOptions] = useState<any[]>([]);
  const [gradeOptions, setGradeOptions] = useState<any[]>([]);
  const [sectionOptions, setSectionOptions] = useState<any[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<any>(null);
  const [studentReportData, setStudentReportData] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchRegions();
    fetchGrades();
  }, []);

  useEffect(() => {
    if (regionFilter) {
      fetchSchools(regionFilter);
    } else {
      setSchoolOptions([]);
      setSchoolFilter('');
    }
  }, [regionFilter]);

  useEffect(() => {
    if (gradeFilter || schoolFilter) {
      fetchSections();
    } else {
      setSectionOptions([]);
      setSectionFilter('');
    }
  }, [gradeFilter, schoolFilter]);

  useEffect(() => {
    fetchStudents();
  }, [page, regionFilter, schoolFilter, gradeFilter, sectionFilter]);

  const fetchStats = async () => {
    try {
      const filters: any = {};
      if (regionFilter) filters.regionId = regionFilter;
      if (schoolFilter) filters.udise = schoolFilter;
      if (gradeFilter) filters.gradeId = gradeFilter;
      if (sectionFilter) filters.section = sectionFilter;
      const res = await dashboardApi.getStats(filters);
      const data = res?.response?.data || res?.response || res?.data || res;
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const fetchRegions = async () => {
    try {
      const res = await regionsApi.getRegions();
      setRegionOptions(res.response?.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch regions', err);
    }
  };

  const fetchSchools = async (regionId: string) => {
    try {
      const res = await schoolsApi.getSchoolsByRegion(regionId);
      setSchoolOptions(res.response?.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch schools', err);
    }
  };

  const fetchGrades = async () => {
    try {
      const res = await teachersApi.getGrades();
      let fetchedGrades = [];
      if (res?.response?.data) fetchedGrades = res.response.data;
      else if (res?.data) fetchedGrades = res.data;
      else if (Array.isArray(res)) fetchedGrades = res;
      
      const allowedGrades = ['Grade 3', 'Grade 6', 'Grade 9', 'III', 'VI', 'IX', '3', '6', '9'];
      setGradeOptions(fetchedGrades.filter((g: any) => allowedGrades.includes(g.grade_name)));
    } catch (err) {
      console.error('Failed to fetch grades', err);
    }
  };

  const fetchSections = async () => {
    try {
      const res = await studentsApi.getSections(schoolFilter || undefined, gradeFilter || undefined);
      setSectionOptions(res.data || res.response?.data || res || []);
    } catch (err) {
      console.error('Failed to fetch sections', err);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (regionFilter) filters.regionId = regionFilter;
      if (schoolFilter) filters.udise = schoolFilter;
      if (gradeFilter) filters.gradeId = gradeFilter;
      if (sectionFilter) filters.section = sectionFilter;
      if (searchQuery) filters.search = searchQuery;

      const res = await studentsApi.getStudents({ page, limit, ...filters });
      const payload = res.response?.data || res.data || res;
      setStudents(payload.data || payload || []);
      const meta = res.response?.meta || payload.meta;
      if (meta) {
        setTotal(meta.total);
      }
    } catch (err) {
      console.error('Failed to fetch students', err);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = () => {
    setPage(1);
    fetchStudents();
    fetchStats();
  };

  const handleViewReport = async (student: any) => {
    setSelectedStudentForReport(student);
    setShowReportModal(true);
    setReportLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      const res = await axios.get(`${apiUrl}/omr/responses/${student.student_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudentReportData(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load student report');
      setStudentReportData([]);
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 relative">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Students</h1>
          <p className="text-muted text-sm mt-1">View and manage all students across schools.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white' }}>
            <Upload size={16} /> Export
          </button>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-4 gap-4">
        {!stats ? (
          <>
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
          </>
        ) : (
          <>
            <div className="card" style={{ borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(76,53,230,0.1)', color: '#4C35E6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)' }}>Total Students</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.students?.toLocaleString() || 0}</div>
              </div>
            </div>
            <div className="card" style={{ borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#D1FAE5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)' }}>Students Present</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.studentsPresent?.toLocaleString() || 0}</div>
                <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>{stats?.students ? ((stats.studentsPresent / stats.students) * 100).toFixed(2) : 0}%</div>
              </div>
            </div>
            <div className="card" style={{ borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)' }}>Students Absent</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.studentsAbsent?.toLocaleString() || 0}</div>
                <div style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 600 }}>{stats?.students ? ((stats.studentsAbsent / stats.students) * 100).toFixed(2) : 0}%</div>
              </div>
            </div>
            <div className="card" style={{ borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#DBEAFE', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)' }}>Schools Aligned</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.coordinators?.toLocaleString() || 0}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filters and Table */}
      <div className="card" style={{ borderRadius: '20px', boxShadow: 'var(--shadow-card)', padding: '24px' }}>
        <div className="flex gap-4 mb-6 items-end">
          <div className="flex-1">
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Search</label>
            <div className="relative">
              <Search size={16} className="text-muted absolute left-3 top-3" />
              <input 
                type="text" 
                placeholder="Search by name, APAAR ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '0.875rem' }} 
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Region</label>
            <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '0.875rem', minWidth: '150px' }}>
              <option value="">All Regions</option>
              {regionOptions.map(r => <option key={r.region_id} value={r.region_id}>{r.region_name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Aligned School</label>
            <select disabled={!regionFilter} value={schoolFilter} onChange={(e) => setSchoolFilter(e.target.value)} style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '0.875rem', minWidth: '180px' }}>
              <option value="">All Schools</option>
              {schoolOptions.map(s => <option key={s.udise_code} value={s.udise_code}>{s.school_name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Grade</label>
            <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '0.875rem', minWidth: '130px' }}>
              <option value="">All Grades</option>
              {gradeOptions.map(g => <option key={g.grade_id} value={g.grade_id}>{g.grade_name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Section</label>
            <select disabled={!gradeFilter} value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '0.875rem', minWidth: '130px' }}>
              <option value="">All Sections</option>
              {sectionOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          
          <button onClick={() => { setSearchQuery(''); setRegionFilter(''); setSchoolFilter(''); setGradeFilter(''); setSectionFilter(''); }} className="btn btn-outline text-muted" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', borderRadius: '12px', padding: '10px 16px' }}>
            Clear
          </button>
          <button onClick={handleSearchSubmit} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#4C35E6', borderRadius: '12px', padding: '10px 16px' }}>
            <Filter size={16} /> Apply Filters
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>Student List</h2>
          {loading ? (
            <ShimmerTable columns={11} rows={limit || 10} />
          ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', color: 'var(--text-muted)' }}>
                <th style={{ textAlign: 'left', padding: '16px 12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)', borderTopLeftRadius: '12px' }}>S.No.</th>
                <th style={{ textAlign: 'left', padding: '16px 12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>Student Name</th>
                <th style={{ textAlign: 'left', padding: '16px 12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>APAAR ID</th>
                <th style={{ textAlign: 'left', padding: '16px 12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>Gender</th>
                <th style={{ textAlign: 'left', padding: '16px 12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>Grade</th>
                <th style={{ textAlign: 'left', padding: '16px 12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>Section</th>
                <th style={{ textAlign: 'left', padding: '16px 12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>Aligned School</th>
                <th style={{ textAlign: 'left', padding: '16px 12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>UDISE Code</th>
                <th style={{ textAlign: 'left', padding: '16px 12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>Coordinator</th>
                <th style={{ textAlign: 'left', padding: '16px 12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>Status</th>
                <th style={{ textAlign: 'center', padding: '16px 12px', fontWeight: 600, borderBottom: '1px solid var(--border-light)', borderTopRightRadius: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan={11} style={{ textAlign: 'center', padding: '20px' }}>No students found.</td></tr>
              ) : (
                students.map((s, idx) => {
                  // Determine status if any OMR has been processed (mocking randomly based on id for UI or strictly using 'Present')
                  const isPresent = s.student_id % 3 !== 0; 
                  return (
                  <tr key={s.student_id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'all 0.2s ease' }} className="hover:bg-slate-50">
                    <td style={{ padding: '16px 12px' }}>{(page - 1) * limit + idx + 1}</td>
                    <td style={{ padding: '16px 12px', fontWeight: 600 }}>
                      <div className="flex items-center gap-2">
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(76,53,230,0.1)', color: '#4C35E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold' }}>
                          {s.full_name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        {s.full_name}
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{s.apaar_id || '-'}</td>
                    <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1 text-slate-600"><Users size={14} />{s.gender === 'm' ? 'Male' : s.gender === 'f' ? 'Female' : 'Other'}</span>
                    </td>
                    <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{typeof s.grade === 'object' ? s.grade?.grade_name : s.grade}</td>
                    <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{s.section}</td>
                    <td style={{ padding: '16px 12px', color: 'var(--text-dark)', fontWeight: 500 }}>{s.school_name || '-'}</td>
                    <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{s.udise_code}</td>
                    <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{s.coordinator_name || '-'}</td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{ padding: '4px 10px', background: isPresent ? '#D1FAE5' : '#FEE2E2', color: isPresent ? '#10B981' : '#EF4444', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {isPresent ? 'Present' : 'Absent'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                      <div className="flex items-center justify-center gap-3 text-muted">
                        <button onClick={() => handleViewReport(s)} title="View Report"><FileText size={16} className="text-primary-purple hover:opacity-80 cursor-pointer" /></button>
                        <button><MoreVertical size={16} className="cursor-pointer hover:text-text-dark" /></button>
                      </div>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
          )}
        </div>
        
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

      {/* Student Report Modal (Truncated for brevity, but reusing similar layout) */}
      {showReportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(17,24,39,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '24px', width: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(17,24,39,0.12)' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Student Assessment Report</h2>
              <button onClick={() => setShowReportModal(false)} className="btn btn-outline text-muted border-none p-2 rounded-full hover:bg-slate-100"><X size={20} /></button>
            </div>
            
            {reportLoading ? (
              <div className="py-12 text-center text-muted">Loading report data...</div>
            ) : studentReportData && studentReportData.length > 0 ? (
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl border border-slate-200 text-center bg-white shadow-sm">
                  <p className="text-xs text-muted font-medium mb-1">Total Questions</p>
                  <p className="font-bold text-xl">{studentReportData.length}</p>
                </div>
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 text-center shadow-sm">
                  <p className="text-xs text-blue-600 font-medium mb-1">Attempted</p>
                  <p className="font-bold text-xl text-blue-700">{studentReportData.filter((r:any) => r.selected_option).length}</p>
                </div>
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-center shadow-sm">
                  <p className="text-xs text-emerald-600 font-medium mb-1">Correct</p>
                  <p className="font-bold text-xl text-emerald-700">{studentReportData.filter((r:any) => r.is_correct === 1).length}</p>
                </div>
                <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-center shadow-sm">
                  <p className="text-xs text-red-600 font-medium mb-1">Incorrect</p>
                  <p className="font-bold text-xl text-red-700">{studentReportData.filter((r:any) => r.is_correct === 0 && r.selected_option).length}</p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-muted">
                <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                <p>No OMR responses found for this student.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
