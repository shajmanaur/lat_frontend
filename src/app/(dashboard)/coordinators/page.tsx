import React from 'react';
import { Search, Filter, Calendar, UploadCloud, Download, MoreVertical, Users, UserCheck, UserX } from 'lucide-react';

export default function CoordinatorsPage() {
  const tableData = [
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh.kumar@kvs.gov.in', mobile: '9876543210', udise: '12345678901', school: 'Kendriya Vidyalaya No. 1', region: 'North Region', status: 'Active', imported: '20 May 2025, 10:30 AM' },
    { id: 2, name: 'Sunita Sharma', email: 'sunita.sharma@kvs.gov.in', mobile: '9876543211', udise: '12345678902', school: 'Kendriya Vidyalaya No. 2', region: 'East Region', status: 'Active', imported: '20 May 2025, 10:30 AM' },
    { id: 3, name: 'Amit Verma', email: 'amit.verma@kvs.gov.in', mobile: '9876543212', udise: '12345678903', school: 'Kendriya Vidyalaya No. 3', region: 'West Region', status: 'Active', imported: '20 May 2025, 10:30 AM' },
    { id: 4, name: 'Neha Gupta', email: 'neha.gupta@kvs.gov.in', mobile: '9876543213', udise: '12345678904', school: 'Kendriya Vidyalaya No. 4', region: 'South Region', status: 'Active', imported: '20 May 2025, 10:30 AM' },
    { id: 5, name: 'Vikram Singh', email: 'vikram.singh@kvs.gov.in', mobile: '9876543214', udise: '12345678905', school: 'Kendriya Vidyalaya No. 5', region: 'North Region', status: 'Inactive', imported: '20 May 2025, 10:30 AM' }
  ];

  return (
    <div className="flex flex-col gap-6">
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
          <button className="btn btn-outline">
            <Filter size={16} /> Filters
          </button>
          <button className="btn btn-outline">
            <Calendar size={16} /> LAT 2025
          </button>
        </div>
      </div>

      {/* Upload & Stats */}
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Upload Card */}
        <div className="card flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div style={{ padding: '12px', background: 'var(--status-blue-bg)', color: 'var(--primary-purple)', borderRadius: 'var(--radius-md)' }}>
              <UploadCloud size={24} />
            </div>
            <div>
              <div className="font-bold">Upload Coordinator Excel</div>
              <div className="text-muted text-sm mt-1">Upload the Excel file received from KVS to add or update coordinators in the system.</div>
            </div>
          </div>
          <div className="flex flex-col gap-2 ml-4">
            <button className="btn btn-primary" style={{ padding: '6px 16px' }}><UploadCloud size={16}/> Upload Excel</button>
            <button style={{ color: 'var(--primary-purple)', fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
              <Download size={14} /> Download Template
            </button>
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
              {tableData.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{row.id}</td>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{row.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{row.email}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{row.mobile}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{row.udise}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{row.school}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{row.region}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      color: row.status === 'Active' ? 'var(--status-green)' : 'var(--status-red)', 
                      fontWeight: 500
                    }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{row.imported}</td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                    <button style={{ color: 'var(--primary-purple)' }}><MoreVertical size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-light)' }}>
          <div className="text-sm text-muted">Showing 1 to 5 of 12,742 coordinators</div>
          <div className="flex gap-2">
             <button className="btn btn-outline" style={{ padding: '4px 8px' }}>&lt;</button>
             <button className="btn btn-primary" style={{ padding: '4px 12px' }}>1</button>
             <button className="btn btn-outline" style={{ padding: '4px 12px' }}>2</button>
             <button className="btn btn-outline" style={{ padding: '4px 12px' }}>3</button>
             <span style={{ padding: '4px' }}>...</span>
             <button className="btn btn-outline" style={{ padding: '4px 12px' }}>1275</button>
             <button className="btn btn-outline" style={{ padding: '4px 8px' }}>&gt;</button>
          </div>
        </div>
      </div>

    </div>
  );
}
