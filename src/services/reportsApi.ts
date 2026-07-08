import axios from 'axios';

// Dedicated service for the LAT reports feature. Kept separate from the
// existing services/api.ts so nothing pre-existing is modified.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

export interface RegionRank {
  rank: number;
  regionName: string;
  avgPct: number;
  students?: number;
}
export interface Competency {
  code: string;
  description: string;
  nationalAvgPct: number;
  allRegions: { regionName: string; avgPct: number }[];
  top: { regionName: string; avgPct: number }[];
  bottom: { regionName: string; avgPct: number }[];
}
export interface SubjectBlock {
  subjectName: string;
  nationalAvgPct: number;
  regionRanking: RegionRank[];
  competencies: Competency[];
}
export interface GradeBlock {
  gradeId: number;
  gradeName: string;
  gradeNumber: number;
  students: number;
  nationalAvgPct: number;
  regionRanking: RegionRank[];
  subjects: SubjectBlock[];
}
export interface NationalReport {
  meta: { sessionName: string; sessionCode: string; reportDate: string; generatedAt?: string };
  summary: {
    regions: number;
    regionsParticipated: number;
    schools: number;
    grades: number[];
    totalStudents: number;
    studentsByGrade: Record<number, number>;
    subjectsByGrade: Record<number, string[]>;
  };
  overall: { nationalAvgPct: number; regions: RegionRank[] };
  grades: GradeBlock[];
  annexure: any[];
  schoolsByRegion: Record<string, any[]>;
}

export interface NationalReportParams {
  assessment?: string;
  date?: string;
}

function buildQuery(params: NationalReportParams = {}) {
  const qs = new URLSearchParams();
  if (params.assessment) qs.set('assessment', params.assessment);
  if (params.date) qs.set('date', params.date);
  return qs.toString();
}
function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const unwrap = (res: any) => res?.data?.response ?? res?.data;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const reportsApi = {
  /**
   * Returns the last generated report snapshot (instant). Pass refresh=true to
   * regenerate from the main tables — that aggregates ~16M responses and takes
   * several minutes, so only do it on explicit user request.
   */
  getNationalReport: async (params: NationalReportParams = {}, refresh = false): Promise<NationalReport> => {
    const qs = buildQuery(params) + (refresh ? '&refresh=1' : '');
    const res = await axios.get(`${API_URL}/reports/national?${qs}`, { headers: authHeaders(), timeout: 0 });
    return unwrap(res) as NationalReport;
  },

  /**
   * Generates the PDF in the background (so the click returns instantly),
   * polls until ready, then triggers a browser download. `onStatus` is called
   * with each status update ('pending' | 'ready' | 'error') for UI feedback.
   */
  generateNationalPdf: async (params: NationalReportParams = {}, onStatus?: (s: string) => void): Promise<void> => {
    return runExportJob('pdf', params, onStatus);
  },

  /** Same flow as the PDF, but produces the look-alike Word (.docx) document. */
  generateNationalDocx: async (params: NationalReportParams = {}, onStatus?: (s: string) => void): Promise<void> => {
    return runExportJob('docx', params, onStatus);
  },
};

/** Shared job flow: start → poll (restart-tolerant) → download blob. */
async function runExportJob(kind: 'pdf' | 'docx', params: NationalReportParams, onStatus?: (s: string) => void): Promise<void> {
  const label = kind === 'docx' ? 'Word document' : 'PDF';
  {
    const start = await axios.post(`${API_URL}/reports/national/${kind}/jobs?${buildQuery(params)}`, null, { headers: authHeaders() });
    const jobId: string = unwrap(start).jobId;
    onStatus?.('pending');

    // Poll status (up to ~30 minutes — a data refresh aggregates ~16M
    // responses, which takes several minutes) then download. Transient
    // network blips (e.g. the dev backend restarting) are tolerated for a
    // few polls instead of failing the whole download.
    let consecutiveFailures = 0;
    for (let i = 0; i < 900; i++) {
      await sleep(2000);
      let st: any;
      try {
        st = unwrap(await axios.get(`${API_URL}/reports/national/pdf/jobs/${jobId}`, { headers: authHeaders() }));
        consecutiveFailures = 0;
      } catch (e: any) {
        if (e?.response?.status === 404) {
          throw new Error(`The server restarted while generating the ${label} — please click Download again.`);
        }
        if (++consecutiveFailures >= 10) throw new Error(`Lost connection to the server while generating the ${label}.`);
        continue; // transient — keep polling
      }
      onStatus?.(st.status);
      if (st.status === 'ready') {
        const res = await axios.get(`${API_URL}/reports/national/pdf/jobs/${jobId}/download`, { headers: authHeaders(), responseType: 'blob' });
        const url = URL.createObjectURL(res.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = st.fileName || `National_Report_${(params.assessment || 'LAT').replace(/[^\w]+/g, '_')}.${kind}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        return;
      }
      if (st.status === 'error') throw new Error(st.error || `${label} generation failed`);
    }
    throw new Error(`${label} generation timed out`);
  }
}
