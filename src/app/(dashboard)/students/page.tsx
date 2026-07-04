import React from 'react';
import { Search, Filter, Download, Users, CheckCircle2, XCircle, Building2, MoreVertical, User } from 'lucide-react';

export default function StudentsPage() {
  const tableData = [
    { id: 1, name: 'Aarav Sharma', apaar: 'APAAR12345678901', gender: 'Male', grade: 'Grade 3', section: 'A', school: 'Kendriya Vidyalaya No. 1', udise: '12345678901', coordinator: 'Rajesh Kumar', status: 'Present' },
    { id: 2, name: 'Ananya Singh', apaar: 'APAAR12345678902', gender: 'Female', grade: 'Grade 3', section: 'A', school: 'Kendriya Vidyalaya No. 1', udise: '12345678901', coordinator: 'Rajesh Kumar', status: 'Present' },
    { id: 3, name: 'Vivaan Patel', apaar: 'APAAR12345678903', gender: 'Male', grade: 'Grade 3', section: 'A', school: 'Kendriya Vidyalaya No. 1', udise: '12345678901', coordinator: 'Rajesh Kumar', status: 'Absent' },
    { id: 4, name: 'Diya Verma', apaar: 'APAAR12345678904', gender: 'Female', grade: 'Grade 3', section: 'B', school: 'Kendriya Vidyalaya No. 1', udise: '12345678901', coordinator: 'Rajesh Kumar', status: 'Present' },
    { id: 5, name: 'Reyansh Gupta', apaar: 'APAAR12345678905', gender: 'Male', grade: 'Grade 5', section: 'A', school: 'Kendriya Vidyalaya No. 2', udise: '12345678902', coordinator: 'Sunita Sharma', status: 'Present' }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Students</h1>
          <p className="text-muted text-sm">View and manage all students across schools.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-light)' }} />
            <input 
              type="text" 
              placeholder="Search by name, APAAR ID or UDISE..." 
              style={{ padding: '8px 12px 8px 36px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.875rem', width: '280px' }}
            />
          </div>
          <button className="btn btn-outline">
            <Filter size={16} /> Filters
          </button>
          <button className="btn btn-outline">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4" style={{ gap: '1.5rem' }}>
        <div className="card flex items-center gap-4 py-4">
          <div style={{ padding: '12px', background: 'var(--status-blue-bg)', color: 'var(--primary-purple)', borderRadius: '50%' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="text-muted text-sm font-medium">Total Students</div>
            <div className="font-bold" style={{ fontSize: '1.5rem' }}>18,92,456</div>
          </div>
        </div>
        
        <div className="card flex items-center gap-4 py-4">
          <div style={{ padding: '12px', background: 'var(--status-green-bg)', color: 'var(--status-green)', borderRadius: '50%' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="text-muted text-sm font-medium">Students Present</div>
            <div className="font-bold" style={{ fontSize: '1.5rem' }}>16,45,231</div>
            <div style={{ color: 'var(--status-green)', fontSize: '0.75rem', fontWeight: 600 }}>86.93%</div>
          </div>
        </div>

        <div className="card flex items-center gap-4 py-4">
          <div style={{ padding: '12px', background: 'var(--status-red-bg)', color: 'var(--status-red)', borderRadius: '50%' }}>
            <XCircle size={24} />
          </div>
          <div>
            <div className="text-muted text-sm font-medium">Students Absent</div>
            <div className="font-bold" style={{ fontSize: '1.5rem' }}>2,47,225</div>
            <div style={{ color: 'var(--status-red)', fontSize: '0.75rem', fontWeight: 600 }}>13.07%</div>
          </div>
        </div>

        <div className="card flex items-center gap-4 py-4">
          <div style={{ padding: '12px', background: 'var(--status-blue-bg)', color: 'var(--status-blue)', borderRadius: '50%' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div className="text-muted text-sm font-medium">Schools Aligned</div>
            <div className="font-bold" style={{ fontSize: '1.5rem' }}>1,257</div>
          </div>
        </div>
      </div>

      {/* Filter Options */}
      <div className="card flex justify-between items-end">
        <div className="flex gap-4" style={{ flex: 1 }}>
          <div style={{ flex: 1 }}>
            <label className="text-sm font-medium text-muted block mb-2">Region</label>
            <select style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <option>All Regions</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="text-sm font-medium text-muted block mb-2">Aligned School</label>
            <select style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <option>All Schools</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="text-sm font-medium text-muted block mb-2">Grade</label>
            <select style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <option>All Grades</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="text-sm font-medium text-muted block mb-2">Section</label>
            <select style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <option>All Sections</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 ml-6">
           <button className="btn btn-outline" style={{ padding: '8px 16px' }}>Clear</button>
           <button className="btn btn-primary" style={{ padding: '8px 16px' }}><Filter size={16} /> Apply Filters</button>
        </div>
      </div>

      {/* Table Section */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Student List</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>S. No.</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Student Name</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>APAAR ID</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Gender</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Grade</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Section</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Aligned School</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>UDISE Code</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Coordinator</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{row.id}</td>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{row.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{row.apaar}</td>
                  <td style={{ padding: '1rem' }}>
                    <div className="flex items-center gap-2">
                       <User size={14} color={row.gender === 'Male' ? 'var(--status-blue)' : 'var(--status-red)'} /> 
                       {row.gender}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{row.grade}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{row.section}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{row.school}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{row.udise}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{row.coordinator}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      color: row.status === 'Present' ? 'var(--status-green)' : 'var(--status-red)',
                      background: row.status === 'Present' ? 'var(--status-green-bg)' : 'var(--status-red-bg)',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {row.status}
                    </span>
                  </td>
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
          <div className="text-sm text-muted">Showing 1 to 10 of 18,92,456 students</div>
          <div className="flex gap-2">
             <button className="btn btn-outline" style={{ padding: '4px 8px' }}>&lt;</button>
             <button className="btn btn-primary" style={{ padding: '4px 12px' }}>1</button>
             <button className="btn btn-outline" style={{ padding: '4px 12px' }}>2</button>
             <button className="btn btn-outline" style={{ padding: '4px 12px' }}>3</button>
             <span style={{ padding: '4px' }}>...</span>
             <button className="btn btn-outline" style={{ padding: '4px 12px' }}>189246</button>
             <button className="btn btn-outline" style={{ padding: '4px 8px' }}>&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
