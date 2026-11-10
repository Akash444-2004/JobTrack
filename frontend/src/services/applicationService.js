import api from './api';

export const applicationService = {
  createApplication: async (payload) => {
    const { data } = await api.post('/applications', payload);
    return data;
  },

  getApplications: async (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
    );
    const { data } = await api.get('/applications', { params: cleanParams });
    return data;
  },

  searchApplications: async (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
    );
    const { data } = await api.get('/applications/search', { params: cleanParams });
    return data;
  },

  getApplicationById: async (id) => {
    const { data } = await api.get(`/applications/${id}`);
    return data;
  },

  updateApplication: async (id, payload) => {
    const { data } = await api.put(`/applications/${id}`, payload);
    return data;
  },

  updateApplicationStatus: async (id, status) => {
    const { data } = await api.patch(`/applications/${id}/status`, { status });
    return data;
  },

  deleteApplication: async (id) => {
    await api.delete(`/applications/${id}`);
  },
};
