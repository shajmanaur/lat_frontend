'use client';
import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, ClipboardList, Edit3, CheckCircle2, AlertCircle, FileSearch, ArrowUp } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { regionsApi, coordinatorsApi, omrApi, schoolsApi } from '@/services/api';

export default function OMREntryStatusPage() {
  const [isFiltered, setIsFiltered] = useState(false);
  const [regions, setRegions] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);

  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedUdise, setSelectedUdise] = useState('');
  const [selectedExam, setSelectedExam] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const regRes = await regionsApi.getRegions();
      if (regRes.status === true || regRes.response?.status === 'success') {
        setRegions(regRes.response ? regRes.response.data : regRes.data);
      }
      const assessRes = await omrApi.getAssessments();
      if (assessRes.status === true || assessRes.response?.status === 'success') {
        setAssessments(assessRes.response ? assessRes.response.data : assessRes.data);
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const handleRegionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionId = e.target.value;
    setSelectedRegion(regionId);
    setSelectedUdise(''); // Reset school selection
    if (regionId) {
      try {
        const schRes = await schoolsApi.getSchoolsByRegion(regionId);
        if (schRes.status === true || schRes.response?.status === 'success') {
          setSchools(schRes.response ? schRes.response.data : schRes.data);
        }
      } catch (error) {
        console.error('Error fetching schools:', error);
      }
    } else {
      setSchools([]);
    }
  };

  const handleApplyFilters = async () => {
    if (!selectedUdise && !selectedExam) {
      alert('Please enter a UDISE Code or select an Exam');
      return;
    }

    setIsLoading(true);
    try {
      const res = await omrApi.getEntryStatus(selectedUdise);
      if (res.status === true || res.response?.status === 'success') {
        setStatsData(res.response ? res.response.data : res.data);
        setIsFiltered(true);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      alert('Failed to fetch OMR status data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedRegion('');
    setSchools([]);
    setSelectedUdise('');
    setIsFiltered(false);
    setStatsData(null);
  };

  const pieData = statsData ? [
    { name: 'Completed', value: statsData.completed, color: '#10B981' },
    { name: 'In Progress', value: statsData.inProgress, color: '#3B82F6' },
    { name: 'Not Started', value: statsData.notStarted, color: '#F59E0B' },
  ] : [];

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
            <select
              value={selectedRegion}
              onChange={handleRegionChange}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <option value="">Select Region</option>
              {regions.map((r: any) => (
                <option key={r.region_id} value={r.region_id}>{r.region_name}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="text-sm font-medium text-muted block mb-2">School</label>
            <select
              value={selectedUdise}
              onChange={(e) => setSelectedUdise(e.target.value)}
              disabled={!selectedRegion}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <option value="">Select School</option>
              {schools.map((s: any) => (
                <option key={s.udise_code} value={s.udise_code}>{s.school_name} ({s.udise_code})</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="text-sm font-medium text-muted block mb-2">Exam</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <option value="">Select Exam</option>
              {assessments.map((a: any) => (
                <option key={a.assessment_id} value={a.assessment_id}>{a.assessment_name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3 ml-6">
          <button onClick={handleClearFilters} className="btn btn-outline" style={{ padding: '8px 16px' }}>Clear</button>
          <button onClick={handleApplyFilters} disabled={isLoading} className="btn btn-primary" style={{ padding: '8px 16px' }}>
            <Filter size={16} /> {isLoading ? 'Loading...' : 'Apply Filters'}
          </button>
        </div>
      </div>

      {!isFiltered || !statsData ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 mt-8">
          <div className="relative mb-6">
            <div style={{ background: '#EEF2FF', borderRadius: '50%', padding: '3rem' }}>
              <FileSearch size={64} color="#5338F5" strokeWidth={1.5} />
            </div>
            <div style={{ position: 'absolute', top: '-40px', right: '-60px', opacity: 0.5, transform: 'rotate(-15deg)' }}>
              <ArrowUp size={48} color="#5338F5" strokeWidth={1} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>No data to display</h2>
          <p className="text-muted text-sm">Please select the filters above to view OMR entry status.</p>
        </div>
      ) : (
        /* Filled State */
        <>
          <div className="text-sm">
            <strong>UDISE Code: {selectedUdise || 'All'}</strong>
            <div className="text-muted mt-1">Schools Aligned: {statsData.alignedSchools?.length || 0}</div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4" style={{ gap: '1.5rem' }}>
            <div className="card flex items-center gap-4 py-4" style={{ background: '#F8FAFC' }}>
              <div style={{ padding: '12px', background: 'var(--status-blue-bg)', color: 'var(--primary-purple)', borderRadius: '50%' }}>
                <ClipboardList size={24} />
              </div>
              <div>
                <div className="text-muted text-sm font-medium">Total OMR Expected</div>
                <div className="font-bold" style={{ fontSize: '1.5rem' }}>{statsData.expected.toLocaleString('en-IN')}</div>
                <div className="text-xs text-muted">100%</div>
              </div>
            </div>

            <div className="card flex items-center gap-4 py-4 border-l-4" style={{ borderLeftColor: 'var(--status-blue)' }}>
              <div style={{ padding: '12px', border: '1px solid var(--status-blue)', color: 'var(--status-blue)', borderRadius: '50%' }}>
                <Edit3 size={24} />
              </div>
              <div>
                <div className="text-muted text-sm font-medium">OMR Entry In Progress</div>
                <div className="font-bold" style={{ fontSize: '1.5rem' }}>{statsData.inProgress.toLocaleString('en-IN')}</div>
                <div style={{ color: 'var(--status-blue)', fontSize: '0.75rem', fontWeight: 600 }}>
                  {statsData.expected ? ((statsData.inProgress / statsData.expected) * 100).toFixed(2) : 0}%
                </div>
              </div>
            </div>

            <div className="card flex items-center gap-4 py-4 border-l-4" style={{ borderLeftColor: 'var(--status-green)' }}>
              <div style={{ padding: '12px', border: '1px solid var(--status-green)', color: 'var(--status-green)', borderRadius: '50%' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className="text-muted text-sm font-medium">OMR Entry Completed</div>
                <div className="font-bold" style={{ fontSize: '1.5rem' }}>{statsData.completed.toLocaleString('en-IN')}</div>
                <div style={{ color: 'var(--status-green)', fontSize: '0.75rem', fontWeight: 600 }}>
                  {statsData.expected ? ((statsData.completed / statsData.expected) * 100).toFixed(2) : 0}%
                </div>
              </div>
            </div>

            <div className="card flex items-center gap-4 py-4 border-l-4" style={{ borderLeftColor: 'var(--status-orange)' }}>
              <div style={{ padding: '12px', border: '1px solid var(--status-orange)', color: 'var(--status-orange)', borderRadius: '50%' }}>
                <AlertCircle size={24} />
              </div>
              <div>
                <div className="text-muted text-sm font-medium">Not Started</div>
                <div className="font-bold" style={{ fontSize: '1.5rem' }}>{statsData.notStarted.toLocaleString('en-IN')}</div>
                <div style={{ color: 'var(--status-orange)', fontSize: '0.75rem', fontWeight: 600 }}>
                  {statsData.expected ? ((statsData.notStarted / statsData.expected) * 100).toFixed(2) : 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
            <div className="card flex flex-col">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Overall Progress</h3>
              <div className="flex-1 flex flex-col justify-center items-center">
                <div style={{ width: '100%', height: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value: number) => value.toLocaleString('en-IN')} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-col gap-3 text-sm w-full mt-4 px-4">
                  <div className="flex justify-between gap-4"><span style={{ color: 'var(--status-green)' }}>●</span> Completed <span className="font-bold">{statsData.completed.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between gap-4"><span style={{ color: 'var(--status-blue)' }}>●</span> In Progress <span className="font-bold">{statsData.inProgress.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between gap-4"><span style={{ color: 'var(--status-orange)' }}>●</span> Not Started <span className="font-bold">{statsData.notStarted.toLocaleString('en-IN')}</span></div>
                </div>
              </div>
            </div>

            <div className="card flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 style={{ fontSize: '1.1rem' }}>Progress Trend (Last 7 Days)</h3>
                <select style={{ padding: '4px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <option>Last 7 Days</option>
                </select>
              </div>

              <div style={{ flex: 1, minHeight: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={statsData.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary-purple)" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="var(--primary-purple)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [value, 'Responses']}
                    />
                    <Line type="monotone" dataKey="value" stroke="var(--primary-purple)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary-purple)', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
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
                  {statsData.alignedSchools?.map((row: any) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{row.id}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{row.udise}</td>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>{row.school}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{row.coordinator}</td>
                      <td style={{ padding: '1rem' }}>{row.expected.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '1rem' }}>{row.inProgress.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '1rem' }}>{row.completed.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '1rem' }}>{row.notStarted.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '1rem' }}>
                        <div className="flex items-center gap-2">
                          <div style={{ height: '6px', width: '60px', background: 'var(--border-light)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: row.completion, height: '100%', background: 'var(--status-green)' }}></div>
                          </div>
                          <span className="text-xs">{row.completion}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          color: row.status === 'Completed' ? 'var(--status-green)' : (row.status === 'In Progress' ? 'var(--status-blue)' : 'var(--status-orange)'),
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{row.updated}</td>
                    </tr>
                  ))}

                  {statsData.alignedSchools?.length === 0 && (
                    <tr>
                      <td colSpan={11} className="text-center py-8 text-muted">No aligned schools found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
