import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiFormData = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
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

apiFormData.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

apiFormData.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (payload: any) => api.post('/auth/login', payload).then(res => res.data),
  getMe: () => api.get('/auth/me').then(res => res.data),
};

export const dashboardApi = {
  getStats: (params?: { regionId?: string; udise?: string; gradeId?: string; section?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.regionId) searchParams.append('regionId', params.regionId);
    if (params?.udise) searchParams.append('udise', params.udise);
    if (params?.gradeId) searchParams.append('gradeId', params.gradeId);
    if (params?.section) searchParams.append('section', params.section);
    const query = searchParams.toString();
    return api.get(`/dashboard/stats${query ? `?${query}` : ''}`).then(res => res.data);
  },
};

export const studentsApi = {
  getStudents: (params?: { page?: number; limit?: number; regionId?: string; udise?: string; gradeId?: string; section?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.limit) searchParams.append('limit', String(params.limit));
    if (params?.regionId) searchParams.append('regionId', params.regionId);
    if (params?.udise) searchParams.append('udise', params.udise);
    if (params?.gradeId) searchParams.append('gradeId', params.gradeId);
    if (params?.section) searchParams.append('section', params.section);
    if (params?.search) searchParams.append('search', params.search);
    const query = searchParams.toString();
    return api.get(`/students${query ? `?${query}` : ''}`).then(res => res.data);
  },
  getStudentById: (id: number) => api.get(`/students/${id}`).then(res => res.data),
  createStudent: (data: any) => api.post('/students', data).then(res => res.data),
  bulkCreateStudents: (data: any[]) => api.post('/students/bulk', { students: data }).then(res => res.data),
  updateStudent: (id: number, data: any) => api.put(`/students/${id}`, data).then(res => res.data),
  getSections: (udise?: string, gradeId?: string) => {
    const searchParams = new URLSearchParams();
    if (udise) searchParams.append('udise', udise);
    if (gradeId) searchParams.append('gradeId', gradeId);
    const query = searchParams.toString();
    return api.get(`/students/meta/sections${query ? `?${query}` : ''}`).then(res => res.data);
  },
};

export const omrStudentsApi = {
  getStudents: () => api.get('/omr/students').then(res => res.data),
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
  getQuestions: (grade: string, subject: string) => api.get(`/omr/questions?grade=${grade}&subject=${subject}`).then(res => res.data),
  getQuestionsForStudent: (studentId: number) => api.get(`/omr/questions/${studentId}`).then(res => res.data),
  getResponsesForStudent: (studentId: number) => api.get(`/omr/responses/${studentId}`).then(res => res.data),
  saveResponses: (payload: {
    student_id: number;
    teacher_id: number;
    responses: { question_id: number; selected_option: string }[];
    status: number;
  }) => api.post('/omr/save', payload).then(res => res.data),
  getAssessments: () => api.get('/omr/assessments').then(res => res.data),
  getEntryStatus: (params?: { udise?: string; regionId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.udise) searchParams.append('udise', params.udise);
    if (params?.regionId) searchParams.append('regionId', params.regionId);
    const query = searchParams.toString();
    return api.get(`/omr/entry-status${query ? `?${query}` : ''}`).then(res => res.data);
  },
  getEvaluationStatus: (params?: { udise?: string; regionId?: string; gradeId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.udise) searchParams.append('udise', params.udise);
    if (params?.regionId) searchParams.append('regionId', params.regionId);
    if (params?.gradeId) searchParams.append('gradeId', params.gradeId);
    const query = searchParams.toString();
    return api.get(`/omr/evaluation-status${query ? `?${query}` : ''}`).then(res => res.data);
  },
  runEvaluation: (udise: string) => api.post(`/omr/evaluate/${udise}`).then(res => res.data),
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiFormData.post('/omr/upload', formData).then(res => res.data);
  },
};

export const teacherOmrApi = {
  getSummary: () => api.get('/omr/teacher/summary').then(res => res.data),
  getGrades: () => api.get('/omr/teacher/grades').then(res => res.data),
  getStudents: (gradeId: number, section?: string, search?: string) => {
    const params = new URLSearchParams();
    if (section) params.append('section', section);
    if (search) params.append('search', search);
    const query = params.toString();
    return api.get(`/omr/teacher/grades/${gradeId}/students${query ? `?${query}` : ''}`).then(res => res.data);
  },
  submitGrade: (gradeId: number, section?: string) => {
    const body: any = {};
    if (section) body.section = section;
    return api.post(`/omr/teacher/grades/${gradeId}/submit`, body).then(res => res.data);
  },
};

export const rolesApi = {
  getRoles: async () => {
    const res = await api.get('/roles');
    return res.data;
  },
  getRoleById: async (id: string) => {
    const res = await api.get(`/roles/${id}`);
    return res.data;
  },
  createRole: async (payload: any) => {
    const res = await api.post('/roles', payload);
    return res.data;
  },
  updateRole: async (id: string, payload: any) => {
    const res = await api.patch(`/roles/${id}`, payload);
    return res.data;
  },
  deleteRole: async (id: string) => {
    const res = await api.delete(`/roles/${id}`);
    return res.data;
  },
};

export const regionsDetailApi = {
  getRegionById: async (id: string) => {
    const res = await api.get(`/regions/${id}`);
    return res.data;
  },
};

export const teachersApi = {
  getTeachers: async () => {
    const res = await api.get('/teachers');
    return res.data;
  },
  createTeacher: async (payload: any) => {
    const res = await api.post('/teachers', payload);
    return res.data;
  },
  updateTeacher: async (id: number, payload: any) => {
    const res = await api.put(`/teachers/${id}`, payload);
    return res.data;
  },
  toggleTeacherStatus: async (id: number) => {
    const res = await api.patch(`/teachers/${id}/status`);
    return res.data;
  },
  getGrades: async () => {
    const res = await api.get('/teachers/meta/grades');
    return res.data;
  },
  getSections: async (grade: string) => {
    const res = await api.get(`/teachers/meta/sections?grade=${grade}`);
    return res.data;
  },
  getAllocations: async () => {
    const res = await api.get('/teachers/allocations');
    return res.data;
  },
  allocateTeacher: async (payload: any) => {
    const res = await api.post('/teachers/allocations', payload);
    return res.data;
  },
};

export function romanToArabic(roman: string): string {
  if (!roman) return roman;
  const map: Record<string, string> = {
    'I': '1', 'II': '2', 'III': '3', 'IV': '4', 'V': '5',
    'VI': '6', 'VII': '7', 'VIII': '8', 'IX': '9', 'X': '10',
    'XI': '11', 'XII': '12',
  };
  const trimmed = roman.trim();
  if (map[trimmed]) return map[trimmed];
  return roman;
}

export function formatGradeName(grade: string): string {
  if (!grade) return grade;
  const match = grade.match(/^Grade\s+(.+)$/i);
  if (match) {
    return `Grade ${romanToArabic(match[1])}`;
  }
  return romanToArabic(grade);
}
