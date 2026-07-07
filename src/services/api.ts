import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const authApi = {
  login: (payload: any) => api.post('/auth/login', payload).then(res => res.data),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats').then(res => res.data),
};

export const studentsApi = {
  getStudents: (page = 1, limit = 10) => api.get(`/students?page=${page}&limit=${limit}`).then(res => res.data),
  getStudentById: (id: number) => api.get(`/students/${id}`).then(res => res.data),
};

export const menuApi = {
  getMyMenus: async () => {
    const res = await api.get('/menus/my-menus');
    return res.data;
  }
};

export const regionsApi = {
  getRegions: async () => {
    const res = await api.get('/regions');
    return res.data;
  }
};

export const schoolsApi = {
  getSchoolsByRegion: async (regionId: string) => {
    const res = await api.get(`/schools/region/${regionId}`);
    return res.data;
  }
};

export const coordinatorsApi = {
  getCoordinators: async () => {
    const res = await api.get('/coordinators');
    return res.data;
  },
  addSingleCoordinator: async (payload: any) => {
    const res = await api.post('/coordinators/single', payload);
    return res.data;
  },
  bulkUploadCoordinators: async (payload: any) => {
    const res = await api.post('/coordinators/bulk', payload);
    return res.data;
  },
  updateCoordinator: async (id: number, payload: any) => {
    const res = await api.put(`/coordinators/${id}`, payload);
    return res.data;
  },
  toggleCoordinatorStatus: async (id: number) => {
    const res = await api.patch(`/coordinators/${id}/status`);
    return res.data;
  }
};

export const omrApi = {
  getAssessments: () => api.get('/omr/assessments').then(res => res.data),
  getQuestions: (grade: string, subject: string) => api.get(`/omr/questions?grade=${grade}&subject=${subject}`).then(res => res.data),
  saveResponses: (payload: {
    student_id: number;
    teacher_id: number;
    responses: { question_id: number; selected_option: string }[];
    status: number;
  }) => api.post('/omr/save', payload).then(res => res.data),
  getEntryStatus: async (udiseCode?: string, regionId?: string) => {
    let url = '/omr/entry-status';
    const params = new URLSearchParams();
    if (udiseCode) params.append('udise', udiseCode);
    if (regionId) params.append('regionId', regionId);
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    const res = await api.get(url);
    return res.data;
  }
};
