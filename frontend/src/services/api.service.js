// This file should be placed in the frontend/src/services directory

const API_URL = '/api';

// Helper function for handling fetch responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    const error = (data && data.message) || response.statusText;
    return Promise.reject(error);
  }
  
  return data;
};

// User related API calls
export const userService = {
  // Create a new user (faculty member)
  async createUser(userData) {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    return handleResponse(response);
  },
  
  // Get user by netId
  async getUserByNetId(netId) {
    const response = await fetch(`${API_URL}/users/netid/${netId}`);
    return handleResponse(response);
  }
};

// Report related API calls
export const reportService = {
  // Get all reports for a user
  async getUserReports(userId) {
    const response = await fetch(`${API_URL}/reports/user/${userId}`);
    return handleResponse(response);
  },
  
  // Get a specific report
  async getReport(reportId) {
    const response = await fetch(`${API_URL}/reports/${reportId}`);
    return handleResponse(response);
  },
  
  // Create a new report
  async createReport(reportData) {
    const response = await fetch(`${API_URL}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    });
    
    return handleResponse(response);
  },
  
  // Submit teaching data
  async submitTeachingData(reportId, teachingData) {
    const response = await fetch(`${API_URL}/reports/${reportId}/teaching`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teachingData),
    });
    
    return handleResponse(response);
  },
  
  // Submit research data
  async submitResearchData(reportId, researchData) {
    const response = await fetch(`${API_URL}/reports/${reportId}/research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(researchData),
    });
    
    return handleResponse(response);
  },
  
  // Submit service data
  async submitServiceData(reportId, serviceData) {
    const response = await fetch(`${API_URL}/reports/${reportId}/service`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serviceData),
    });
    
    return handleResponse(response);
  },
  
  // Submit the complete report
  async submitReport(reportId) {
    const response = await fetch(`${API_URL}/reports/${reportId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse(response);
  }
};