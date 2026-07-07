"use client";

import React, { useState } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/services/api';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/omr/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage({ type: 'success', text: response.data?.message || 'File processed successfully!' });
      setFile(null); // clear file after success
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'An error occurred during upload.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Upload OMR Data</h1>
          <p className="text-muted mt-1">Upload the compiled Excel sheet containing student responses.</p>
        </div>
        
        <a 
          href={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1').replace('/api/v1', '')}/Template.xlsx`} 
          download 
          className="btn btn-outline flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded hover:bg-[var(--bg-hover)]"
        >
          <UploadCloud size={18} className="rotate-180" />
          Download Dummy Template
        </a>
      </div>

      <div className="card p-6 max-w-2xl">
        <div className="border-2 border-dashed border-[var(--border-color)] rounded-xl p-8 text-center bg-[var(--bg-secondary)] relative">
          <input 
            type="file" 
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
          <UploadCloud className="mx-auto h-12 w-12 text-muted mb-4" />
          {file ? (
            <div>
              <p className="font-medium text-lg">{file.name}</p>
              <p className="text-sm text-muted">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          ) : (
            <div>
              <p className="font-medium text-lg">Click or drag Excel file to upload</p>
              <p className="text-sm text-muted">Supports .xlsx and .xls</p>
            </div>
          )}
        </div>

        {message && (
          <div 
            className={`mt-6 p-5 rounded-xl border backdrop-blur-sm flex items-start gap-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 shadow-sm
              ${message.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
              }`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${message.type === 'success' ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
              {message.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
            </div>
            <div className="flex-1 pt-0.5">
              <h3 className="font-semibold text-lg tracking-tight mb-1">
                {message.type === 'success' ? 'Upload Successful' : 'Action Required'}
              </h3>
              <p className="text-[15px] opacity-90 leading-relaxed font-medium">
                {message.text}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button 
            className="btn btn-primary min-w-[120px]"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" /> Processing...
              </span>
            ) : (
              'Upload Data'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
