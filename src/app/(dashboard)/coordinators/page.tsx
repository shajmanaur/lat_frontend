'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, UploadCloud, Download, Users, UserCheck, UserX, ChevronDown, X, RotateCcw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { regionsApi, schoolsApi, coordinatorsApi } from '@/services/api';

export default function CoordinatorsPage() {
  const [coordinators, setCoordinators] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Dynamic dropdowns state
  const [regions, setRegions] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [filterSchools, setFilterSchools] = useState<any[]>([]);
  
  const [singleForm, setSingleForm] = useState({
    name: '', email: '', mobile: '', region: '', school: ''
  });
  const [fieldErrors, setFieldErrors] = useState<any>({});
  
  const [editForm, setEditForm] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [bulkForm, setBulkForm] = useState({
    region: '', school: ''
  });
  const [file, setFile] = useState<File | null>(null);
  
  const [globalError, setGlobalError] = useState('');
  const [singleSuccess, setSingleSuccess] = useState('');
  const [bulkError, setBulkError] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState('');

  const fetchCoordinators = async () => {
    try {
      const res = await coordinatorsApi.getCoordinators();
      const data = res.status === true && res.response ? res.response.data : res.data;
      setCoordinators(data || []);
    } catch (err) {
      console.error('Failed to fetch coordinators', err);
    }
  };

  useEffect(() => {
    // Fetch regions on mount
    const fetchRegions = async () => {
      try {
        const res = await regionsApi.getRegions();
        // Handle global interceptor wrapper { status: true, response: { data: [] } }
        const data = res.status === true && res.response ? res.response.data : res.data;
        setRegions(data || []);
      } catch (err) {
        console.error('Failed to fetch regions', err);
      }
    };
    fetchRegions();
    fetchCoordinators();
  }, []);

  // Fetch schools when single form region changes
  useEffect(() => {
    const fetchSchools = async () => {
      if (!singleForm.region) return setSchools([]);
      try {
        const res = await schoolsApi.getSchoolsByRegion(singleForm.region);
        const data = res.status === true && res.response ? res.response.data : res.data;
        setSchools(data || []);
      } catch (err) {
        console.error('Failed to fetch schools', err);
      }
    };
    fetchSchools();
  }, [singleForm.region]);

  // Fetch schools when bulk form region changes
  useEffect(() => {
    const fetchSchools = async () => {
      if (!bulkForm.region) return setSchools([]);
      try {
        const res = await schoolsApi.getSchoolsByRegion(bulkForm.region);
        const data = res.status === true && res.response ? res.response.data : res.data;
        setSchools(data || []);
      } catch (err) {
        console.error('Failed to fetch schools', err);
      }
    };
    fetchSchools();
  }, [bulkForm.region]);

  // Fetch schools for filter dropdown when region filter changes
  useEffect(() => {
    const fetchFilterSchools = async () => {
      if (!regionFilter) {
        setFilterSchools([]);
        setSchoolFilter('');
        return;
      }
      try {
        const res = await schoolsApi.getSchoolsByRegion(regionFilter);
        const data = res.status === true && res.response ? res.response.data : res.data;
        setFilterSchools(data || []);
        setSchoolFilter('');
      } catch (err) {
        console.error('Failed to fetch filter schools', err);
      }
    };
    fetchFilterSchools();
  }, [regionFilter]);

  const validateForm = (form: any) => {
    const errs: any = {};
    if (!form.region) errs.region = 'Region is required.';
    if (!form.school) errs.school = 'School is required.';
    if (!form.name) errs.name = 'Coordinator name is required.';
    if (!form.email) {
      errs.email = 'Email address is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      errs.email = 'Enter a valid work email.';
    }
    if (!form.mobile) {
      errs.mobile = 'Mobile number is required.';
    } else if (!/^\d{10}$/.test(form.mobile)) {
      errs.mobile = 'Enter a valid 10-digit phone number.';
    }
    return errs;
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    setFieldErrors({});
    setSingleSuccess('');
    
    const errs = validateForm(singleForm);
    if (Object.keys(errs).length > 0) {
      return setFieldErrors(errs);
    }

    try {
      const res = await coordinatorsApi.addSingleCoordinator(singleForm);
      setSingleSuccess(res.message || 'Coordinator added successfully');
      setSingleForm({ name: '', email: '', mobile: '', region: '', school: '' });
      fetchCoordinators();
      setTimeout(() => {
        setShowSingleModal(false);
        setSingleSuccess('');
      }, 2000);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setGlobalError(Array.isArray(msg) ? msg.join(', ') : (msg || err.message || 'Failed to add coordinator'));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    setFieldErrors({});
    setSingleSuccess('');

    const errs = validateForm(editForm);
    if (Object.keys(errs).length > 0) {
      return setFieldErrors(errs);
    }

    try {
      const payload = {
        name: editForm.name,
        email: editForm.email,
        mobile: editForm.mobile,
        region: editForm.region,
        school: editForm.school
      };
      const res = await coordinatorsApi.updateCoordinator(editForm.id, payload);
      setSingleSuccess(res.message || 'Coordinator updated successfully');
      fetchCoordinators();
      setTimeout(() => {
        setShowEditModal(false);
        setSingleSuccess('');
        setEditForm(null);
      }, 2000);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setGlobalError(Array.isArray(msg) ? msg.join(', ') : (msg || err.message || 'Failed to update coordinator'));
    }
  };

  const toggleStatus = async (id: number) => {
    try {
      await coordinatorsApi.toggleCoordinatorStatus(id);
      fetchCoordinators();
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  const filteredCoordinators = coordinators.filter((c: any) => {
    const matchesSearch = !searchQuery || 
      (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.mobile || '').includes(searchQuery) ||
      (c.region || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.school || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRegion = !regionFilter || String(c.region_id || c.region) === regionFilter;
    const matchesSchool = !schoolFilter || c.udise === schoolFilter || c.school === schoolFilter;
    const matchesStatus = statusFilter === 'All' || (c.status || '').toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesRegion && matchesSchool && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCoordinators.length / itemsPerPage);
  const paginatedData = filteredCoordinators.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => { setCurrentPage(1); }, [searchQuery, itemsPerPage, regionFilter, schoolFilter, statusFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setRegionFilter('');
    setSchoolFilter('');
    setStatusFilter('All');
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkError('');
    setBulkSuccess('');
    if (!file) return setBulkError('Please select a file');
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        const payload = {
          region: bulkForm.region,
          school: bulkForm.school,
          coordinators: jsonData
        };
        
        const res = await coordinatorsApi.bulkUploadCoordinators(payload);
        // Handle axios response wrapped inside {status, response}
        const respData = res.status === true && res.response ? res.response : res;
        
        if (respData.status === false) {
          setBulkError(respData.message + ': ' + (respData.error?.join(', ') || ''));
        } else {
          setBulkSuccess(respData.message || 'Success');
          setTimeout(() => {
            setShowBulkModal(false);
            setBulkSuccess('');
            fetchCoordinators();
          }, 2000);
        }
      } catch (err: any) {
        const msg = err.response?.data?.message;
        setBulkError(Array.isArray(msg) ? msg.join(', ') : (msg || err.message || 'Failed to bulk upload'));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Coordinators</h1>
          <p className="text-muted text-sm">Manage and view all coordinators imported from KVS.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div style={{ position: 'relative' }}>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddMenu(!showAddMenu)}
              style={{ padding: '8px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}
            >
              + Add Coordinator <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.3)', margin: '0 4px' }}></div> <ChevronDown size={16} />
            </button>

            {showAddMenu && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)', right: 0, 
                background: 'white', border: '1px solid var(--border-light)', 
                borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 50, width: '160px', overflow: 'hidden'
              }}>
                <button 
                  style={{ width: '100%', padding: '12px 16px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', background: 'transparent', cursor: 'pointer' }}
                  onClick={() => { setShowSingleModal(true); setShowAddMenu(false); }}
                >
                  <Users size={16} color="var(--text-muted)" /> Single Add
                </button>
                <button 
                  style={{ width: '100%', padding: '12px 16px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', cursor: 'pointer' }}
                  onClick={() => { setShowBulkModal(true); setShowAddMenu(false); }}
                >
                  <UploadCloud size={16} color="var(--text-muted)" /> Bulk Add
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex', alignItems: 'center', background: 'white',
        borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '14px 0',
        border: '1px solid #f1f5f9',
      }}>
        {/* Total Coordinators */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '0 24px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Users size={18} color="#6366F1" />
          </div>
          <div>
            <div style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 500, marginBottom: '2px' }}>Total Coordinators</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>{coordinators.length.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div style={{ width: '1px', height: '40px', background: '#e2e8f0' }}></div>

        {/* Active Coordinators */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '0 24px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <UserCheck size={18} color="#10B981" />
          </div>
          <div>
            <div style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 500, marginBottom: '2px' }}>Active Coordinators</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
              {coordinators.filter((c: any) => (c.status || '').toLowerCase() === 'active').length.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div style={{ width: '1px', height: '40px', background: '#e2e8f0' }}></div>

        {/* Inactive Coordinators */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '0 24px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <UserX size={18} color="#EF4444" />
          </div>
          <div>
            <div style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 500, marginBottom: '2px' }}>Inactive Coordinators</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
              {coordinators.filter((c: any) => (c.status || '').toLowerCase() === 'inactive').length.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="card" style={{ padding: 0 }}>
        {/* Filters */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'nowrap' }}>
          <div style={{ position: 'relative', minWidth: '240px', maxWidth: '280px', flexShrink: 0 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input 
              type="text" 
              placeholder="Search by name, email or mobile..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', outline: 'none', color: '#1E293B', height: '40px', boxSizing: 'border-box' }}
            />
          </div>
          <select 
            value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}
            style={{ padding: '0 32px 0 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', minWidth: '150px', color: '#1E293B', background: 'white', cursor: 'pointer', outline: 'none', height: '40px', boxSizing: 'border-box', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
            <option value="">All Regions</option>
            {regions.map((r: any) => <option key={r.region_id} value={r.region_id}>{r.region_name}</option>)}
          </select>
          <select 
            value={schoolFilter} onChange={(e) => setSchoolFilter(e.target.value)}
            style={{ padding: '0 32px 0 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', minWidth: '160px', color: !regionFilter ? '#94A3B8' : '#1E293B', background: 'white', cursor: 'pointer', outline: 'none', height: '40px', boxSizing: 'border-box', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
            disabled={!regionFilter}>
            <option value="">All Schools</option>
            {filterSchools.map((s: any) => <option key={s.school_id} value={s.udise_code}>{s.school_name}</option>)}
          </select>
          <select 
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0 32px 0 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', minWidth: '130px', color: '#1E293B', background: 'white', cursor: 'pointer', outline: 'none', height: '40px', boxSizing: 'border-box', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          {(searchQuery || regionFilter || schoolFilter || statusFilter !== 'All') && (
            <button onClick={handleResetFilters} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', padding: '0 16px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', cursor: 'pointer', color: '#64748B', whiteSpace: 'nowrap', flexShrink: 0, height: '40px', boxSizing: 'border-box' }}>
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </div>

        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Coordinator List</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing {filteredCoordinators.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredCoordinators.length)} of{' '}
            {filteredCoordinators.length.toLocaleString('en-IN')} coordinators
          </span>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: '#64748B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>S.No</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#64748B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Coordinator Name</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#64748B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email ID</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#64748B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mobile Number</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#64748B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>UDISE Code</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#64748B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>School Name</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#64748B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Region</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#64748B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#64748B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Imported On</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, idx) => {
                const initials = (row.name || '').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
                const avatarColors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
                const colorIdx = (row.name || '').split('').reduce((acc: number, ch: string) => acc + ch.charCodeAt(0), 0) % avatarColors.length;
                return (
                  <tr key={row.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '0.85rem 1.5rem', color: '#94A3B8', fontSize: '0.82rem' }}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '50%',
                          background: avatarColors[colorIdx], color: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 600, flexShrink: 0,
                        }}>
                          {initials || 'NA'}
                        </div>
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{row.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748B' }}>{row.email}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748B', fontFamily: 'monospace', fontSize: '0.82rem' }}>{row.mobile}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748B', fontFamily: 'monospace', fontSize: '0.82rem' }}>{row.udise}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748B', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.school}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748B' }}>{row.region}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <button
                        onClick={() => toggleStatus(row.id)}
                        style={{
                          position: 'relative', width: '42px', height: '24px', borderRadius: '12px',
                          background: row.status === 'Active' ? '#10B981' : '#E2E8F0',
                          border: 'none', cursor: 'pointer', transition: 'background 0.2s', padding: 0,
                        }}
                        aria-label={`Toggle status for ${row.name}`}
                      >
                        <span style={{
                          position: 'absolute', top: '3px',
                          left: row.status === 'Active' ? '21px' : '3px',
                          width: '18px', height: '18px', borderRadius: '50%',
                          background: 'white', transition: 'left 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }} />
                      </button>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748B', fontSize: '0.82rem' }}>{new Date(row.imported).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  </tr>
                );
              })}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
                    No coordinators found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#64748B' }}>
            <span>Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              style={{ padding: '4px 8px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '0.82rem', background: 'white', cursor: 'pointer' }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px', border: '1px solid #E2E8F0', borderRadius: '6px',
                background: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                color: currentPage === 1 ? '#CBD5E1' : '#64748B', fontSize: '0.82rem',
              }}
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                if (totalPages <= 5) return true;
                if (page === 1 || page === totalPages) return true;
                if (Math.abs(page - currentPage) <= 1) return true;
                return false;
              })
              .reduce<(number | string)[]>((acc, page, i, arr) => {
                if (i > 0 && (arr[i - 1] as number) !== page - 1) acc.push('...');
                acc.push(page);
                return acc;
              }, [])
              .map((page, i) =>
                typeof page === 'string' ? (
                  <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: '#CBD5E1', fontSize: '0.82rem' }}>...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      padding: '6px 12px', border: '1px solid', borderRadius: '6px', fontSize: '0.82rem',
                      background: currentPage === page ? '#6366F1' : 'white',
                      color: currentPage === page ? 'white' : '#64748B',
                      borderColor: currentPage === page ? '#6366F1' : '#E2E8F0',
                      cursor: 'pointer', fontWeight: currentPage === page ? 600 : 400,
                    }}
                  >
                    {page}
                  </button>
                )
              )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              style={{
                padding: '6px 12px', border: '1px solid #E2E8F0', borderRadius: '6px',
                background: 'white', cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer',
                color: currentPage === totalPages || totalPages === 0 ? '#CBD5E1' : '#64748B', fontSize: '0.82rem',
              }}
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* SINGLE ADD MODAL */}
      {showSingleModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '500px', maxWidth: '90vw', padding: '1.5rem', position: 'relative' }}>
            <button onClick={() => setShowSingleModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <X size={20} color="var(--text-muted)" />
            </button>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Add Single Coordinator</h2>
            
            {globalError && <div style={{ padding: '10px', background: '#FEE2E2', color: '#B91C1C', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{globalError}</div>}
            {singleSuccess && <div style={{ padding: '10px', background: '#DCFCE7', color: '#15803D', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{singleSuccess}</div>}
            
            <form onSubmit={handleSingleSubmit} className="flex flex-col gap-4" noValidate>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Region <span style={{color: 'red'}}>*</span></label>
                  <select 
                    value={singleForm.region} onChange={e => { setSingleForm({...singleForm, region: e.target.value}); setFieldErrors({...fieldErrors, region: null}) }}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${fieldErrors.region ? '#EF4444' : 'var(--border-light)'}`, color: singleForm.region ? 'inherit' : 'var(--text-muted)' }}>
                    <option value="">Select Region</option>
                    {regions.map(r => (
                      <option key={r.region_id} value={r.region_id}>{r.region_name}</option>
                    ))}
                  </select>
                  {fieldErrors.region && <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>{fieldErrors.region}</div>}
                </div>
                <div className="form-group">
                  <label>School <span style={{color: 'red'}}>*</span></label>
                  <select 
                    value={singleForm.school} onChange={e => { setSingleForm({...singleForm, school: e.target.value}); setFieldErrors({...fieldErrors, school: null}) }}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${fieldErrors.school ? '#EF4444' : 'var(--border-light)'}`, color: singleForm.school ? 'inherit' : 'var(--text-muted)' }}>
                    <option value="">Select School</option>
                    {schools.map(s => (
                      <option key={s.school_id} value={s.udise_code}>{s.school_name}</option>
                    ))}
                  </select>
                  {fieldErrors.school && <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>{fieldErrors.school}</div>}
                </div>
              </div>

              <div className="form-group">
                <label>Coordinator Name <span style={{color: 'red'}}>*</span></label>
                <input type="text" placeholder="Enter full name" value={singleForm.name} onChange={e => { setSingleForm({...singleForm, name: e.target.value}); setFieldErrors({...fieldErrors, name: null}) }}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${fieldErrors.name ? '#EF4444' : 'var(--border-light)'}` }} />
                {fieldErrors.name && <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>{fieldErrors.name}</div>}
              </div>
              
              <div className="form-group">
                <label>Email Address <span style={{color: 'red'}}>*</span></label>
                <input type="email" placeholder="Enter email address" value={singleForm.email} onChange={e => { setSingleForm({...singleForm, email: e.target.value}); setFieldErrors({...fieldErrors, email: null}) }}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${fieldErrors.email ? '#EF4444' : 'var(--border-light)'}` }} />
                {fieldErrors.email && <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>{fieldErrors.email}</div>}
              </div>

              <div className="form-group">
                <label>Mobile Number <span style={{color: 'red'}}>*</span></label>
                <input type="tel" placeholder="Enter 10-digit mobile number" value={singleForm.mobile} onChange={e => { setSingleForm({...singleForm, mobile: e.target.value}); setFieldErrors({...fieldErrors, mobile: null}) }}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${fieldErrors.mobile ? '#EF4444' : 'var(--border-light)'}` }} />
                {fieldErrors.mobile && <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>{fieldErrors.mobile}</div>}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowSingleModal(false)} style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid var(--border-light)', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: 'var(--primary-purple)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}>Add Coordinator</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && editForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '500px', maxWidth: '90vw', padding: '1.5rem', position: 'relative' }}>
            <button onClick={() => { setShowEditModal(false); setEditForm(null); }} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <X size={20} color="var(--text-muted)" />
            </button>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Edit Coordinator</h2>
            
            {globalError && <div style={{ padding: '10px', background: '#FEE2E2', color: '#B91C1C', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{globalError}</div>}
            {singleSuccess && <div style={{ padding: '10px', background: '#DCFCE7', color: '#15803D', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{singleSuccess}</div>}
            
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4" noValidate>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Region <span style={{color: 'red'}}>*</span></label>
                  <select 
                    value={editForm.region} onChange={e => { setEditForm({...editForm, region: e.target.value}); setFieldErrors({...fieldErrors, region: null}) }}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${fieldErrors.region ? '#EF4444' : 'var(--border-light)'}`, color: editForm.region ? 'inherit' : 'var(--text-muted)' }}>
                    <option value="">Select Region</option>
                    {regions.map(r => (
                      <option key={r.region_id} value={r.region_id}>{r.region_name}</option>
                    ))}
                  </select>
                  {fieldErrors.region && <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>{fieldErrors.region}</div>}
                </div>
                <div className="form-group">
                  <label>School <span style={{color: 'red'}}>*</span></label>
                  <select 
                    value={editForm.school} onChange={e => { setEditForm({...editForm, school: e.target.value}); setFieldErrors({...fieldErrors, school: null}) }}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${fieldErrors.school ? '#EF4444' : 'var(--border-light)'}`, color: editForm.school ? 'inherit' : 'var(--text-muted)' }}>
                    <option value="">Select School</option>
                    {schools.map(s => (
                      <option key={s.school_id} value={s.udise_code}>{s.school_name}</option>
                    ))}
                  </select>
                  {fieldErrors.school && <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>{fieldErrors.school}</div>}
                </div>
              </div>

              <div className="form-group">
                <label>Coordinator Name <span style={{color: 'red'}}>*</span></label>
                <input type="text" placeholder="Enter full name" value={editForm.name} onChange={e => { setEditForm({...editForm, name: e.target.value}); setFieldErrors({...fieldErrors, name: null}) }}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${fieldErrors.name ? '#EF4444' : 'var(--border-light)'}` }} />
                {fieldErrors.name && <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>{fieldErrors.name}</div>}
              </div>
              
              <div className="form-group">
                <label>Email Address <span style={{color: 'red'}}>*</span></label>
                <input type="email" placeholder="Enter email address" value={editForm.email} onChange={e => { setEditForm({...editForm, email: e.target.value}); setFieldErrors({...fieldErrors, email: null}) }}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${fieldErrors.email ? '#EF4444' : 'var(--border-light)'}` }} />
                {fieldErrors.email && <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>{fieldErrors.email}</div>}
              </div>

              <div className="form-group">
                <label>Mobile Number <span style={{color: 'red'}}>*</span></label>
                <input type="tel" placeholder="Enter 10-digit mobile number" value={editForm.mobile} onChange={e => { setEditForm({...editForm, mobile: e.target.value}); setFieldErrors({...fieldErrors, mobile: null}) }}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${fieldErrors.mobile ? '#EF4444' : 'var(--border-light)'}` }} />
                {fieldErrors.mobile && <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>{fieldErrors.mobile}</div>}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => { setShowEditModal(false); setEditForm(null); }} style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid var(--border-light)', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: 'var(--primary-purple)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK ADD MODAL */}
      {showBulkModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '600px', maxWidth: '90vw', padding: '1.5rem', position: 'relative' }}>
            <button onClick={() => setShowBulkModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <X size={20} color="var(--text-muted)" />
            </button>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Bulk Add Coordinator</h2>
            
            {bulkError && <div style={{ padding: '10px', background: '#FEE2E2', color: '#B91C1C', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{bulkError}</div>}
            {bulkSuccess && <div style={{ padding: '10px', background: '#DCFCE7', color: '#15803D', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{bulkSuccess}</div>}
            
            <form onSubmit={handleBulkSubmit} className="flex flex-col gap-6" noValidate>
              
              {/* Step 1 */}
              <div style={{ padding: '1rem', border: '1px solid var(--border-light)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: 'var(--primary-purple)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Step 1</div>
                  <div style={{ fontWeight: 600 }}>Download Template</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Download the Excel template, fill in the required information and upload your file.</div>
                </div>
                <button type="button" style={{ padding: '8px 16px', background: 'white', border: '1px solid var(--border-light)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, cursor: 'pointer' }}>
                  Download <Download size={14} />
                </button>
              </div>

              {/* Step 2 */}
              <div>
                <div style={{ color: 'var(--primary-purple)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Step 2</div>
                <div style={{ fontWeight: 600, marginBottom: '1rem' }}>Select required details and upload the sheet</div>
                
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Region <span style={{color: 'red'}}>*</span></label>
                    <select 
                      value={bulkForm.region} onChange={e => setBulkForm({...bulkForm, region: e.target.value})}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }} required>
                      <option value="">Select Region</option>
                      {regions.map(r => (
                        <option key={r.region_id} value={r.region_id}>{r.region_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>School <span style={{color: 'red'}}>*</span></label>
                    <select 
                      value={bulkForm.school} onChange={e => setBulkForm({...bulkForm, school: e.target.value})}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }} required>
                      <option value="">Select School</option>
                      {schools.map(s => (
                        <option key={s.school_id} value={s.udise_code}>{s.school_name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div>
                <div style={{ color: 'var(--primary-purple)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Step 3</div>
                <div style={{ fontWeight: 600, marginBottom: '1rem' }}>Fill & Upload</div>
                
                <div style={{ 
                  border: '2px dashed var(--border-light)', borderRadius: '8px', padding: '2rem', 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: '#F8FAFC', position: 'relative'
                }}>
                  <input 
                    type="file" accept=".xlsx, .xls, .csv" required
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer' }}
                  />
                  <UploadCloud size={32} color="var(--primary-purple)" style={{ marginBottom: '12px' }} />
                  <div style={{ fontWeight: 600 }}>{file ? file.name : 'Click to choose file or drag & drop'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>Supported: .xlsx | Max size: 5 MB</div>
                </div>
              </div>

              <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '8px', padding: '12px', display: 'flex', gap: '8px', color: '#C2410C', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 600 }}>⚠️</span>
                <span>After a successful upload, a welcome email with login credentials will be sent to each coordinator's work email automatically.</span>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowBulkModal(false)} style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid var(--border-light)', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: 'var(--status-blue)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}>Upload & Add Coordinators</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
