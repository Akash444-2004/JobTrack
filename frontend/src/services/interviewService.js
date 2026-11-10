import api from './api';

export const interviewService = {
  createInterview: async (applicationId, payload) => {
    const { data } = await api.post(`/applications/${applicationId}/interviews`, payload);
    return data;
  },

  getInterviewsByApplication: async (applicationId) => {
    const { data } = await api.get(`/applications/${applicationId}/interviews`);
    return data;
  },

  getAllInterviews: async (outcome) => {
    const params = outcome ? { outcome } : {};
    const { data } = await api.get('/interviews', { params });
    return data;
  },

  updateInterview: async (id, payload) => {
    const { data } = await api.put(`/interviews/${id}`, payload);
    return data;
  },

  deleteInterview: async (id) => {
    await api.delete(`/interviews/${id}`);
  },
};
