/**
 * Employee Service
 * Handles communication with /employees endpoints
 */

import { mockApi, request } from './api';

export const employeeService = {
  async getEmployees(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.department) query.append('department', params.department);
    if (params.skip !== undefined) query.append('skip', params.skip);
    if (params.limit !== undefined) query.append('limit', params.limit);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(
      `/employees${queryString}`,
      { method: 'GET' },
      () => mockApi.getEmployees(params)
    );
  },

  async getEmployee(id) {
    return request(
      `/employees/${id}`,
      { method: 'GET' },
      () => mockApi.getEmployee(id)
    );
  },

  async createEmployee(data) {
    return request(
      '/employees',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      () => mockApi.createEmployee(data)
    );
  },

  async updateEmployee(id, data) {
    return request(
      `/employees/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      () => mockApi.updateEmployee(id, data)
    );
  },

  async deleteEmployee(id) {
    return request(
      `/employees/${id}`,
      { method: 'DELETE' },
      () => mockApi.deleteEmployee(id)
    );
  },
};
