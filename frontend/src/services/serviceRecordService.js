/**
 * Service & Maintenance Record Service
 * Handles maintenance tickets and repair lifecycle
 */

import { mockApi, request } from './api';

export const serviceRecordService = {
  async getServiceRecords(params = {}) {
    const query = new URLSearchParams();
    if (params.asset_id) query.append('asset_id', params.asset_id);
    if (params.status) query.append('status', params.status);
    if (params.skip !== undefined) query.append('skip', params.skip);
    if (params.limit !== undefined) query.append('limit', params.limit);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(
      `/service-records${queryString}`,
      { method: 'GET' },
      () => mockApi.getServiceRecords(params)
    );
  },

  async getServiceRecord(id) {
    return request(
      `/service-records/${id}`,
      { method: 'GET' },
      () => mockApi.getServiceRecord(id)
    );
  },

  async createServiceRecord(data) {
    return request(
      '/service-records',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      () => mockApi.createServiceRecord(data)
    );
  },

  async updateServiceRecord(id, data, returnAssetToAvailable = false) {
    const query = returnAssetToAvailable
      ? '?return_asset_to_available=true'
      : '';
    return request(
      `/service-records/${id}${query}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      () => mockApi.updateServiceRecord(id, data, returnAssetToAvailable)
    );
  },

  async deleteServiceRecord(id) {
    return request(
      `/service-records/${id}`,
      { method: 'DELETE' },
      () => mockApi.deleteServiceRecord(id)
    );
  },
};
