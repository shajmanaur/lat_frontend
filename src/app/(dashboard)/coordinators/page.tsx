'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, UploadCloud, Download, MoreVertical, Users, UserCheck, UserX, ChevronDown, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { regionsApi, schoolsApi, coordinatorsApi } from '@/services/api';

export default function CoordinatorsPage() {
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Dynamic dropdowns state
  const [regions, setRegions] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  
  const [singleForm, setSingleForm] = useState({
    name: '', email: '', mobile: '', region: '', school: ''
  });
  const [fieldErrors, setFieldErrors] = useState<any>({});
  
  const [editForm, setEditForm] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

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

  const validateForm = (form) => {
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

  const handleSingleSubmit = async (e) => {
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

  const handleEditSubmit = async (e) => {
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
    setActiveDropdown(null);
  };

  const handleBulkSubmit = async (e) => {
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
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-light)' }} />
            <input 
              type="text" 
              placeholder="Search by name, email or mobile..." 
              style={{ padding: '8px 12px 8px 36px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.875rem', width: '250px' }}
            />
          </div>
          
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
      <div className="card flex items-center justify-around">
        <div className="flex flex-col items-center gap-2">
          <div style={{ padding: '10px', background: 'var(--status-blue-bg)', color: 'var(--status-blue)', borderRadius: '50%' }}>
            <Users size={20} />
          </div>
          <div className="text-muted text-sm font-medium">Total Coordinators</div>
          <div className="font-bold" style={{ fontSize: '1.25rem' }}>12,742</div>
        </div>
        
        <div style={{ width: '1px', height: '60px', background: 'var(--border-light)' }}></div>
        
        <div className="flex flex-col items-center gap-2">
          <div style={{ padding: '10px', background: 'var(--status-green-bg)', color: 'var(--status-green)', borderRadius: '50%' }}>
            <UserCheck size={20} />
          </div>
          <div className="text-muted text-sm font-medium">Active Coordinators</div>
          <div className="font-bold" style={{ fontSize: '1.25rem' }}>12,315</div>
        </div>
        
        <div style={{ width: '1px', height: '60px', background: 'var(--border-light)' }}></div>
        
        <div className="flex flex-col items-center gap-2">
          <div style={{ padding: '10px', background: 'var(--status-red-bg)', color: 'var(--status-red)', borderRadius: '50%' }}>
            <UserX size={20} />
          </div>
          <div className="text-muted text-sm font-medium">Inactive Coordinators</div>
          <div className="font-bold" style={{ fontSize: '1.25rem' }}>427</div>
        </div>
      </div>

      {/* Table Section */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Coordinator List</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>S. No.</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Coordinator Name</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Email ID</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Mobile Number</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>UDISE Code</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>School Name</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Regions Assigned</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Imported On</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coordinators.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{row.id}</td>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{row.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{row.email}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{row.mobile}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{row.udise}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{row.school}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{row.region}</td>
                  <td style={{ padding: '1rem' }}>
                    <span 
                      style={{ 
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        background: row.status === 'Active' ? 'var(--status-green-bg)' : 'var(--status-red-bg)',
                        color: row.status === 'Active' ? 'var(--status-green)' : 'var(--status-red)', 
                        fontWeight: 600
                      }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{new Date(row.imported).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center', position: 'relative' }}>
                    <button onClick={() => setActiveDropdown(activeDropdown === row.id ? null : row.id)} style={{ color: 'var(--primary-purple)', background: 'transparent', border: 'none', cursor: 'pointer' }}><MoreVertical size={16} /></button>
                    {activeDropdown === row.id && (
                      <div style={{
                        position: 'absolute', top: '100%', right: '1.5rem', 
                        background: 'white', border: '1px solid var(--border-light)', 
                        borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        zIndex: 50, width: '120px', overflow: 'hidden', textAlign: 'left'
                      }}>
                        <button 
                          style={{ width: '100%', padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid var(--border-light)', background: 'transparent', cursor: 'pointer', fontSize: '0.85rem' }}
                          onClick={() => { setEditForm({ ...row, region: row.region_id, school: row.udise }); setShowEditModal(true); setActiveDropdown(null); }}
                        >
                          Edit
                        </button>
                        <button 
                          style={{ width: '100%', padding: '10px 16px', textAlign: 'left', background: 'transparent', cursor: 'pointer', fontSize: '0.85rem', color: row.status === 'Active' ? 'var(--status-red)' : 'var(--status-green)' }}
                          onClick={() => toggleStatus(row.id)}
                        >
                          Mark {row.status === 'Active' ? 'Inactive' : 'Active'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
