'use client';
import React, { useState } from 'react';
import { 
  Filter, RotateCw, CheckCircle2, AlertCircle, Clock, 
  Users, FileText, ChevronRight, X, Play, FileCheck, HelpCircle, FileSearch, ArrowRight,
  Globe, Building2, GraduationCap, ClipboardList
} from 'lucide-react';
import Link from 'next/link';
import { ShimmerTable, ShimmerCard } from '@/components/ui/Shimmer';

export default function OMREvaluationPage() {
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);
  const [isFiltered, setIsFiltered] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');

  const tableData = [
    { id: 1, region: 'North Region', school: 'Kendriya Vidyalaya No. 1', udise: '12345678901', coordinator: 'Amit Verma', students: '1,256', completed: '1,256 (100%)', status: 'Completed', updated: '20 May 2025, 10:30 AM', action: 'View Details' },
    { id: 2, region: 'North Region', school: 'Kendriya Vidyalaya No. 2', udise: '12345678902', coordinator: 'Sunita Sharma', students: '1,089', completed: '1,089 (100%)', status: 'Completed', updated: '20 May 2025, 09:15 AM', action: 'View Details' },
    { id: 3, region: 'East Region', school: 'Kendriya Vidyalaya No. 3', udise: '12345678903', coordinator: 'Vikram Singh', students: '1,542', completed: '1,542 (100%)', status: 'Completed', updated: '19 May 2025, 04:45 PM', action: 'View Details' },
    { id: 4, region: 'West Region', school: 'Kendriya Vidyalaya No. 4', udise: '12345678904', coordinator: 'Neha Gupta', students: '980', completed: '860 (87.76%)', status: 'Pending', updated: '-', action: 'Run Evaluation' },
    { id: 5, region: 'South Region', school: 'Kendriya Vidyalaya No. 5', udise: '12345678905', coordinator: 'Pooja Das', students: '1,321', completed: '1,200 (90.84%)', status: 'Pending', updated: '-', action: 'Run Evaluation' },
    { id: 6, region: 'Central Region', school: 'Kendriya Vidyalaya No. 6', udise: '12345678906', coordinator: 'Manoj Tiwari', students: '1,015', completed: '980 (96.55%)', status: 'In Progress', updated: '20 May 2025, 11:20 AM', action: 'View Progress' },
    { id: 7, region: 'East Region', school: 'Kendriya Vidyalaya No. 7', udise: '12345678907', coordinator: 'Anita Patil', students: '1,233', completed: '1,233 (100%)', status: 'Completed', updated: '18 May 2025, 10:05 AM', action: 'View Details' },
    { id: 8, region: 'North Region', school: 'Kendriya Vidyalaya No. 8', udise: '12345678908', coordinator: 'Rajesh Kumar', students: '886', completed: '784 (88.52%)', status: 'Pending', updated: '-', action: 'Run Evaluation' },
  ];

  const handleApplyFilters = () => setIsFiltered(true);
  const handleClearFilters = () => setIsFiltered(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed': return <span style={{ color: 'var(--status-green)', background: '#ECFDF5', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Completed</span>;
      case 'Pending': return <span style={{ color: 'var(--status-orange)', background: '#FFF7ED', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Pending</span>;
      case 'In Progress': return <span style={{ color: 'var(--status-blue)', background: '#EFF6FF', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>In Progress</span>;
      default: return null;
    }
  };

  const getActionButton = (action: string) => {
    if (action === 'Run Evaluation') {
      return (
        <button onClick={() => setIsDrawerOpen(true)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
          <Play size={12} style={{ marginRight: '4px' }} fill="currentColor" /> Run Evaluation
        </button>
      );
    }
    return (
      <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', border: '1px solid var(--border-light)', color: 'var(--primary-purple)' }}>
        <FileText size={12} style={{ marginRight: '4px' }} /> {action}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>OMR Evaluation</h1>
          <p className="text-muted text-sm">Evaluate submitted OMR responses using the Answer Key and Question Metadata to generate assessment results.</p>
        </div>
        <button className="btn btn-outline" style={{ padding: '8px 16px', background: 'white' }}>
          <RotateCw size={16} className="text-muted" /> Refresh
        </button>
      </div>

      {/* Filter Options */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px', flex: 1 }}>
            {[
              { label: 'Region', icon: <Globe size={14} />, options: ['All Regions'] },
              { label: 'School', icon: <Building2 size={14} />, options: ['All Schools'] },
              { label: 'Coordinator', icon: <Users size={14} />, options: ['All Coordinators'] },
              { label: 'Grade', icon: <GraduationCap size={14} />, options: ['All Grades'] },
              { label: 'Evaluation Status', icon: <ClipboardList size={14} />, options: ['All Statuses'] },
              { label: 'Exam', icon: <FileText size={14} />, options: ['LAT 2025'] },
            ].map((filter, i) => (
              <div key={i}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>{filter.label}</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex', alignItems: 'center' }}>
                    {filter.icon}
                  </span>
                  <select style={{
                    width: '100%', padding: '8px 12px 8px 32px', fontSize: '0.82rem',
                    borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white',
                    color: '#1e293b', appearance: 'auto', cursor: 'pointer',
                  }}>
                    {filter.options.map((opt, j) => <option key={j}>{opt}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px', flexShrink: 0, paddingBottom: '2px' }}>
            <button
              onClick={handleClearFilters}
              style={{
                padding: '8px 20px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 500,
                border: '1px solid #E2E8F0', background: 'white', color: '#475569', cursor: 'pointer',
              }}
            >
              Clear
            </button>
            <button
              onClick={handleApplyFilters}
              style={{
                padding: '8px 20px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 500,
                border: 'none', background: '#6366F1', color: 'white', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <Filter size={14} /> Apply Filters
            </button>
          </div>
        </div>
      </div>

      {!isFiltered ? (
        /* Empty State */
        <div className="card flex flex-col items-center justify-center py-20 mt-4 shadow-sm">
          <div className="relative mb-6">
            <div style={{ background: '#EEF2FF', borderRadius: '50%', padding: '3rem' }}>
              <FileCheck size={64} color="#5338F5" strokeWidth={1.5} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>No evaluation data found</h2>
          <p className="text-muted text-sm text-center max-w-md mb-6">
            There are no evaluation records to display.<br/>
            Please apply filters or ensure OMR entries are completed before running evaluation.
          </p>
          <Link href="/coordinator/omr-status" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            <Play size={16} fill="currentColor" /> Go to OMR Status
          </Link>
        </div>
      ) : (
        /* Filled State */
        <>
          {/* Stats */}
          <div className="grid grid-cols-5" style={{ gap: '12px' }}>
            {loading ? (
              <>
                <ShimmerCard />
                <ShimmerCard />
                <ShimmerCard />
                <ShimmerCard />
                <ShimmerCard />
              </>
            ) : (
              <>
            <div className="card flex items-center gap-3 py-3 px-3 border-l-4" style={{ padding: '12px 14px', borderLeftColor: 'var(--primary-purple)' }}>
              <div style={{ padding: '8px', background: '#EEF2FF', color: 'var(--primary-purple)', borderRadius: '50%' }}>
                <Users size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 500, marginBottom: '2px' }}>Total Students</div>
                <div className="font-bold" style={{ fontSize: '1.25rem' }}>1,85,672</div>
                <div style={{ fontSize: '0.625rem', color: '#94A3B8' }}>100%</div>
              </div>
            </div>
            
            <div className="card flex items-center gap-3 py-3 px-3 border-l-4" style={{ padding: '12px 14px', borderLeftColor: 'var(--status-blue)' }}>
              <div style={{ padding: '8px', background: '#EFF6FF', color: 'var(--status-blue)', borderRadius: '50%' }}>
                <FileText size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 500, marginBottom: '2px' }}>OMR Entries Completed</div>
                <div className="font-bold" style={{ fontSize: '1.25rem' }}>1,75,243</div>
                <div style={{ color: 'var(--status-blue)', fontSize: '0.625rem', fontWeight: 600 }}>94.37%</div>
              </div>
            </div>

            <div className="card flex items-center gap-3 py-3 px-3 border-l-4" style={{ padding: '12px 14px', borderLeftColor: 'var(--status-orange)' }}>
              <div style={{ padding: '8px', background: '#FFF7ED', color: 'var(--status-orange)', borderRadius: '50%' }}>
                <Clock size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 500, marginBottom: '2px' }}>Pending Evaluation</div>
                <div className="font-bold" style={{ fontSize: '1.25rem' }}>10,429</div>
                <div style={{ color: 'var(--status-orange)', fontSize: '0.625rem', fontWeight: 600 }}>5.62%</div>
              </div>
            </div>

            <div className="card flex items-center gap-3 py-3 px-3 border-l-4" style={{ padding: '12px 14px', borderLeftColor: 'var(--status-green)' }}>
              <div style={{ padding: '8px', background: '#ECFDF5', color: 'var(--status-green)', borderRadius: '50%' }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 500, marginBottom: '2px' }}>Evaluated</div>
                <div className="font-bold" style={{ fontSize: '1.25rem' }}>1,64,814</div>
                <div style={{ color: 'var(--status-green)', fontSize: '0.625rem', fontWeight: 600 }}>88.76%</div>
              </div>
            </div>

            <div className="card flex items-center gap-3 py-3 px-3 border-l-4" style={{ padding: '12px 14px', borderLeftColor: '#EF4444' }}>
              <div style={{ padding: '8px', background: '#FEF2F2', color: '#EF4444', borderRadius: '50%' }}>
                <AlertCircle size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 500, marginBottom: '2px' }}>Evaluation Errors</div>
                <div className="font-bold" style={{ fontSize: '1.25rem' }}>213</div>
                <div style={{ color: '#EF4444', fontSize: '0.625rem', fontWeight: 600 }}>0.11%</div>
              </div>
            </div>
            </>
            )}
          </div>

          {/* Table Section */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Schools Evaluation Status</h3>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>S. No.</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Region</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>School Name</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>UDISE Code</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>School Coordinator</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Students</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>OMR Completed</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Evaluation Status</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Last Evaluated</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={10} style={{ padding: 0 }}>
                        <ShimmerTable columns={10} rows={8} />
                      </td>
                    </tr>
                  ) : tableData.map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{row.id}</td>
                      <td style={{ padding: '1rem' }}>{row.region}</td>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>{row.school}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{row.udise}</td>
                      <td style={{ padding: '1rem' }}>{row.coordinator}</td>
                      <td style={{ padding: '1rem' }}>{row.students}</td>
                      <td style={{ padding: '1rem' }}>{row.completed}</td>
                      <td style={{ padding: '1rem' }}>{getStatusBadge(row.status)}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{row.updated}</td>
                      <td style={{ padding: '1rem' }}>
                        <div className="flex gap-2 items-center">
                          {getActionButton(row.action)}
                          <button className="text-muted hover:bg-gray-100 p-1 rounded">⋮</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center p-4 text-xs text-muted border-t border-[var(--border-light)]">
              <div>Showing 1 to 8 of 42 schools</div>
              <div className="flex gap-1 items-center">
                <button className="px-2 py-1 border border-[var(--border-light)] rounded bg-gray-50 text-gray-400">{'<'}</button>
                <button className="px-2 py-1 rounded bg-[var(--primary-purple)] text-white">1</button>
                <button className="px-2 py-1 border border-[var(--border-light)] rounded hover:bg-gray-50">2</button>
                <button className="px-2 py-1 border border-[var(--border-light)] rounded hover:bg-gray-50">3</button>
                <button className="px-2 py-1 border border-[var(--border-light)] rounded hover:bg-gray-50">4</button>
                <button className="px-2 py-1 border border-[var(--border-light)] rounded hover:bg-gray-50">5</button>
                <span className="px-2 py-1">...</span>
                <button className="px-2 py-1 border border-[var(--border-light)] rounded hover:bg-gray-50">{'>'}</button>
                <select className="ml-2 px-2 py-1 border border-[var(--border-light)] rounded bg-white">
                  <option>10 / page</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bottom Process Flow */}
          <div className="grid grid-cols-2 gap-6">
            <div className="card">
              <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Evaluation Process Flow</h3>
              <div className="flex justify-between items-start relative px-4">
                {/* Connecting Line */}
                <div style={{ position: 'absolute', top: '16px', left: '10%', right: '10%', height: '2px', background: '#E2E8F0', zIndex: 0 }}></div>
                
                {[
                  { title: '1. OMR Entry Completed', desc: 'Responses entered by coordinators', status: 'done' },
                  { title: '2. Answer Key Uploaded', desc: 'Answer key is available', status: 'done' },
                  { title: '3. Metadata Uploaded', desc: 'Question metadata is available', status: 'done' },
                  { title: '4. Evaluation', desc: 'Evaluate and calculate scores', status: 'active' },
                  { title: '5. Reports Generated', desc: 'Reports are generated', status: 'pending' }
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center text-center relative z-10" style={{ width: '18%' }}>
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px',
                      background: step.status === 'done' ? 'var(--status-green)' : step.status === 'active' ? 'var(--primary-purple)' : '#F1F5F9',
                      color: step.status === 'pending' ? '#94A3B8' : 'white',
                      border: step.status === 'pending' ? '1px solid #CBD5E1' : 'none'
                    }}>
                      {step.status === 'done' ? <CheckCircle2 size={16} /> : 
                       step.status === 'active' ? <RotateCw size={16} /> : 
                       <Clock size={16} />}
                    </div>
                    <div className="text-[11px] font-semibold mb-1 leading-tight">{step.title}</div>
                    <div className="text-[9px] text-muted leading-tight">{step.desc}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card bg-[#F8FAFC] border border-[#E2E8F0]">
               <div className="flex gap-2 items-center mb-3">
                 <HelpCircle size={16} color="var(--primary-purple)" />
                 <h3 style={{ fontSize: '1rem' }}>Important Notes</h3>
               </div>
               <ul className="text-xs text-muted space-y-2 mb-4">
                 <li className="flex gap-2 items-start"><CheckCircle2 size={14} color="var(--status-green)" className="mt-[2px] flex-shrink-0" /> Ensure OMR entries are 100% complete.</li>
                 <li className="flex gap-2 items-start"><CheckCircle2 size={14} color="var(--status-green)" className="mt-[2px] flex-shrink-0" /> Answer Key and Metadata must be uploaded.</li>
                 <li className="flex gap-2 items-start"><CheckCircle2 size={14} color="var(--status-green)" className="mt-[2px] flex-shrink-0" /> Evaluation cannot be run if there are validation errors.</li>
               </ul>
               <Link href="#" className="text-xs text-[var(--primary-purple)] hover:underline font-medium">View Help Guide ↗</Link>
            </div>
          </div>
        </>
      )}

      {/* Slide-out Drawer */}
      {isDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 transition-opacity" onClick={() => setIsDrawerOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-[400px] bg-white z-50 shadow-2xl flex flex-col transform transition-transform border-l border-gray-200">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-semibold">Evaluation Details</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="px-6 pt-5 pb-2">
              <h3 className="font-bold text-md mb-1">Kendriya Vidyalaya No. 4</h3>
              <span style={{ color: 'var(--status-orange)', background: '#FFF7ED', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>Pending Evaluation</span>
            </div>

            {/* Tabs */}
            <div className="flex px-6 border-b border-gray-200 mt-2">
              {['Overview', 'Validation', 'History'].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-[var(--primary-purple)] text-[var(--primary-purple)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Drawer Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              {activeTab === 'Overview' && (
                <div className="space-y-6">
                  {/* School Info */}
                  <div>
                    <div className="flex gap-2 items-center text-sm font-semibold mb-3 pb-2 border-b border-gray-100">
                      <FileText size={16} color="var(--primary-purple)" /> School Information
                    </div>
                    <div className="grid grid-cols-2 gap-y-3 text-xs">
                      <div className="text-gray-500">Region</div><div className="font-medium text-right">West Region</div>
                      <div className="text-gray-500">UDISE Code</div><div className="font-medium text-right">12345678904</div>
                      <div className="text-gray-500">School Coordinator</div><div className="font-medium text-right">Neha Gupta</div>
                      <div className="text-gray-500">Grade</div><div className="font-medium text-right">Grade 6</div>
                      <div className="text-gray-500">Exam</div><div className="font-medium text-right">LAT 2025</div>
                    </div>
                  </div>

                  {/* Eval Summary */}
                  <div>
                    <div className="flex gap-2 items-center text-sm font-semibold mb-3 pb-2 border-b border-gray-100">
                      <Users size={16} color="var(--primary-purple)" /> Evaluation Summary
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-start gap-3">
                        <Users size={16} className="text-gray-400 mt-1" />
                        <div><div className="text-[10px] text-gray-500">Total Students</div><div className="font-bold text-sm">980</div></div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-start gap-3">
                        <FileCheck size={16} className="text-gray-400 mt-1" />
                        <div><div className="text-[10px] text-gray-500">Classes</div><div className="font-bold text-sm">240</div></div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-start gap-3">
                        <CheckCircle2 size={16} color="var(--status-green)" className="mt-1" />
                        <div><div className="text-[10px] text-gray-500">OMR Entered</div><div className="font-bold text-sm">860 (87.76%)</div></div>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 flex items-start gap-3">
                        <Clock size={16} color="var(--status-orange)" className="mt-1" />
                        <div><div className="text-[10px] text-gray-500">Pending Eval.</div><div className="font-bold text-sm text-orange-700">860 (87.76%)</div></div>
                      </div>
                    </div>
                  </div>

                  {/* Validation Checks */}
                  <div>
                    <div className="flex gap-2 items-center text-sm font-semibold mb-3 pb-2 border-b border-gray-100">
                      <CheckCircle2 size={16} color="var(--primary-purple)" /> Validation Checks
                    </div>
                    <ul className="text-xs space-y-3">
                      <li className="flex gap-3 items-start"><CheckCircle2 size={14} color="var(--status-green)" className="mt-[1px]" /> Answer Key is available</li>
                      <li className="flex gap-3 items-start"><CheckCircle2 size={14} color="var(--status-green)" className="mt-[1px]" /> Question Metadata is available</li>
                      <li className="flex gap-3 items-start"><CheckCircle2 size={14} color="var(--status-green)" className="mt-[1px]" /> OMR entries completed for 87.76% students</li>
                      <li className="flex gap-3 items-start text-orange-600"><AlertCircle size={14} color="var(--status-orange)" className="mt-[1px]" /> 120 students have incomplete OMR entries</li>
                      <li className="flex gap-3 items-start text-orange-600"><AlertCircle size={14} color="var(--status-orange)" className="mt-[1px]" /> 15 students marked present but no answers entered</li>
                      <li className="flex gap-3 items-start font-medium text-green-700 mt-4"><CheckCircle2 size={14} color="var(--status-green)" className="mt-[1px]" /> Ready for evaluation</li>
                    </ul>
                  </div>
                </div>
              )}
              {activeTab !== 'Overview' && (
                <div className="text-center text-gray-500 text-sm mt-10">
                  Detailed {activeTab.toLowerCase()} information will appear here.
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsDrawerOpen(false)} className="btn btn-outline bg-white px-5 py-2 text-sm">Cancel</button>
              <button className="btn btn-primary px-5 py-2 text-sm flex items-center gap-2">
                <Play size={14} fill="currentColor" /> Run Evaluation
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
