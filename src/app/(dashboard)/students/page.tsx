'use client';

import React, { useState } from 'react';
import { Users, Search, Filter, RotateCcw, Plus, Upload, MoreVertical, Edit, Download, CheckCircle, AlertCircle } from 'lucide-react';

const mockStudents = [
  { id: 1, name: 'Aman Sharma', aadhar: 'AF345678901234', gender: 'Male', grade: 'Grade 5', section: 'A' },
  { id: 2, name: 'Siya Verma', aadhar: 'AF345678901235', gender: 'Female', grade: 'Grade 5', section: 'A' },
  { id: 3, name: 'Rohan Mehta', aadhar: 'AF345678901236', gender: 'Male', grade: 'Grade 8', section: 'B' },
  { id: 4, name: 'Neha Patel', aadhar: 'AF345678901237', gender: 'Female', grade: 'Grade 3', section: 'C' },
  { id: 5, name: 'Aditya Singh', aadhar: 'AF345678901238', gender: 'Male', grade: 'Grade 10', section: 'A' },
];

export default function StudentList() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [uploadState, setUploadState] = useState<'empty' | 'uploading' | 'success' | 'error'>('empty');

  return (
    <div className="flex flex-col gap-6 relative">
      
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
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}>
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
              style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '0.875rem' }} 
            />
          </div>
          <select style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '0.875rem', minWidth: '150px' }}>
            <option>All Grades</option>
            <option>Grade 3</option>
            <option>Grade 5</option>
            <option>Grade 8</option>
          </select>
          <select style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '0.875rem', minWidth: '150px' }}>
            <option>All Sections</option>
            <option>A</option>
            <option>B</option>
          </select>
          
          <button className="btn btn-outline text-muted" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', borderRadius: '12px' }}>
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
              {mockStudents.map((s, idx) => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'all 0.2s ease' }} className="hover:bg-slate-50">
                  <td style={{ padding: '20px 12px' }}>{idx + 1}</td>
                  <td style={{ padding: '20px 12px', fontWeight: 600 }}>
                    <div className="flex items-center gap-3">
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(76,53,230,0.1)', color: '#4C35E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {s.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      {s.name}
                    </div>
                  </td>
                  <td style={{ padding: '20px 12px', color: 'var(--text-muted)' }}>{s.aadhar}</td>
                  <td style={{ padding: '20px 12px', color: 'var(--text-muted)' }}>
                    <span style={{ padding: '4px 10px', background: '#F1F5F9', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500 }}>
                      {s.gender}
                    </span>
                  </td>
                  <td style={{ padding: '20px 12px', color: 'var(--text-muted)' }}>{s.grade}</td>
                  <td style={{ padding: '20px 12px', color: 'var(--text-muted)' }}>{s.section}</td>
                  <td style={{ padding: '20px 12px', textAlign: 'center' }}>
                    <div className="flex items-center justify-center gap-4 text-muted">
                      <button><Edit size={16} className="hover:text-primary-purple cursor-pointer transition-colors" /></button>
                      <button><MoreVertical size={16} className="cursor-pointer hover:text-text-dark transition-colors" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex justify-between items-center mt-6 text-sm text-muted">
          <div>Showing 1 to 5 of 124 students</div>
          <div className="flex gap-2">
            <button style={{ padding: '6px 12px', border: '1px solid var(--border-light)', borderRadius: '8px' }}>Previous</button>
            <button style={{ padding: '6px 12px', background: '#4C35E6', color: 'white', borderRadius: '8px', fontWeight: 600 }}>1</button>
            <button style={{ padding: '6px 12px', border: '1px solid var(--border-light)', borderRadius: '8px' }}>2</button>
            <button style={{ padding: '6px 12px', border: '1px solid var(--border-light)', borderRadius: '8px' }}>3</button>
            <button style={{ padding: '6px 12px', border: '1px solid var(--border-light)', borderRadius: '8px' }}>Next</button>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(17,24,39,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '24px', width: '600px', boxShadow: '0 20px 50px rgba(17,24,39,0.12)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px' }}>Add Student</h2>
            
            <div className="grid grid-cols-2 gap-5 mb-8">
              <div className="col-span-2">
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-dark)', marginBottom: '8px' }}>Student Name *</label>
                <input type="text" placeholder="Enter full name" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '0.875rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-dark)', marginBottom: '8px' }}>APAAR ID *</label>
                <input type="text" placeholder="Enter 14-digit APAAR ID" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '0.875rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-dark)', marginBottom: '8px' }}>Gender *</label>
                <select style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '0.875rem', backgroundColor: 'white' }}>
                  <option>Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-dark)', marginBottom: '8px' }}>Grade *</label>
                <select style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '0.875rem', backgroundColor: 'white' }}>
                  <option>Select Grade</option>
                  <option>Grade 3</option>
                  <option>Grade 5</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-dark)', marginBottom: '8px' }}>Section *</label>
                <select style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '0.875rem', backgroundColor: 'white' }}>
                  <option>Select Section</option>
                  <option>A</option>
                  <option>B</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--border-light)' }}>
              <button onClick={() => setShowAddModal(false)} className="btn btn-outline" style={{ background: 'white', padding: '12px 24px', borderRadius: '12px' }}>Cancel</button>
              <button className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: '12px' }}>Save Student</button>
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
