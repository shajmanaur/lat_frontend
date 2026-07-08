'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Download, RefreshCw } from 'lucide-react';
import { reportsApi, NationalReport, RegionRank } from '../../../services/reportsApi';

const PURPLE = '#4C35E6';
const r1 = (n: any) => (Math.round((Number(n) || 0) * 10) / 10).toFixed(1);
/** "A, B and C" — last item joined with "and", matching the PDF. */
const andJoin = (items: any[]) => {
  const arr = (items ?? []).map(String).filter(Boolean);
  return arr.length <= 1 ? arr.join('') : `${arr.slice(0, -1).join(', ')} and ${arr[arr.length - 1]}`;
};
const pctColor = (p: number) => (p >= 60 ? '#16a34a' : p >= 45 ? '#d97706' : '#dc2626');

function RankBars({ rows }: { rows: RegionRank[] }) {
  if (!rows?.length) return <div className="text-muted text-sm">No data yet.</div>;
  const max = Math.max(10, ...rows.map((r) => r.avgPct));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {rows.map((r) => (
        <div key={r.regionName} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 150, fontSize: '0.8125rem', fontWeight: 600 }}>
            {r.regionName}
            {r.students != null && <span className="text-muted" style={{ fontWeight: 400 }}> ({r.students})</span>}
          </div>
          <div style={{ flex: 1, background: '#F1F5F9', borderRadius: 6, height: 20, position: 'relative' }}>
            <div style={{ width: `${Math.min(100, (r.avgPct / max) * 100)}%`, background: PURPLE, height: '100%', borderRadius: 6 }} />
            <span style={{ position: 'absolute', right: 8, top: 1, fontSize: '0.72rem', fontWeight: 700 }}>{r1(r.avgPct)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="card" style={{ borderRadius: 20, boxShadow: 'var(--shadow-card)', padding: 24, background: 'white' }}>{children}</div>;
}

export default function NationalReportPage() {
  const [assessment, setAssessment] = useState('LAT January 2026');
  const [date, setDate] = useState('30th January 2026');
  const [report, setReport] = useState<NationalReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 8000);
  };

  /** Loads the last generated snapshot (instant). refresh=true regenerates
   *  from the live data — takes ~10 minutes — so it asks the user first. */
  const generate = async (refresh = false) => {
    if (refresh && !window.confirm(
      'Regenerate the report from the latest data?\n\nThis re-reads all student responses and takes around 10 minutes. ' +
      'You can keep using the app — we will notify you here when it is ready.',
    )) return;
    setLoading(true);
    setError(null);
    try {
      setReport(await reportsApi.getNationalReport({ assessment, date: date || undefined }, refresh));
      if (refresh) notify('Report regenerated with the latest data.');
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const [pdfStatus, setPdfStatus] = useState<string>('');
  const [wordDownloading, setWordDownloading] = useState(false);
  const download = async () => {
    setDownloading(true);
    setPdfStatus('starting');
    try {
      await reportsApi.generateNationalPdf({ assessment, date: date || undefined }, (s) => setPdfStatus(s));
      notify('PDF downloaded — check your browser downloads.');
    } catch (e: any) {
      alert(e?.message || 'Could not generate the PDF. Check that the backend is running.');
    } finally {
      setDownloading(false);
      setPdfStatus('');
    }
  };
  const downloadWord = async () => {
    setWordDownloading(true);
    try {
      await reportsApi.generateNationalDocx({ assessment, date: date || undefined });
      notify('Word document downloaded — check your browser downloads.');
    } catch (e: any) {
      alert(e?.message || 'Could not generate the Word document. Check that the backend is running.');
    } finally {
      setWordDownloading(false);
    }
  };

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const s = report?.summary;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000, background: '#111827', color: '#fff',
          padding: '12px 18px', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,.25)', fontSize: '0.875rem', maxWidth: 360,
        }}>
          {toast}
        </div>
      )}
      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={20} /> National Report
          </h1>
          <p className="text-muted text-sm mt-1">Region- and competency-wise LAT performance, generated live from the database.</p>
        </div>
        <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
          <input value={assessment} onChange={(e) => setAssessment(e.target.value)} placeholder="Assessment name"
            style={{ padding: '10px 12px', borderRadius: 12, border: '1px solid var(--border-light)', fontSize: '0.875rem', minWidth: 170 }} />
          <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="Date of test"
            style={{ padding: '10px 12px', borderRadius: 12, border: '1px solid var(--border-light)', fontSize: '0.875rem', minWidth: 150 }} />
          <button onClick={() => generate(true)} disabled={loading} className="btn btn-outline"
            title="Regenerates the report from the latest data (~10 minutes)"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: 'white' }}>
            <RefreshCw size={16} /> {loading ? 'Working…' : 'Refresh Data'}
          </button>
          <button onClick={download} disabled={downloading || !report} className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, opacity: downloading ? 0.7 : 1 }}>
            <Download size={16} /> {downloading ? (pdfStatus === 'ready' ? 'Downloading…' : 'Generating PDF…') : 'Download PDF'}
          </button>
          <button onClick={downloadWord} disabled={wordDownloading || !report} className="btn btn-outline"
            title="Same report as an editable Word document"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: 'white', opacity: wordDownloading ? 0.7 : 1 }}>
            <FileText size={16} /> {wordDownloading ? 'Generating Word…' : 'Download Word'}
          </button>
        </div>
      </div>

      {error && <Card><div style={{ color: '#B91C1C', fontWeight: 600 }}>{error}</div></Card>}
      {loading && !report && <Card>Loading report…</Card>}

      {report && s && (
        <>
          <Card>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{report.meta.sessionName}</div>
            {report.meta.reportDate && <div className="text-muted text-sm">Date of Test: {report.meta.reportDate}</div>}
            {report.meta.generatedAt && (
              <div className="text-muted" style={{ fontSize: '0.72rem', marginTop: 2 }}>
                Data as of {new Date(report.meta.generatedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} — use “Refresh Data” to regenerate from the latest responses.
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginTop: 20 }}>
              {[
                { label: 'Regions Participated', value: s.regionsParticipated },
                { label: 'Schools Participated', value: s.schools },
                { label: 'Students Participated', value: s.totalStudents },
                { label: 'National Average', value: `${r1(report.overall.nationalAvgPct)}%` },
              ].map((m) => (
                <div key={m.label} style={{ background: '#F8FAFC', borderRadius: 12, padding: 16 }}>
                  <div className="text-muted text-xs">{m.label}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 4 }}>{m.value}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {report.grades.map((g) => (
                <div key={g.gradeId} style={{ fontSize: '0.8125rem' }}>
                  <span style={{ fontWeight: 700 }}>{g.gradeName}:</span>{' '}
                  <span className="text-muted">{andJoin(s.subjectsByGrade?.[g.gradeId] ?? [])}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 12 }}>Part A.1 — Overall Score (Region-wise)</h2>
            <RankBars rows={report.overall.regions} />
          </Card>

          {report.grades.map((g) => (
            <Card key={g.gradeId}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                {g.gradeName}{' '}
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: pctColor(g.nationalAvgPct) }}>{r1(g.nationalAvgPct)}%</span>
                <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 400 }}> · {g.students} students</span>
              </h2>
              <div style={{ marginTop: 10, marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 6 }}>Overall (Region-wise)</div>
                <RankBars rows={g.regionRanking} />
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {g.subjects.map((sub) => (
                  <div key={sub.subjectName} style={{ background: '#F8FAFC', borderRadius: 10, padding: '10px 14px', minWidth: 150 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{sub.subjectName}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: pctColor(sub.nationalAvgPct) }}>{r1(sub.nationalAvgPct)}%</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>{sub.competencies.length} competenc{sub.competencies.length === 1 ? 'y' : 'ies'}</div>
                  </div>
                ))}
              </div>
            </Card>
          ))}

          <div className="text-muted text-xs" style={{ textAlign: 'right' }}>
            Full charts, competency tables and annexures are in the downloadable PDF.
          </div>
        </>
      )}
    </div>
  );
}
