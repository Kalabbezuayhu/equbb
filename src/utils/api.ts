const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const api = {
  async getMembers() {
    const response = await fetch(`${API_BASE_URL}/members`);
    return response.json();
  },

  async getMemberById(id: number) {
    const response = await fetch(`${API_BASE_URL}/members/${id}`);
    return response.json();
  },

  async getContributions() {
    const response = await fetch(`${API_BASE_URL}/contributions`);
    return response.json();
  },

  async getContributionById(id: number) {
    const response = await fetch(`${API_BASE_URL}/contributions/${id}`);
    return response.json();
  },

  async getWinners() {
    const response = await fetch(`${API_BASE_URL}/winners`);
    return response.json();
  },

  async getChartData() {
    const response = await fetch(`${API_BASE_URL}/chart-data`);
    return response.json();
  },

  async getNotifications() {
    const response = await fetch(`${API_BASE_URL}/notifications`);
    return response.json();
  },

  async getStats() {
    const response = await fetch(`${API_BASE_URL}/stats`);
    return response.json();
  }
};
