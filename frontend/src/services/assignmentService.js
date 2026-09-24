/**
 * Assignment & Custody Service
 * Handles asset allocations, returns, and custody requests
 */

import { mockApi, request } from './api';

export const assignmentService = {
  async getAssignments(params = {}) {
    const query = new URLSearchParams();
    if (params.asset_id) query.append('asset_id', params.asset_id);
    if (params.employee_id) query.append('employee_id', params.employee_id);
    if (params.active_only !== undefined) query.append('active_only', params.active_only);
    if (params.skip !== undefined) query.append('skip', params.skip);
    if (params.limit !== undefined) query.append('limit', params.limit);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(
      `/assignments${queryString}`,
      { method: 'GET' },
      () => mockApi.getAssignments(params)
    );
  },

  async createAssignment(data) {
    return request(
      '/assignments',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      () => mockApi.createAssignment(data)
    );
  },

  async returnAssignment(assignmentId, data = {}) {
    return request(
      `/assignments/${assignmentId}/return`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      () => mockApi.returnAssignment(assignmentId, data)
    );
  },

  // Return Requests
  async getReturnRequests() {
    return request(
      '/return-requests',
      { method: 'GET' },
      () => mockApi.getReturnRequests()
    );
  },

  async createReturnRequest(data) {
    return request(
      '/return-requests',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      () => mockApi.createReturnRequest(data)
    );
  },

  async approveReturnRequest(id, condition = 'Good') {
    const query = condition ? `?condition_at_return=${encodeURIComponent(condition)}` : '';
    return request(
      `/return-requests/${id}/approve${query}`,
      { method: 'POST' },
      () => mockApi.approveReturnRequest(id, condition)
    );
  },

  async rejectReturnRequest(id, reason = '') {
    const query = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    return request(
      `/return-requests/${id}/reject${query}`,
      { method: 'POST' },
      () => mockApi.rejectReturnRequest(id, reason)
    );
  },
};
