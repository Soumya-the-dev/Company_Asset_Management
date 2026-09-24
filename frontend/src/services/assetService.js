/**
 * Asset Service
 * Handles communication with /assets endpoints
 */

import { mockApi, request } from './api';

export const assetService = {
  async getAssets(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.asset_type) query.append('asset_type', params.asset_type);
    if (params.category) query.append('category', params.category);
    if (params.skip !== undefined) query.append('skip', params.skip);
    if (params.limit !== undefined) query.append('limit', params.limit);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(
      `/assets${queryString}`,
      { method: 'GET' },
      () => mockApi.getAssets(params)
    );
  },

  async getAsset(id) {
    return request(
      `/assets/${id}`,
      { method: 'GET' },
      () => mockApi.getAsset(id)
    );
  },

  async getAssetHistory(assetId) {
    return request(
      `/assets/${assetId}/history`,
      { method: 'GET' },
      () => mockApi.getAssetHistory(assetId)
    );
  },

  async createAsset(data) {
    return request(
      '/assets',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      () => mockApi.createAsset(data)
    );
  },

  async updateAsset(id, data) {
    return request(
      `/assets/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      () => mockApi.updateAsset(id, data)
    );
  },

  async deleteAsset(id) {
    return request(
      `/assets/${id}`,
      { method: 'DELETE' },
      () => mockApi.deleteAsset(id)
    );
  },

  async getDashboardStats() {
    return request(
      '/stats',
      { method: 'GET' },
      () => mockApi.getStats()
    );
  },
};
