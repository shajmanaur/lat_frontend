"use client";

import React, { useState } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, Loader2, FileSpreadsheet, Download, HelpCircle, ArrowRight, X } from 'lucide-react';
import { api, omrApi } from '@/services/api';

export default function UploadPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const extension = droppedFile.name.split('.').pop()?.toLowerCase();
      if (extension === 'xlsx' || extension === 'xls') {
        setFile(droppedFile);
        setMessage(null);
      } else {
        setMessage({ type: 'error', text: 'Invalid file format. Please upload an Excel sheet (.xlsx, .xls).' });
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const response = await omrApi.uploadFile(file);

      setMessage({ type: 'success', text: response?.message || 'File processed successfully!' });
      setFile(null); // clear file after success
      
      // Auto-close modal after short delay on success
      setTimeout(() => {
        setIsModalOpen(false);
        setMessage(null);
      }, 3000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'An error occurred during upload.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setUploading(false);
    }
  };

  const openUploadModal = () => {
    setFile(null);
    setMessage(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Upload OMR Data</h1>
          <p className="text-muted mt-1">Upload the compiled Excel sheet containing student responses.</p>
        </div>
        
        <button 
          onClick={openUploadModal}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          + Upload OMR Data
        </button>
      </div>

      {/* Main Page Layout: Instructions & Guidelines */}
      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        
        {/* Step-by-Step Instructions */}
        <div className="card flex flex-col" style={{ padding: '2rem' }}>
          <h3 className="font-bold text-lg mb-4 text-slate-800" style={{ fontSize: '1.15rem' }}>OMR Upload process flow</h3>
          <p className="text-muted text-sm mb-6">Please follow the instructions below to compile and upload student responses correctly.</p>
          
          <div className="flex flex-col gap-6">
            <div className="flex gap-4">
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(76, 53, 230, 0.08)', color: 'var(--primary-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700 }}>1</div>
              <div>
                <h4 className="font-semibold text-slate-800" style={{ fontSize: '0.95rem' }}>Download OMR template</h4>
                <p className="text-muted text-xs mt-1 leading-relaxed">Download the blank Excel template. Do not modify the sheets (Class 3, Class 6, Class 9) or the table structure as it is hardcoded inside the parser.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(76, 53, 230, 0.08)', color: 'var(--primary-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700 }}>2</div>
              <div>
                <h4 className="font-semibold text-slate-800" style={{ fontSize: '0.95rem' }}>Enter student responses</h4>
                <p className="text-muted text-xs mt-1 leading-relaxed">Record answers selected by each student for every item. Fill in student names, UDISE code, region, gender, and section column values.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(76, 53, 230, 0.08)', color: 'var(--primary-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700 }}>3</div>
              <div>
                <h4 className="font-semibold text-slate-800" style={{ fontSize: '0.95rem' }}>Upload file and verify</h4>
                <p className="text-muted text-xs mt-1 leading-relaxed">Click the "+ Upload OMR Data" button, drag and drop your completed file, and trigger upload. The system automatically reads all rows and creates/updates students, regions, and schools.</p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-start' }}>
            <button 
              onClick={openUploadModal} 
              className="btn btn-primary"
              style={{ padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              Start Upload <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Info panel */}
        <div className="flex flex-col gap-6">
          <div className="card bg-[#F8FAFC] border border-[#E2E8F0]" style={{ padding: '1.5rem' }}>
            <div className="flex gap-2 items-center mb-3">
              <HelpCircle size={16} color="var(--primary-purple)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Guidelines & templates</h3>
            </div>
            <ul className="text-xs text-muted space-y-3 mb-4" style={{ listStyleType: 'none', paddingLeft: 0 }}>
              <li className="flex gap-2 items-start"><CheckCircle size={14} color="var(--status-green)" className="mt-[2px] flex-shrink-0" /> Supported formats: .xlsx (Excel Worksheets)</li>
              <li className="flex gap-2 items-start"><CheckCircle size={14} color="var(--status-green)" className="mt-[2px] flex-shrink-0" /> Keeps student identifiers exact and matching.</li>
              <li className="flex gap-2 items-start"><CheckCircle size={14} color="var(--status-green)" className="mt-[2px] flex-shrink-0" /> Max file size allowed: 5 MB</li>
            </ul>
            <a 
              href={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1').replace('/api/v1', '')}/Template.xlsx`}
              download
              className="btn btn-outline"
              style={{ width: '100%', marginTop: '1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'white' }}
            >
              <Download size={14} /> Download standard template
            </a>
          </div>
        </div>

      </div>

      {/* MULTI-STEP UPLOAD MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            {/* Close Modal Button */}
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="modal-close-btn"
              disabled={uploading}
            >
              <X size={20} />
            </button>

            {/* Modal Title */}
            <h2 className="modal-title">Bulk Upload OMR Data</h2>
            
            {/* Embedded Alerts */}
            {message && (
              <div className={`upload-alert ${message.type}`} style={{ marginBottom: '1.25rem', marginTop: 0 }}>
                <div className="alert-icon-container">
                  {message.type === 'success' ? <CheckCircle size={22} /> : <AlertCircle size={22} />}
                </div>
                <div className="flex-1">
                  <h3 className="alert-title">
                    {message.type === 'success' ? 'Upload Successful' : 'Action Required'}
                  </h3>
                  <p className="alert-message">
                    {message.text}
                  </p>
                </div>
              </div>
            )}

            {/* Modal Content / Steps */}
            <div className="flex flex-col gap-5">
              
              {/* Step 1 */}
              <div>
                <div className="step-number-badge">Step 1</div>
                <div className="modal-step-container">
                  <div>
                    <div className="modal-step-title">Download Template</div>
                    <div className="modal-step-desc">Download the blank Excel file structure containing formatting rules.</div>
                  </div>
                  <a 
                    href={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1').replace('/api/v1', '')}/Template.xlsx`} 
                    download
                    className="btn btn-outline"
                    style={{ padding: '8px 14px', fontSize: '0.8rem', whiteSpace: 'nowrap', background: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    Download <Download size={14} />
                  </a>
                </div>
              </div>

              {/* Step 2 */}
              <div>
                <div className="step-number-badge">Step 2</div>
                <div className="modal-step-title" style={{ marginBottom: '0.75rem' }}>Upload completed sheet</div>
                
                <div 
                  className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  style={{ padding: '2rem 1rem', position: 'relative' }}
                >
                  <input 
                    type="file" 
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    disabled={uploading}
                  />
                  
                  <div className="upload-icon-wrapper" style={{ width: '3.5rem', height: '3.5rem', marginBottom: '0.75rem' }}>
                    <UploadCloud size={24} />
                  </div>
                  
                  {file ? (
                    <div>
                      <p className="upload-title" style={{ fontSize: '0.95rem' }}>{file.name}</p>
                      <p className="upload-subtitle">{(file.size / 1024).toFixed(2)} KB</p>
                      <div className="file-pill">
                        <FileSpreadsheet size={12} /> Ready to upload
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="upload-title" style={{ fontSize: '0.95rem' }}>Click to choose file or drag & drop</p>
                      <p className="upload-subtitle">Supported: .xlsx | Max size: 5 MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Warning Banner */}
              <div className="modal-warning-banner">
                <span style={{ fontSize: '1.1rem' }}>⚠️</span>
                <span>Regions, Schools, and Student records are captured directly from the sheet. Duplicate student uploads are blocked.</span>
              </div>

              {/* Modal Actions */}
              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="modal-footer-btn-cancel"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleUpload}
                  className="modal-footer-btn-submit"
                  disabled={!file || uploading}
                >
                  {uploading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Processing...
                    </span>
                  ) : (
                    'Upload OMR Data'
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
