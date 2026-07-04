import React from 'react';
import { Search, Filter, Calendar, ClipboardList, Edit3, CheckCircle2, AlertCircle } from 'lucide-react';

export default function OMRStatusPage() {
  const tableData = [
    { id: 1, udise: '12345678901', school: 'Kendriya Vidyalaya No. 1', coordinator: 'Amit Verma', expected: '68,450', inProgress: '12,356', completed: '52,876', notStarted: '3,218', completion: '77.15%', status: 'On Track', updated: '20 May 2025, 10:30 AM' },
    { id: 2, udise: '12345678902', school: 'Kendriya Vidyalaya No. 2', coordinator: 'Sunita Sharma', expected: '62,340', inProgress: '10,245', completed: '45,890', notStarted: '6,205', completion: '73.60%', status: 'On Track', updated: '20 May 2025, 10:30 AM' },
    { id: 3, udise: '12345678903', school: 'Kendriya Vidyalaya No. 3', coordinator: 'Vikram Singh', expected: '54,882', inProgress: '9,544', completed: '43,590', notStarted: '1,748', completion: '79.40%', status: 'On Track', updated: '20 May 2025, 10:30 AM' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>OMR Entry Status</h1>
        <p className="text-muted text-sm">Track and monitor OMR sheet entry progress.</p>
      </div>

      {/* Filter Options */}
      <div className="card flex justify-between items-end">
        <div className="flex gap-4" style={{ flex: 1 }}>
          <div style={{ flex: 1 }}>
            <label className="text-sm font-medium text-muted block mb-2">Region</label>
            <select style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <option>North Region</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="text-sm font-medium text-muted block mb-2">Coordinator</label>
            <select style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <option>Rajesh Kumar (KV1001)</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="text-sm font-medium text-muted block mb-2">Exam</label>
            <select style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <option>LAT 2025</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 ml-6">
           <button className="btn btn-outline" style={{ padding: '8px 16px' }}>Clear</button>
           <button className="btn btn-primary" style={{ padding: '8px 16px' }}><Filter size={16} /> Apply Filters</button>
        </div>
      </div>

      <div className="text-sm">
        <strong>Coordinator: Rajesh Kumar (KV1001)</strong>
        <div className="text-muted mt-1">Region: North Region &nbsp;&nbsp;|&nbsp;&nbsp; Schools Aligned: 3</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4" style={{ gap: '1.5rem' }}>
        <div className="card flex items-center gap-4 py-4" style={{ background: '#F8FAFC' }}>
          <div style={{ padding: '12px', background: 'var(--status-blue-bg)', color: 'var(--primary-purple)', borderRadius: '50%' }}>
            <ClipboardList size={24} />
          </div>
          <div>
            <div className="text-muted text-sm font-medium">Total OMR Expected</div>
            <div className="font-bold" style={{ fontSize: '1.5rem' }}>1,85,672</div>
            <div className="text-xs text-muted">100%</div>
          </div>
        </div>
        
        <div className="card flex items-center gap-4 py-4 border-l-4" style={{ borderLeftColor: 'var(--status-blue)' }}>
          <div style={{ padding: '12px', border: '1px solid var(--status-blue)', color: 'var(--status-blue)', borderRadius: '50%' }}>
            <Edit3 size={24} />
          </div>
          <div>
            <div className="text-muted text-sm font-medium">OMR Entry In Progress</div>
            <div className="font-bold" style={{ fontSize: '1.5rem' }}>32,145</div>
            <div style={{ color: 'var(--status-blue)', fontSize: '0.75rem', fontWeight: 600 }}>17.32%</div>
          </div>
        </div>

        <div className="card flex items-center gap-4 py-4 border-l-4" style={{ borderLeftColor: 'var(--status-green)' }}>
          <div style={{ padding: '12px', border: '1px solid var(--status-green)', color: 'var(--status-green)', borderRadius: '50%' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="text-muted text-sm font-medium">OMR Entry Completed</div>
            <div className="font-bold" style={{ fontSize: '1.5rem' }}>1,42,356</div>
            <div style={{ color: 'var(--status-green)', fontSize: '0.75rem', fontWeight: 600 }}>76.67%</div>
          </div>
        </div>

        <div className="card flex items-center gap-4 py-4 border-l-4" style={{ borderLeftColor: 'var(--status-orange)' }}>
          <div style={{ padding: '12px', border: '1px solid var(--status-orange)', color: 'var(--status-orange)', borderRadius: '50%' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <div className="text-muted text-sm font-medium">Not Started</div>
            <div className="font-bold" style={{ fontSize: '1.5rem' }}>11,171</div>
            <div style={{ color: 'var(--status-orange)', fontSize: '0.75rem', fontWeight: 600 }}>6.01%</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        <div className="card flex flex-col justify-between">
           <h3 style={{ fontSize: '1.1rem' }}>Overall Progress</h3>
           <div className="flex items-center justify-between flex-1 mt-4">
              <div style={{ 
                width: '120px', height: '120px', borderRadius: '50%', 
                border: '15px solid var(--status-green)',
                borderTopColor: 'var(--status-orange)',
                borderRightColor: 'var(--status-blue)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column'
              }}>
                 <span className="text-sm text-muted">Total</span>
                 <span className="font-bold" style={{ fontSize: '12px' }}>1,85,672</span>
              </div>
              
              <div className="flex flex-col gap-3 text-sm">
                 <div className="flex justify-between gap-4"><span style={{ color: 'var(--status-green)' }}>●</span> Completed <span className="font-bold">1,42,356</span></div>
                 <div className="flex justify-between gap-4"><span style={{ color: 'var(--status-blue)' }}>●</span> In Progress <span className="font-bold">32,145</span></div>
                 <div className="flex justify-between gap-4"><span style={{ color: 'var(--status-orange)' }}>●</span> Not Started <span className="font-bold">11,171</span></div>
              </div>
           </div>
        </div>

        <div className="card">
           <div className="flex justify-between items-center mb-4">
             <h3 style={{ fontSize: '1.1rem' }}>Progress Trend (Last 7 Days)</h3>
             <select style={{ padding: '4px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
               <option>Last 7 Days</option>
             </select>
           </div>
           
           <div style={{ height: '150px', background: 'linear-gradient(180deg, rgba(83, 56, 245, 0.1) 0%, rgba(83, 56, 245, 0) 100%)', borderBottom: '2px solid var(--border-light)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '20%', left: '0', right: '0', height: '2px', background: 'var(--primary-purple)', transform: 'rotate(-5deg)', transformOrigin: 'left bottom' }}>
                 <div style={{ position: 'absolute', right: 0, top: '-4px', width: '10px', height: '10px', background: 'var(--primary-purple)', borderRadius: '50%' }}></div>
              </div>
           </div>
           
           <div className="flex justify-between text-xs text-muted mt-2 px-2">
             <span>14 May</span>
             <span>15 May</span>
             <span>16 May</span>
             <span>17 May</span>
             <span>18 May</span>
             <span>19 May</span>
             <span>20 May</span>
           </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Aligned Schools</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>S. No.</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>UDISE Code</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>School Name</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>School Coordinator</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>OMR Expected</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>In Progress</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Completed</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Not Started</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Completion %</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{row.id}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{row.udise}</td>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{row.school}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{row.coordinator}</td>
                  <td style={{ padding: '1rem' }}>{row.expected}</td>
                  <td style={{ padding: '1rem' }}>{row.inProgress}</td>
                  <td style={{ padding: '1rem' }}>{row.completed}</td>
                  <td style={{ padding: '1rem' }}>{row.notStarted}</td>
                  <td style={{ padding: '1rem' }}>
                    <div className="flex items-center gap-2">
                      <div style={{ height: '6px', width: '60px', background: 'var(--border-light)', borderRadius: '3px', overflow: 'hidden' }}>
                         <div style={{ width: row.completion, height: '100%', background: 'var(--status-green)' }}></div>
                      </div>
                      <span className="text-xs">{row.completion}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ color: 'var(--status-green)', fontWeight: 600, fontSize: '0.75rem' }}>{row.status}</span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{row.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
